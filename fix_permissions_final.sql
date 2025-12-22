-- FINAL PERMISSIONS FIX
-- Ensures the security check function is owned by superuser.

ALTER FUNCTION public.is_admin() OWNER TO postgres;

-- Just in case, grant everything again
GRANT ALL ON FUNCTION public.is_admin TO postgres;
GRANT ALL ON FUNCTION public.is_admin TO authenticated;
GRANT ALL ON FUNCTION public.is_admin TO service_role;

-- Force Policy Refresh
ALTER TABLE public.verification_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pickups ENABLE ROW LEVEL SECURITY;

-- Disable and Enable to flush caches if any
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
