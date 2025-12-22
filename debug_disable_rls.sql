-- DIAGNOSTIC SCRIPT: DISABLE RLS TEMPORARILY
-- This will confirm if data exists but is hidden.

ALTER TABLE public.verification_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.pickups DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- If you run the query NOW and see data, then RLS was the problem.
-- After checking, we should Re-Enable it and fix the policy.
