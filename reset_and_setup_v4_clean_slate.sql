-- MASTER RESET & SETUP V4 (Clean Slate)
-- -----------------------------------------------------------------------------
-- WARN: This script DROPS ALL DATA. Run only if you want a fresh start.
-- -----------------------------------------------------------------------------

-- 1. CLEANUP (Drop existing tables/functions to remove conflicts)
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();
drop function if exists public.request_pickup;
drop function if exists public.accept_pickup;
drop function if exists public.confirm_pickup;
drop function if exists public.complete_delivery;

drop table if exists public.bite_links cascade;
drop table if exists public.pickups cascade;
drop table if exists public.listings cascade;
drop table if exists public.notifications cascade;
drop table if exists public.profiles cascade;

-- 2. EXTENSIONS & TYPES
create extension if not exists "uuid-ossp";
drop type if exists user_role;
create type user_role as enum ('resident', 'restaurant', 'ngo', 'volunteer', 'admin');

-- 3. TABLES (With improved RLS built-in)

-- A. PROFILES
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text not null,
  role user_role not null default 'resident',
  display_name text,
  full_name text,
  avatar_url text,
  bio text,
  organization_name text,
  impact_score int default 0,
  meals_shared int default 0,
  is_verified boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.profiles enable row level security;
create policy "Public Profiles" on public.profiles for select using (true);
create policy "Self Update" on public.profiles for update using (auth.uid() = id);
create policy "Self Insert" on public.profiles for insert with check (auth.uid() = id);

-- B. LISTINGS
create table public.listings (
  id uuid default uuid_generate_v4() primary key,
  donor_id uuid references public.profiles(id) not null,
  title text not null,
  description text,
  food_type text, -- Veg/Non-Veg
  quantity text, 
  image_url text,
  expiry_date timestamp with time zone not null,
  status text default 'available', -- available, booked, picked_up, delivered
  address text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.listings enable row level security;
create policy "Public Listings" on public.listings for select using (true);
create policy "Donor Create" on public.listings for insert with check (auth.uid() = donor_id);
create policy "Donor Update" on public.listings for update using (auth.uid() = donor_id);

-- C. PICKUPS (Transactions)
create table public.pickups (
  id uuid default uuid_generate_v4() primary key,
  listing_id uuid references public.listings(id) not null,
  volunteer_id uuid references public.profiles(id) not null,
  status text default 'pending', -- pending, accepted, picked_up, delivered, rejected
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  completed_at timestamp with time zone
);

alter table public.pickups enable row level security;
-- Visibility: Volunteer (Requester) OR Donor (Owner of Listing)
create policy "Pickup Visibility" on public.pickups for select 
using ( 
    auth.uid() = volunteer_id 
    OR 
    exists (select 1 from public.listings where listings.id = pickups.listing_id and listings.donor_id = auth.uid()) 
);

create policy "Volunteer Request" on public.pickups for insert with check (auth.uid() = volunteer_id);

create policy "Status Update" on public.pickups for update 
using ( 
    auth.uid() = volunteer_id 
    OR 
    exists (select 1 from public.listings where listings.id = pickups.listing_id and listings.donor_id = auth.uid()) 
);

-- D. NOTIFICATIONS
create table public.notifications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) not null,
  type text not null,
  title text not null,
  message text not null,
  link text,
  is_read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.notifications enable row level security;
create policy "Own Notifications" on public.notifications for select using (auth.uid() = user_id);
create policy "System Insert" on public.notifications for insert with check (true); -- Allow system RPCs

-- E. BITE LINKS (Social)
create table public.bite_links (
  follower_id uuid references public.profiles(id) not null,
  following_id uuid references public.profiles(id) not null,
  primary key (follower_id, following_id)
);
alter table public.bite_links enable row level security;
create policy "Public Links" on public.bite_links for select using (true);
create policy "Follow" on public.bite_links for insert with check (auth.uid() = follower_id);
create policy "Unfollow" on public.bite_links for delete using (auth.uid() = follower_id);

