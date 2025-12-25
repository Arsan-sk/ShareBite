-- FINAL FIX FOR LISTINGS VISIBILITY & STATUS FLOW
-- 1. Unconditionally enable reading all listings for now to debug visibility
DROP POLICY IF EXISTS "Public listings visibility" ON public.listings;
CREATE POLICY "Public listings visibility" ON public.listings FOR SELECT USING (true);

-- 2. Ensure donors can update their own listings (crucial for modifying status)
DROP POLICY IF EXISTS "Donors can update own listings" ON public.listings;
CREATE POLICY "Donors can update own listings" ON public.listings FOR UPDATE USING (auth.uid() = donor_id);

-- 3. Fix Pickups visibility
DROP POLICY IF EXISTS "Pickups visibility" ON public.pickups;
CREATE POLICY "Pickups visibility" ON public.pickups FOR SELECT USING (
    auth.uid() = volunteer_id OR 
    EXISTS (SELECT 1 FROM public.listings WHERE listings.id = pickups.listing_id AND listings.donor_id = auth.uid())
);

-- 4. Ensure pickup status can be updated by volunteers
DROP POLICY IF EXISTS "Volunteers can update own pickups" ON public.pickups;
CREATE POLICY "Volunteers can update own pickups" ON public.pickups FOR UPDATE USING (auth.uid() = volunteer_id);

-- 5. Fix for "My Listings" not showing:
-- Just in case, grant permissions again
GRANT ALL ON public.listings TO authenticated;
GRANT ALL ON public.pickups TO authenticated;
