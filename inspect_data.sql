-- INSPECTION SCRIPT
-- Run this to see what the data actually looks like and what values are being used.

-- 1. Check Pickup Statuses (Case Sensitivity Check)
SELECT status, COUNT(*) as count FROM public.pickups GROUP BY status;

-- 2. Check Verification Requests statuses
SELECT status, COUNT(*) as count FROM public.verification_requests GROUP BY status;

-- 3. Check if is_admin function exists and what it returns for current user
-- (You can't run this easily via Editor unless you are logged in, but we can check existence)
SELECT proname, prosrc FROM pg_proc WHERE proname = 'is_admin';

-- 4. Check Policies on Profiles
select * from pg_policies wheretablename = 'profiles';

-- 5. Check Roles in Profiles
SELECT role, COUNT(*) FROM public.profiles GROUP BY role;
