-- FINAL COMPREHENSIVE FIX FOR LISTINGS & ACTIVITY DASHBOARD
-- 1. Unconditionally enable reading YOUR OWN listings
DROP POLICY IF EXISTS "Donors can view their own listings" ON public.listings;
CREATE POLICY "Donors can view their own listings" 
ON public.listings FOR SELECT 
USING (auth.uid() = donor_id);

-- 2. Allow everyone to see available listings (required for the feed, but also helpful generally)
DROP POLICY IF EXISTS "Everyone can view available listings" ON public.listings;
CREATE POLICY "Everyone can view available listings" 
ON public.listings FOR SELECT 
USING (status = 'available');

-- 3. Allow viewing of listings you have booked or are involved in
DROP POLICY IF EXISTS "Volunteers can view their booked listings" ON public.listings;
CREATE POLICY "Volunteers can view their booked listings"
ON public.listings FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.pickups 
        WHERE pickups.listing_id = listings.id 
        AND pickups.volunteer_id = auth.uid()
    )
);

-- 4. FIX "MY LISTINGS" EMPTY STATE (The catch-all fix for the dashboard issue)
-- The above policies might not catch 'booked' or 'picked_up' listings for the donor if not perfectly aligned.
-- Let's add a robust fallback for the dashboard query specifically.
DROP POLICY IF EXISTS "Dashboard donor visibility" ON public.listings;
CREATE POLICY "Dashboard donor visibility"
ON public.listings FOR SELECT
USING (donor_id = auth.uid());


-- 5. FIX PICKUPS Permission (Ensure My Pickups works)
DROP POLICY IF EXISTS "Volunteer pickups visibility" ON public.pickups;
CREATE POLICY "Volunteer pickups visibility"
ON public.pickups FOR SELECT
USING (volunteer_id = auth.uid());

-- 6. Allow Donors to see pickups on their food (for status updates)
DROP POLICY IF EXISTS "Donor pickups visibility" ON public.pickups;
CREATE POLICY "Donor pickups visibility"
ON public.pickups FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.listings
        WHERE listings.id = pickups.listing_id
        AND listings.donor_id = auth.uid()
    )
);

-- 7. Grant Permissions to be safe
GRANT SELECT, INSERT, UPDATE ON public.listings TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.pickups TO authenticated;
