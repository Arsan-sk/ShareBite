-- FIX RECURSION ISSUE IN RLS (Final Solution)
-- The previous policy caused infinite recursion because checking if someone is an admin
-- required reading the profile table, which triggered the policy again.

-- 1. Create a Secure Helper Function to check Admin status
-- SECURITY DEFINER means this runs with superior privileges, bypassing RLS to avoid the loop.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Reset Profiles Policies (Drop all variants)
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Profiles visibility" ON public.profiles;
DROP POLICY IF EXISTS "Profiles update" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

-- View: Users see themselves OR Admins see everyone
CREATE POLICY "Profiles visibility"
ON public.profiles FOR SELECT
USING (
  auth.uid() = id
  OR
  public.is_admin()
);

-- Insert: Users insert themselves (Sign Up)
CREATE POLICY "Users can insert own profile"
ON public.profiles FOR INSERT
WITH CHECK ( auth.uid() = id );

-- Update: Users update themselves OR Admins update everyone
CREATE POLICY "Profiles update"
ON public.profiles FOR UPDATE
USING (
  auth.uid() = id
  OR
  public.is_admin()
)
WITH CHECK (
  auth.uid() = id
  OR
  public.is_admin()
);


-- 3. Reset Verification Requests Policies
DROP POLICY IF EXISTS "Users can view own requests" ON public.verification_requests;
DROP POLICY IF EXISTS "Admins can view all requests" ON public.verification_requests;
DROP POLICY IF EXISTS "Users can create requests" ON public.verification_requests;
DROP POLICY IF EXISTS "Admins can update requests" ON public.verification_requests;
DROP POLICY IF EXISTS "Admins view all requests" ON public.verification_requests;
DROP POLICY IF EXISTS "Verification requests visibility" ON public.verification_requests;
DROP POLICY IF EXISTS "Verification requests insert" ON public.verification_requests;
DROP POLICY IF EXISTS "Verification requests update" ON public.verification_requests;

-- View: Users see own, Admins see all
CREATE POLICY "Verification requests visibility"
ON public.verification_requests FOR SELECT
USING (
  auth.uid() = user_id
  OR
  public.is_admin()
);

-- Insert: Users create own
CREATE POLICY "Verification requests insert"
ON public.verification_requests FOR INSERT
WITH CHECK ( auth.uid() = user_id );

-- Update: Admins only
CREATE POLICY "Verification requests update"
ON public.verification_requests FOR UPDATE
USING ( public.is_admin() );

-- 4. Ensure Permissions on Functions
GRANT EXECUTE ON FUNCTION public.is_admin TO authenticated;
GRANT EXECUTE ON FUNCTION approve_verification TO authenticated;
GRANT EXECUTE ON FUNCTION reject_verification TO authenticated;
