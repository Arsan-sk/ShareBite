-- COMPREHENSIVE RLS REPAIR
-- This script resets all policies on 'profiles' and 'verification_requests' to ensure correct access.

-- 1. Enable RLS (Ensure it's on)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_requests ENABLE ROW LEVEL SECURITY;

-- 2. Clean Slate: Drop potentially conflicting policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

DROP POLICY IF EXISTS "Users can view own requests" ON public.verification_requests;
DROP POLICY IF EXISTS "Users can insert own requests" ON public.verification_requests;
DROP POLICY IF EXISTS "Admins view all requests" ON public.verification_requests;
DROP POLICY IF EXISTS "Admins update all requests" ON public.verification_requests;
-- NEW DROPS TO PREVENT ERRORS
DROP POLICY IF EXISTS "Users can create requests" ON public.verification_requests;
DROP POLICY IF EXISTS "Admins can update requests" ON public.verification_requests;
DROP POLICY IF EXISTS "Admins can view all requests" ON public.verification_requests;

-- 3. PROFILES POLICIES
-- A. VIEW: Users see themselves, Admins see everyone
CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
USING (
  auth.uid() = id 
  OR 
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

-- B. INSERT: Users can create their own profile (SignUp)
CREATE POLICY "Users can insert own profile"
ON public.profiles FOR INSERT
WITH CHECK ( auth.uid() = id );

-- C. UPDATE: Users update themselves, Admins update everyone (or specific fields)
CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
USING ( auth.uid() = id )
WITH CHECK ( auth.uid() = id );

CREATE POLICY "Admins can update all profiles"
ON public.profiles FOR UPDATE
USING ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin' );


-- 4. VERIFICATION REQUESTS POLICIES
-- A. VIEW: Users see own, Admins see all
CREATE POLICY "Users can view own requests"
ON public.verification_requests FOR SELECT
USING ( auth.uid() = user_id );

CREATE POLICY "Admins can view all requests"
ON public.verification_requests FOR SELECT
USING ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin' );

-- B. INSERT: Users submit requests
CREATE POLICY "Users can create requests"
ON public.verification_requests FOR INSERT
WITH CHECK ( auth.uid() = user_id );

-- C. UPDATE: Admins only (Approve/Reject triggers updates, but nice to have direct access)
CREATE POLICY "Admins can update requests"
ON public.verification_requests FOR UPDATE
USING ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin' );


-- 5. FUNCTION GRANT (Ensure RPCs work)
GRANT EXECUTE ON FUNCTION approve_verification TO authenticated;
GRANT EXECUTE ON FUNCTION reject_verification TO authenticated;
