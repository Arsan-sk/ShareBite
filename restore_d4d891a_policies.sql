-- RESTORE EXACT RLS POLICIES FROM WORKING COMMIT d4d891a
-- This restores the simple, working permissions that made Activity Dashboard work

-- 1. DROP ALL EXISTING POLICIES ON LISTINGS
DROP POLICY IF EXISTS "Listings are viewable by everyone." ON public.listings;
DROP POLICY IF EXISTS "Public listings visibility" ON public.listings;
DROP POLICY IF EXISTS "Donors can view their own listings" ON public.listings;
DROP POLICY IF EXISTS "Everyone can view available listings" ON public.listings;
DROP POLICY IF EXISTS "Volunteers can view their booked listings" ON public.listings;
DROP POLICY IF EXISTS "Dashboard donor visibility" ON public.listings;
DROP POLICY IF EXISTS "Unified Listings Visibility" ON public.listings;
DROP POLICY IF EXISTS "Listings Creation" ON public.listings;
DROP POLICY IF EXISTS "Listings Update" ON public.listings;
DROP POLICY IF EXISTS "Verified Donors can create listings." ON public.listings;
DROP POLICY IF EXISTS "Donors can update their listings." ON public.listings;
DROP POLICY IF EXISTS "Donors can update own listings" ON public.listings;
DROP POLICY IF EXISTS "Users can create listings" ON public.listings;
DROP POLICY IF EXISTS "Donors can manage own listings" ON public.listings;

-- 2. DROP ALL EXISTING POLICIES ON PICKUPS
DROP POLICY IF EXISTS "Pickups viewable by participants." ON public.pickups;
DROP POLICY IF EXISTS "Pickups visibility" ON public.pickups;
DROP POLICY IF EXISTS "Volunteer pickups visibility" ON public.pickups;
DROP POLICY IF EXISTS "Donor pickups visibility" ON public.pickups;
DROP POLICY IF EXISTS "Unified Pickups Visibility" ON public.pickups;
DROP POLICY IF EXISTS "Pickups Creation" ON public.pickups;
DROP POLICY IF EXISTS "Pickups Update" ON public.pickups;
DROP POLICY IF EXISTS "Verified Users can request pickup." ON public.pickups;
DROP POLICY IF EXISTS "Participants can update pickup status." ON public.pickups;
DROP POLICY IF EXISTS "Volunteers can manage own pickups" ON public.pickups;
DROP POLICY IF EXISTS "Users can create pickups" ON public.pickups;
DROP POLICY IF EXISTS "Volunteers can update own pickups" ON public.pickups;
DROP POLICY IF EXISTS "Donors can update pickups" ON public.pickups;

-- 3. CREATE EXACT d4d891a POLICIES FOR LISTINGS
create policy "Listings are viewable by everyone."
  on public.listings for select
  using ( true );

create policy "Verified Donors can create listings."
  on public.listings for insert
  with check ( auth.uid() = donor_id );

create policy "Donors can update their listings."
  on public.listings for update
  using ( auth.uid() = donor_id );

-- 4. CREATE EXACT d4d891a POLICIES FOR PICKUPS
create policy "Pickups viewable by participants."
  on public.pickups for select
  using ( auth.uid() = volunteer_id or auth.uid() IN (select donor_id from public.listings where id = listing_id) );

create policy "Verified Users can request pickup."
  on public.pickups for insert
  with check ( auth.uid() = volunteer_id );

create policy "Participants can update pickup status."
  on public.pickups for update
  using ( auth.uid() = volunteer_id or auth.uid() IN (select donor_id from public.listings where id = listing_id) );

-- 5. ENSURE RLS IS ENABLED
alter table public.listings enable row level security;
alter table public.pickups enable row level security;

-- 6. GRANT PERMISSIONS
GRANT ALL ON TABLE public.listings TO authenticated;
GRANT ALL ON TABLE public.pickups TO authenticated;
