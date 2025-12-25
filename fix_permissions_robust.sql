-- FINAL ROBUST PERMISSIONS FIX (Solves "Disappearing Listings & Pickups")
-- This script completely resets policies for Listings and Pickups to ensure correct visibility.

-- 1. Reset LISTINGS Policies
DROP POLICY IF EXISTS "Public listings visibility" ON public.listings;
DROP POLICY IF EXISTS "Donors can view their own listings" ON public.listings;
DROP POLICY IF EXISTS "Everyone can view available listings" ON public.listings;
DROP POLICY IF EXISTS "Volunteers can view their booked listings" ON public.listings;
DROP POLICY IF EXISTS "Dashboard donor visibility" ON public.listings;
DROP POLICY IF EXISTS "Donors can update own listings" ON public.listings;
DROP POLICY IF EXISTS "Users can create listings" ON public.listings;
DROP POLICY IF EXISTS "Donors can manage own listings" ON public.listings;

-- Create SIMPLE, NON-CONFLICTING Listings Policies
-- A. VIEW: Public can see available; Donors can see their own (ALWAYS); Volunteers can see what they booked.
CREATE POLICY "Unified Listings Visibility"
ON public.listings FOR SELECT
USING (
    status = 'available' 
    OR donor_id = auth.uid()
    OR EXISTS (
        SELECT 1 FROM public.pickups 
        WHERE pickups.listing_id = listings.id 
        AND pickups.volunteer_id = auth.uid()
    )
);

-- B. INSERT: Authenticated users can create
CREATE POLICY "Listings Creation"
ON public.listings FOR INSERT
WITH CHECK (auth.uid() = donor_id);

-- C. UPDATE: Donors can update their own
CREATE POLICY "Listings Update"
ON public.listings FOR UPDATE
USING (auth.uid() = donor_id);


-- 2. Reset PICKUPS Policies
DROP POLICY IF EXISTS "Pickups visibility" ON public.pickups;
DROP POLICY IF EXISTS "Volunteer pickups visibility" ON public.pickups;
DROP POLICY IF EXISTS "Donor pickups visibility" ON public.pickups;
DROP POLICY IF EXISTS "Volunteers can manage own pickups" ON public.pickups;
DROP POLICY IF EXISTS "Users can create pickups" ON public.pickups;
DROP POLICY IF EXISTS "Volunteers can update own pickups" ON public.pickups;
DROP POLICY IF EXISTS "Donors can update pickups" ON public.pickups;

-- Create SIMPLE, NON-CONFLICTING Pickups Policies
-- A. VIEW: Volunteer sees their own; Donor sees pickups on their listings.
CREATE POLICY "Unified Pickups Visibility"
ON public.pickups FOR SELECT
USING (
    volunteer_id = auth.uid()
    OR EXISTS (
        SELECT 1 FROM public.listings
        WHERE listings.id = pickups.listing_id
        AND listings.donor_id = auth.uid()
    )
);

-- B. INSERT: Users can create pickups (request food)
CREATE POLICY "Pickups Creation"
ON public.pickups FOR INSERT
WITH CHECK (auth.uid() = volunteer_id);

-- C. UPDATE: Volunteers can update (mark delivered); Donors can update (accept/reject)
CREATE POLICY "Pickups Update"
ON public.pickups FOR UPDATE
USING (
    volunteer_id = auth.uid()
    OR EXISTS (
        SELECT 1 FROM public.listings
        WHERE listings.id = pickups.listing_id
        AND listings.donor_id = auth.uid()
    )
);

-- 3. FINAL SAFETY NET: Grant basic permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON TABLE public.listings TO authenticated;
GRANT ALL ON TABLE public.pickups TO authenticated;
