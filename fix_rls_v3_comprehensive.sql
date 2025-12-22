-- COMPREHENSIVE RLS FIX V3
-- This script resets and simplifies RLS policies to ensure proper data visibility.

-- 1. PROFILES (Public Read, Owner Write)
alter table public.profiles enable row level security;
drop policy if exists "Public profiles are viewable by everyone." on public.profiles;
drop policy if exists "Users can insert their own profile." on public.profiles;
drop policy if exists "Users can update own profile." on public.profiles;

create policy "Public profiles are viewable by everyone." 
on public.profiles for select using (true);

create policy "Users can insert their own profile." 
on public.profiles for insert with check (auth.uid() = id);

create policy "Users can update own profile." 
on public.profiles for update using (auth.uid() = id);


-- 2. LISTINGS (Public Read, Donor Write / Update)
alter table public.listings enable row level security;
drop policy if exists "Listings are viewable by everyone." on public.listings;
drop policy if exists "Verified Donors can create listings." on public.listings;
drop policy if exists "Donors can update their listings." on public.listings;

create policy "Listings are viewable by everyone." 
on public.listings for select using (true);

create policy "Verified Donors can create listings." 
on public.listings for insert with check (auth.uid() = donor_id);

create policy "Donors can update their listings." 
on public.listings for update using (auth.uid() = donor_id);


-- 3. PICKUPS (Participant Read/Write)
-- The "IN query" policies can sometimes be buggy. optimizing visibility.
alter table public.pickups enable row level security;
drop policy if exists "Pickups viewable by participants." on public.pickups;
drop policy if exists "Verified Users can request pickup." on public.pickups;
drop policy if exists "Participants can update pickup status." on public.pickups;

-- Allow volunteers to see their pickups OR donors to see pickups for their listings
create policy "Pickups viewable by participants." 
on public.pickups for select 
using ( 
    auth.uid() = volunteer_id 
    OR 
    exists (select 1 from public.listings where listings.id = pickups.listing_id and listings.donor_id = auth.uid()) 
);

-- Allow creating a pickup request (Volunteer only)
create policy "Verified Users can request pickup." 
on public.pickups for insert 
with check ( auth.uid() = volunteer_id );

-- Allow updating status (Volunteer or Donor)
create policy "Participants can update pickup status." 
on public.pickups for update 
using ( 
    auth.uid() = volunteer_id 
    OR 
    exists (select 1 from public.listings where listings.id = pickups.listing_id and listings.donor_id = auth.uid()) 
);


-- 4. NOTIFICATIONS (User Read Only)
-- Ensure table exists first (idempotent)
create table if not exists public.notifications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) not null,
  type text not null, -- 'pickup_request', 'pickup_accepted', 'delivery_completed'
  title text not null,
  message text not null,
  link text,
  is_read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.notifications enable row level security;
drop policy if exists "Users can see own notifications" on public.notifications;

create policy "Users can see own notifications" 
on public.notifications for select 
using ( auth.uid() = user_id );

-- Allow System/RPC to insert (Bypass RLS via Security Definer functions), 
-- but if we use client-side insert implies we need policy. 
-- However, we only insert via RPC/Triggers (Server Side), so INSERT policy not strictly needed for Client,
-- BUT good practice to ALLOW insert if user_id = auth.uid() for testing.
create policy "Users can insert own notifications (Testing)" 
on public.notifications for insert 
with check ( auth.uid() = user_id );

create policy "Users can update own notifications" 
on public.notifications for update 
using ( auth.uid() = user_id );


-- 5. BITE LINKS (Public Read, Owner Write)
alter table public.bite_links enable row level security;
drop policy if exists "Public links" on public.bite_links;
drop policy if exists "Users can follow others" on public.bite_links;
drop policy if exists "Users can unfollow" on public.bite_links;

create policy "Public links" on public.bite_links for select using (true);

create policy "Users can follow others" 
on public.bite_links for insert with check (auth.uid() = follower_id);

create policy "Users can unfollow" 
on public.bite_links for delete using (auth.uid() = follower_id);
