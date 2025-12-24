-- Phase 9: Listing Enhancement & Accurate Meal Count System
-- Run this in Supabase SQL Editor

-- 1. Add new columns to listings table
ALTER TABLE public.listings
  ADD COLUMN IF NOT EXISTS food_category TEXT DEFAULT 'veg',
  ADD COLUMN IF NOT EXISTS quantity_number INT DEFAULT 1,
  ADD COLUMN IF NOT EXISTS quantity_unit TEXT DEFAULT 'packs',
  ADD COLUMN IF NOT EXISTS quantity_item_name TEXT,
  ADD COLUMN IF NOT EXISTS custom_unit TEXT,
  ADD COLUMN IF NOT EXISTS estimated_meals INT DEFAULT 1;

-- 2. Add new columns to profiles table
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS times_shared INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_meals_donated INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS meals_received INT DEFAULT 0;

-- 3. Migrate existing meals_shared to times_shared (preserve original count logic)
UPDATE public.profiles 
SET times_shared = meals_shared 
WHERE meals_shared > 0 AND (times_shared = 0 OR times_shared IS NULL);

-- 4. Initialize total_meals_donated from existing listings count
-- (Conservative estimate: each existing listing = 1 meal)
UPDATE public.profiles p
SET total_meals_donated = (
  SELECT COUNT(*) FROM public.listings l WHERE l.donor_id = p.id
)
WHERE (total_meals_donated = 0 OR total_meals_donated IS NULL);

-- 5. Add check constraint for food_category
-- ALTER TABLE public.listings
--   ADD CONSTRAINT food_category_check 
--   CHECK (food_category IN ('veg', 'non-veg', 'both'));

-- 6. Add check constraint for quantity_unit
-- ALTER TABLE public.listings
--   ADD CONSTRAINT quantity_unit_check 
--   CHECK (quantity_unit IN ('kg', 'packs', 'half', 'full', 'custom'));

-- Notes:
-- food_category: 'veg', 'non-veg', 'both'
-- quantity_unit: 'kg' (x3), 'packs' (x1), 'half' (x1), 'full' (x2), 'custom' (x1)
-- quantity_item_name: Used when unit is 'half' or 'full' (e.g., "rice", "biryani")
-- custom_unit: User-entered unit description when 'custom' is selected
-- estimated_meals: Calculated based on quantity_number * multiplier

-- 5. Create RPC function to increment profile meal counts
CREATE OR REPLACE FUNCTION increment_profile_meals(p_user_id UUID, p_meals_to_add INT)
RETURNS VOID AS $$
BEGIN
  UPDATE public.profiles
  SET 
    times_shared = COALESCE(times_shared, 0) + 1,
    total_meals_donated = COALESCE(total_meals_donated, 0) + p_meals_to_add,
    meals_shared = COALESCE(meals_shared, 0) + 1,
    updated_at = NOW()
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION increment_profile_meals TO authenticated;