-- 4. STORAGE (Idempotent)
insert into storage.buckets (id, name) values ('sharebite-assets', 'sharebite-assets') on conflict do nothing;
drop policy if exists "Public Access" on storage.objects;
create policy "Public Access" on storage.objects for select using ( bucket_id = 'sharebite-assets' );
drop policy if exists "Auth Upload" on storage.objects;
create policy "Auth Upload" on storage.objects for insert with check ( bucket_id = 'sharebite-assets' and auth.role() = 'authenticated' );

-- 5. FUNCTION: Handle New User
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

-- 6. LIFECYCLE RPCs (With Stats)

-- A. Request Pickup
create or replace function public.request_pickup(p_listing_id uuid, p_volunteer_id uuid)
returns boolean language plpgsql security definer as $$
declare
  v_donor_id uuid;
begin
  select donor_id into v_donor_id from public.listings where id = p_listing_id;
  
  if exists (select 1 from public.pickups where listing_id = p_listing_id and volunteer_id = p_volunteer_id) then return false; end if;

  insert into public.pickups (listing_id, volunteer_id, status) values (p_listing_id, p_volunteer_id, 'pending');

  insert into public.notifications (user_id, type, title, message, link)
  values (v_donor_id, 'pickup_request', 'New Request', 'Someone wants your food! Check Activity.', '/activity');

  return true;
end;
$$;

-- B. Accept Pickup
create or replace function public.accept_pickup(p_pickup_id uuid, p_donor_id uuid)
returns boolean language plpgsql security definer as $$
declare
  v_listing_id uuid;
  v_volunteer_id uuid;
begin
  select listing_id, volunteer_id into v_listing_id, v_volunteer_id from public.pickups 
  join public.listings on pickups.listing_id = listings.id
  where pickups.id = p_pickup_id and listings.donor_id = p_donor_id;

  if v_listing_id is null then return false; end if;

  update public.listings set status = 'booked' where id = v_listing_id;
  update public.pickups set status = 'accepted' where id = p_pickup_id;
  update public.pickups set status = 'rejected' where listing_id = v_listing_id and id != p_pickup_id;

  insert into public.notifications (user_id, type, title, message, link)
  values (v_volunteer_id, 'pickup_accepted', 'Request Accepted', 'Go pick up the food!', '/activity');

  return true;
end;
$$;

-- C. Confirm Pickup (Handover)
create or replace function public.confirm_pickup(p_listing_id uuid, p_donor_id uuid)
returns boolean language plpgsql security definer as $$
begin
  update public.listings set status = 'picked_up' where id = p_listing_id and donor_id = p_donor_id;
  update public.pickups set status = 'picked_up' where listing_id = p_listing_id and status = 'accepted';
  return true;
end;
$$;

-- D. Complete Delivery (Stats)
create or replace function public.complete_delivery(p_listing_id uuid, p_volunteer_id uuid)
returns boolean language plpgsql security definer as $$
declare 
    v_donor_id uuid;
begin
  select donor_id into v_donor_id from public.listings where id = p_listing_id;

  update public.pickups set status = 'delivered', completed_at = now() 
  where listing_id = p_listing_id and volunteer_id = p_volunteer_id and status = 'picked_up';

  if not found then return false; end if;

  update public.listings set status = 'delivered' where id = p_listing_id;

  -- Stats
  update public.profiles set impact_score = coalesce(impact_score, 0) + 5, meals_shared = coalesce(meals_shared, 0) + 1 where id = v_donor_id;
  update public.profiles set impact_score = coalesce(impact_score, 0) + 10 where id = p_volunteer_id;

  insert into public.notifications (user_id, type, title, message, link)
  values (v_donor_id, 'delivery_completed', 'Delivered!', 'Your food was delivered. +5 Impact!', '/activity');

  return true;
end;
$$;

-- 7. SEED DUMMY DATA (Optional but helpful)
-- Note: We can't insert into auth.users easily here without admin secret, 
-- but we can assume users exist or just wait for them to sign up. 
-- However, we CAN insert a dummy listing if we know a UUID, but safest is to let Fresh users create them.
