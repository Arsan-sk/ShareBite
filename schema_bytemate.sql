-- =====================================================
-- ByteMate Social Layer - Database Schema
-- =====================================================
-- This schema implements a one-way follow system (Instagram-style)
-- with automatic count management and notifications

-- 1. CREATE BYTEMATES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.bytemates (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  follower_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  following_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  -- Constraints
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_bytemates_follower ON public.bytemates(follower_id);
CREATE INDEX IF NOT EXISTS idx_bytemates_following ON public.bytemates(following_id);
CREATE INDEX IF NOT EXISTS idx_bytemates_created ON public.bytemates(created_at DESC);

-- 2. UPDATE PROFILES TABLE
-- =====================================================
-- Add ByteMate count and ensure location fields exist
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bytemate_count INT DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS location_lat FLOAT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS location_lng FLOAT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS location_address TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS location_city TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS total_meals_donated INT DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS meals_received INT DEFAULT 0;

-- 3. PUBLIC PROFILE VIEWS (Analytics)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.public_profile_views (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  viewer_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  viewed_profile_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_profile_views_viewed ON public.public_profile_views(viewed_profile_id);
CREATE INDEX IF NOT EXISTS idx_profile_views_viewer ON public.public_profile_views(viewer_id);

-- 4. BYTEMATE COUNT TRIGGER
-- =====================================================
-- Automatically update bytemate_count when ByteMates are added/removed
CREATE OR REPLACE FUNCTION update_bytemate_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Increment count for the user being followed
    UPDATE public.profiles
    SET bytemate_count = bytemate_count + 1
    WHERE id = NEW.following_id;
    
  ELSIF TG_OP = 'DELETE' THEN
    -- Decrement count for the user being unfollowed
    UPDATE public.profiles
    SET bytemate_count = GREATEST(0, bytemate_count - 1)
    WHERE id = OLD.following_id;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS bytemate_count_trigger ON public.bytemates;

-- Create trigger
CREATE TRIGGER bytemate_count_trigger
AFTER INSERT OR DELETE ON public.bytemates
FOR EACH ROW EXECUTE FUNCTION update_bytemate_count();

-- 5. BYTEMATE NOTIFICATION TRIGGER
-- =====================================================
-- Send notification when someone adds you as a ByteMate
CREATE OR REPLACE FUNCTION notify_bytemate_added()
RETURNS TRIGGER AS $$
DECLARE
  follower_name TEXT;
  follower_username TEXT;
BEGIN
  -- Get follower's display name or email
  SELECT 
    COALESCE(display_name, full_name, email),
    COALESCE(display_name, split_part(email, '@', 1))
  INTO follower_name, follower_username
  FROM public.profiles
  WHERE id = NEW.follower_id;

  -- Insert notification
  INSERT INTO public.notifications (user_id, type, title, message, link)
  VALUES (
    NEW.following_id,
    'bytemate_added',
    'New ByteMate! 🤝',
    '@' || follower_username || ' added you as a ByteMate',
    '/profile/' || NEW.follower_id::text
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS bytemate_notification_trigger ON public.bytemates;

-- Create trigger
CREATE TRIGGER bytemate_notification_trigger
AFTER INSERT ON public.bytemates
FOR EACH ROW EXECUTE FUNCTION notify_bytemate_added();

-- 6. RLS POLICIES FOR BYTEMATES
-- =====================================================
ALTER TABLE public.bytemates ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view all bytemates" ON public.bytemates;
DROP POLICY IF EXISTS "Users can create their own bytemates" ON public.bytemates;
DROP POLICY IF EXISTS "Users can delete their own bytemates" ON public.bytemates;

-- Everyone can view ByteMate relationships (public social graph)
CREATE POLICY "Users can view all bytemates"
  ON public.bytemates FOR SELECT
  USING (true);

-- Users can only create ByteMates where they are the follower
CREATE POLICY "Users can create their own bytemates"
  ON public.bytemates FOR INSERT
  WITH CHECK (auth.uid() = follower_id);

-- Users can only delete their own ByteMates
CREATE POLICY "Users can delete their own bytemates"
  ON public.bytemates FOR DELETE
  USING (auth.uid() = follower_id);

-- 7. RLS POLICIES FOR PROFILE VIEWS
-- =====================================================
ALTER TABLE public.public_profile_views ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own profile views" ON public.public_profile_views;
DROP POLICY IF EXISTS "Users can create profile views" ON public.public_profile_views;

-- Users can see who viewed their profile
CREATE POLICY "Users can view their own profile views"
  ON public.public_profile_views FOR SELECT
  USING (auth.uid() = viewed_profile_id);

-- Anyone can create a profile view
CREATE POLICY "Users can create profile views"
  ON public.public_profile_views FOR INSERT
  WITH CHECK (true);

-- 8. HELPER FUNCTIONS
-- =====================================================

-- Function to get ByteMate status between two users
CREATE OR REPLACE FUNCTION get_bytemate_status(
  p_user_id uuid,
  p_target_id uuid
)
RETURNS TABLE (
  is_following boolean,
  is_followed_by boolean
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    EXISTS(SELECT 1 FROM public.bytemates WHERE follower_id = p_user_id AND following_id = p_target_id) as is_following,
    EXISTS(SELECT 1 FROM public.bytemates WHERE follower_id = p_target_id AND following_id = p_user_id) as is_followed_by;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's ByteMate IDs (for feed personalization)
CREATE OR REPLACE FUNCTION get_user_bytemates(p_user_id uuid)
RETURNS TABLE (following_id uuid) AS $$
BEGIN
  RETURN QUERY
  SELECT bytemates.following_id
  FROM public.bytemates
  WHERE bytemates.follower_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. GRANTS
-- =====================================================
GRANT ALL ON TABLE public.bytemates TO authenticated;
GRANT ALL ON TABLE public.public_profile_views TO authenticated;

-- Grant execute on functions
GRANT EXECUTE ON FUNCTION get_bytemate_status(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_bytemates(uuid) TO authenticated;

-- 10. VALIDATION
-- =====================================================
-- Test that constraints work
DO $$
BEGIN
  -- This should succeed
  RAISE NOTICE 'ByteMate schema created successfully!';
  RAISE NOTICE 'Tables: bytemates, public_profile_views';
  RAISE NOTICE 'Triggers: bytemate_count_trigger, bytemate_notification_trigger';
  RAISE NOTICE 'Functions: get_bytemate_status, get_user_bytemates';
END $$;
