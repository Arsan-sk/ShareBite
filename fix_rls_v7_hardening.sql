-- FIX RECURSION ISSUE IN RLS (V7 - Hardened)
-- Adds search_path to SECURITY DEFINER to ensure robustness.

-- 1. Create a Secure Helper Function to check Admin status
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. Reset Profiles Policies
DROP POLICY IF EXISTS "Profiles visibility" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

CREATE POLICY "Profiles visibility"
ON public.profiles FOR SELECT
USING (
  auth.uid() = id
  OR
  public.is_admin()
);

-- 3. Reset Verification Requests Policies
DROP POLICY IF EXISTS "Verification requests visibility" ON public.verification_requests;
DROP POLICY IF EXISTS "Users can view own requests" ON public.verification_requests;
DROP POLICY IF EXISTS "Admins can view all requests" ON public.verification_requests;

CREATE POLICY "Verification requests visibility"
ON public.verification_requests FOR SELECT
USING (
  auth.uid() = user_id
  OR
  public.is_admin()
);

-- 4. Grant Permissions (Crucial)
GRANT EXECUTE ON FUNCTION public.is_admin TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin TO postgres;
GRANT EXECUTE ON FUNCTION public.is_admin TO anon;
