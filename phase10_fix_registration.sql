-- =================================================================
-- PHASE 10: Fix Registration & Robust Error Handling
-- =================================================================
-- Run this script to fix "Database error saving new user"
-- It replaces the user creation trigger with a safer version.

-- 1. Ensure Permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO service_role;

-- 2. Drop Existing Trigger and Function to ensure clean state
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 3. Re-create the function with SAFE Error Handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  assigned_role public.user_role;
BEGIN
  -- Attempt to cast role, default to 'resident' on any error (like invalid text)
  BEGIN
    -- Try to cast the role from metadata
    assigned_role := (new.raw_user_meta_data->>'role')::public.user_role;
  EXCEPTION WHEN OTHERS THEN
    -- If casting fails (e.g. 'InvalidRole'), default to resident
    assigned_role := 'resident';
  END;
  
  -- Fallback if null
  IF assigned_role IS NULL THEN
    assigned_role := 'resident';
  END IF;

  -- Insert into profiles with explicit defaults for optional columns
  INSERT INTO public.profiles (
      id, 
      email, 
      display_name, 
      full_name, 
      role,
      -- Ensure these have defaults if schema defaults fail (defensive)
      impact_score,
      meals_shared,
      is_verified,
      created_at,
      updated_at
  )
  VALUES (
    new.id,
    new.email,
    split_part(new.email, '@', 1), -- Default display name from email
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    assigned_role,
    0, -- impact_score default
    0, -- meals_shared default
    false, -- is_verified default
    now(),
    now()
  );
  
  RETURN new;
EXCEPTION WHEN OTHERS THEN
  -- CRITICAL: Catch any other error to prevent blocking signup
  -- Log error if possible (Supabase logs)
  RAISE WARNING 'Profile creation failed for user %: %', new.id, SQLERRM;
  -- Return NEW so auth user is still created, even if profile fails (Partial success is better than total block)
  -- ideally we want profile, but this prevents "Database Error" blocking login.
  -- A better approach might be to retry or let it fail if profile is critical.
  -- For now, let's allow it but the app might break if profile missing.
  -- actually, if profile is missing, app breaks. So better to FAIL transaction?
  -- No, let's return new, but maybe insert a dummy profile?
  -- Re-raising IS better if we want strict consistency.
  RAISE; 
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Re-attach the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 5. Verify user_role type exists (Idempotent check)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE public.user_role AS ENUM ('resident', 'restaurant', 'ngo', 'volunteer', 'admin');
    END IF;
END$$;
