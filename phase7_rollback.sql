-- ============================================
-- ROLLBACK SCRIPT for Phase 7 Migration
-- ============================================
-- Run this if you need to undo phase7_location_and_chat.sql
-- WARNING: This will delete all chat data and new location fields
-- ============================================

-- Drop triggers first
DROP TRIGGER IF EXISTS trigger_chat_on_pickup_acceptance ON pickups;
DROP TRIGGER IF EXISTS trigger_add_to_share_history ON pickups;

-- Drop functions
DROP FUNCTION IF EXISTS create_chat_on_pickup_acceptance();
DROP FUNCTION IF EXISTS add_to_share_history();

-- Drop chat tables (CASCADE will drop dependent policies)
DROP TABLE IF EXISTS food_share_history CASCADE;
DROP TABLE IF EXISTS chat_messages CASCADE;
DROP TABLE IF EXISTS chat_rooms CASCADE;

-- Remove new location columns from profiles
ALTER TABLE profiles 
DROP COLUMN IF EXISTS location_lat,
DROP COLUMN IF EXISTS location_lng,
DROP COLUMN IF EXISTS location_address,
DROP COLUMN IF EXISTS location_city,
DROP COLUMN IF EXISTS location_updated_at;

-- Remove new location columns from listings
ALTER TABLE listings
DROP COLUMN IF EXISTS pickup_lat,
DROP COLUMN IF EXISTS pickup_lng,
DROP COLUMN IF EXISTS pickup_address,
DROP COLUMN IF EXISTS pickup_city;

-- Remove donor_id from pickups if added by migration
ALTER TABLE pickups
DROP COLUMN IF EXISTS donor_id;

-- Drop indexes
DROP INDEX IF EXISTS idx_listings_location;
DROP INDEX IF EXISTS idx_profiles_location;
DROP INDEX IF EXISTS idx_chat_rooms_donor;
DROP INDEX IF EXISTS idx_chat_rooms_volunteer;
DROP INDEX IF EXISTS idx_chat_messages_room;
DROP INDEX IF EXISTS idx_food_share_history_pair;

-- Drop notification update policy
DROP POLICY IF EXISTS notifications_update ON notifications;

-- ============================================
-- VERIFICATION
-- ============================================
-- After rollback, verify with:
-- SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;
-- SELECT column_name FROM information_schema.columns WHERE table_name = 'profiles' AND column_name LIKE '%location%';
