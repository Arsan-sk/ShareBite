-- FIX ACTIVITY DASHBOARD RLS (Listings & Pickups)
-- Run this in Supabase SQL Editor to ensure users can see their own data.

-- 1. Enable RLS (Ensure it's on)
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pickups ENABLE ROW LEVEL SECURITY;

-- 2. LISTINGS POLICIES
DROP POLICY IF EXISTS "Public listings visibility" ON public.listings;
DROP POLICY IF EXISTS "Donors can manage own listings" ON public.listings;
DROP POLICY IF EXISTS "Users can create listings" ON public.listings;

-- Allow everyone to see available listings (or all listings)
CREATE POLICY "Public listings visibility"
ON public.listings FOR SELECT
USING (true);

-- Allow donors to update/delete their own listings
CREATE POLICY "Donors can manage own listings"
ON public.listings FOR ALL
USING (auth.uid() = donor_id);

-- Allow authenticated users to insert listings
CREATE POLICY "Users can create listings"
ON public.listings FOR INSERT
WITH CHECK (auth.uid() = donor_id);


-- 3. PICKUPS POLICIES
DROP POLICY IF EXISTS "Pickups visibility" ON public.pickups;
DROP POLICY IF EXISTS "Volunteers can manage own pickups" ON public.pickups;
DROP POLICY IF EXISTS "Users can create pickups" ON public.pickups;

-- Allow users to see pickups if they are the volunteer OR the donor of the listing
CREATE POLICY "Pickups visibility"
ON public.pickups FOR SELECT
USING (
    auth.uid() = volunteer_id 
    OR 
    EXISTS (
        SELECT 1 FROM public.listings 
        WHERE listings.id = pickups.listing_id 
        AND listings.donor_id = auth.uid()
    )
);

-- Allow volunteers to update their own pickups
CREATE POLICY "Volunteers can update own pickups"
ON public.pickups FOR UPDATE
USING (auth.uid() = volunteer_id);

-- Allow donors to update pickups on their listings (e.g. status changes)
CREATE POLICY "Donors can update pickups"
ON public.pickups FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.listings 
        WHERE listings.id = pickups.listing_id 
        AND listings.donor_id = auth.uid()
    )
);

-- Allow authenticated users to create pickups
CREATE POLICY "Users can create pickups"
ON public.pickups FOR INSERT
WITH CHECK (auth.uid() = volunteer_id);

-- 4. Grant Permissions (Just in case)
GRANT ALL ON TABLE public.listings TO authenticated;
GRANT ALL ON TABLE public.pickups TO authenticated;
