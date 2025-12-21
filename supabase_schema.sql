-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- ROLES Enum
create type user_role as enum ('resident', 'restaurant', 'ngo', 'volunteer', 'admin');

-- PROFILES Table (Public data for users, linked to auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text not null,
  role user_role not null default 'resident',
  display_name text,
  full_name text,
  avatar_url text,
  bio text,
  location text,
  latitude float,
  longitude float,
  is_verified boolean default false,
  impact_score int default 0,
  meals_shared int default 0,
  phone_number text,
  organization_name text, -- For NGO/Restaurant
  license_number text, -- For Restaurant verification
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for Profiles
alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone."
  on public.profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on public.profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on public.profiles for update
  using ( auth.uid() = id );

-- LISTINGS Table (Food items)
create table public.listings (
  id uuid default uuid_generate_v4() primary key,
  donor_id uuid references public.profiles(id) not null,
  title text not null,
  description text,
  food_type text, -- e.g., 'Veg', 'Non-Veg', 'Bakery'
  quantity text, -- e.g., '5kg', '10 meals'
  expiry_date timestamp with time zone not null,
  pickup_window_start timestamp with time zone,
  pickup_window_end timestamp with time zone,
  image_url text,
  status text default 'available', -- available, booked, picked_up, expired
  latitude float, -- Cached location from donor profile
  longitude float,
  address text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for Listings
alter table public.listings enable row level security;

create policy "Listings are viewable by everyone."
  on public.listings for select
  using ( true );

create policy "Verified Donors can create listings."
  on public.listings for insert
  with check ( auth.uid() = donor_id );

create policy "Donors can update their listings."
  on public.listings for update
  using ( auth.uid() = donor_id );

-- PICKUPS Table (Transactions)
create table public.pickups (
  id uuid default uuid_generate_v4() primary key,
  listing_id uuid references public.listings(id) not null,
  volunteer_id uuid references public.profiles(id) not null, -- Who is picking it up (NGO or Volunteer)
  status text default 'pending', -- pending, confirmed, completed, cancelled
  pickup_time timestamp with time zone,
  completed_at timestamp with time zone,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for Pickups
alter table public.pickups enable row level security;

create policy "Pickups viewable by participants."
  on public.pickups for select
  using ( auth.uid() = volunteer_id or auth.uid() IN (select donor_id from public.listings where id = listing_id) );

create policy "Verified Users can request pickup."
  on public.pickups for insert
  with check ( auth.uid() = volunteer_id );

create policy "Participants can update pickup status."
  on public.pickups for update
  using ( auth.uid() = volunteer_id or auth.uid() IN (select donor_id from public.listings where id = listing_id) );

-- BITELINKS (Social Connections)
create table public.bite_links (
  follower_id uuid references public.profiles(id) not null,
  following_id uuid references public.profiles(id) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (follower_id, following_id)
);

alter table public.bite_links enable row level security;

create policy "Public links"
  on public.bite_links for select
  using ( true );

create policy "Users can follow others"
  on public.bite_links for insert
  with check ( auth.uid() = follower_id );

create policy "Users can unfollow"
  on public.bite_links for delete
  using ( auth.uid() = follower_id );

-- Storage Buckets (Images)
insert into storage.buckets (id, name)
values ('sharebite-assets', 'sharebite-assets')
on conflict do nothing;

create policy "Public Access"
  on storage.objects for select
  using ( bucket_id = 'sharebite-assets' );

create policy "Authenticated users can upload"
  on storage.objects for insert
  with check ( bucket_id = 'sharebite-assets' and auth.role() = 'authenticated' );

-- TRIGGERS
-- Function to handle new user signup -> create profile
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, display_name, full_name, role)
  values (
    new.id,
    new.email,
    split_part(new.email, '@', 1),
    new.raw_user_meta_data->>'full_name',
    COALESCE((new.raw_user_meta_data->>'role')::user_role, 'resident')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
