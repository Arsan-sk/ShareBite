-- 1. DROP Existing Trigger and Function to ensure clean state
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 2. Re-create the function with SAFE Error Handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  assigned_role public.user_role;
BEGIN
  -- Attempt to cast role, default to 'resident' on any error (like invalid text)
  BEGIN
    assigned_role := (new.raw_user_meta_data->>'role')::public.user_role;
  EXCEPTION WHEN OTHERS THEN
    assigned_role := 'resident';
  END;
  
  -- Fallback if null
  IF assigned_role IS NULL THEN
    assigned_role := 'resident';
  END IF;

  INSERT INTO public.profiles (id, email, display_name, full_name, role)
  VALUES (
    new.id,
    new.email,
    split_part(new.email, '@', 1), -- Default display name from email
    new.raw_user_meta_data->>'full_name',
    assigned_role
  );
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Re-attach the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
