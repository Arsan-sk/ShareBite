-- SAFE RLS REPAIR SCRIPT V5
-- This script safely drops ALL possible variations of policies before creating new ones.

-- 1. Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_requests ENABLE ROW LEVEL SECURITY;

-- 2. DROP EVERYTHING (Profiles)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

-- 3. DROP EVERYTHING (Verification Requests)
DROP POLICY IF EXISTS "Users can view own requests" ON public.verification_requests;
DROP POLICY IF EXISTS "Users can insert own requests" ON public.verification_requests;
DROP POLICY IF EXISTS "Users can create requests" ON public.verification_requests;
DROP POLICY IF EXISTS "Admins view all requests" ON public.verification_requests;
DROP POLICY IF EXISTS "Admins can view all requests" ON public.verification_requests;
DROP POLICY IF EXISTS "Admins update all requests" ON public.verification_requests;
DROP POLICY IF EXISTS "Admins can update requests" ON public.verification_requests;

-- 4. RECREATE PROFILES POLICIES
CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
USING (
  auth.uid() = id 
  OR 
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

CREATE POLICY "Users can insert own profile"
ON public.profiles FOR INSERT
WITH CHECK ( auth.uid() = id );

CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
USING ( auth.uid() = id )
WITH CHECK ( auth.uid() = id );

CREATE POLICY "Admins can update all profiles"
ON public.profiles FOR UPDATE
USING ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin' );

-- 5. RECREATE VERIFICATION REQUESTS POLICIES
CREATE POLICY "Users can view own requests"
ON public.verification_requests FOR SELECT
USING ( auth.uid() = user_id );

CREATE POLICY "Admins can view all requests"
ON public.verification_requests FOR SELECT
USING ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin' );

CREATE POLICY "Users can create requests"
ON public.verification_requests FOR INSERT
WITH CHECK ( auth.uid() = user_id );

CREATE POLICY "Admins can update requests"
ON public.verification_requests FOR UPDATE
USING ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin' );

-- 6. GRANT PERMISSIONS
GRANT EXECUTE ON FUNCTION approve_verification TO authenticated;
GRANT EXECUTE ON FUNCTION reject_verification TO authenticated;
