-- ============================================
-- Phase 7: Location & Chat System Migration
-- ============================================
-- This migration adds location fields and chat system tables
-- COMPATIBILITY: Checked against reset_and_setup_v6_corrected.sql
-- NOTE: Some location fields (latitude, longitude, location) already exist in profiles/listings
-- This migration only adds NEW fields that don't exist yet
-- ============================================

-- ============================================
-- SECTION 1: NEW Location Fields (Non-Conflicting)
-- ============================================

-- Add MISSING location fields to profiles (latitude & longitude already exist)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS location_lat DECIMAL(10, 8),    -- More precise than existing 'latitude float'
ADD COLUMN IF NOT EXISTS location_lng DECIMAL(11, 8),    -- More precise than existing 'longitude float'
ADD COLUMN IF NOT EXISTS location_address TEXT,          -- Human-readable address
ADD COLUMN IF NOT EXISTS location_city VARCHAR(100),     -- Extracted city name
ADD COLUMN IF NOT EXISTS location_updated_at TIMESTAMPTZ;

-- Migrate existing latitude/longitude to new precise fields (one-time data migration)
UPDATE profiles 
SET 
    location_lat = latitude::DECIMAL(10, 8),
    location_lng = longitude::DECIMAL(11, 8)
WHERE latitude IS NOT NULL AND location_lat IS NULL;

-- Add MISSING location fields to listings (latitude & longitude already exist)
ALTER TABLE listings
ADD COLUMN IF NOT EXISTS pickup_lat DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS pickup_lng DECIMAL(11, 8),
ADD COLUMN IF NOT EXISTS pickup_address TEXT,           -- Full pickup address
ADD COLUMN IF NOT EXISTS pickup_city VARCHAR(100);      -- City name for feed display

-- Migrate existing listing coordinates
UPDATE listings 
SET 
    pickup_lat = latitude::DECIMAL(10, 8),
    pickup_lng = longitude::DECIMAL(11, 8)
WHERE latitude IS NOT NULL AND pickup_lat IS NULL;

-- Add missing donor_id to pickups for chat system (if not exists)
ALTER TABLE pickups
ADD COLUMN IF NOT EXISTS donor_id UUID REFERENCES profiles(id);

-- Populate donor_id from listings
UPDATE pickups p
SET donor_id = l.donor_id
FROM listings l
WHERE p.listing_id = l.id AND p.donor_id IS NULL;

-- Indexes for geospatial queries (conditional creation)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_listings_location') THEN
        CREATE INDEX idx_listings_location ON listings(pickup_lat, pickup_lng);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_profiles_location') THEN
        CREATE INDEX idx_profiles_location ON profiles(location_lat, location_lng);
    END IF;
END$$;

-- ============================================
-- SECTION 2: Chat System Tables
-- ============================================

-- Chat Rooms (one room per donor-volunteer pair)
CREATE TABLE IF NOT EXISTS chat_rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    donor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    volunteer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    last_message_at TIMESTAMPTZ DEFAULT now(),
    
    -- Ensure unique pairing
    CONSTRAINT unique_chat_pair UNIQUE(donor_id, volunteer_id)
);

-- Chat Messages
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'system')),
    content TEXT NOT NULL,
    pickup_id UUID REFERENCES pickups(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Food Share History (tracks all completed pickups between two users)
CREATE TABLE IF NOT EXISTS food_share_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    donor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    volunteer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    pickup_id UUID NOT NULL REFERENCES pickups(id) ON DELETE CASCADE,
    listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    food_title VARCHAR(255),
    completed_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for chat performance
CREATE INDEX IF NOT EXISTS idx_chat_rooms_donor ON chat_rooms(donor_id);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_volunteer ON chat_rooms(volunteer_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_room ON chat_messages(room_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_food_share_history_pair ON food_share_history(donor_id, volunteer_id);

-- ============================================
-- SECTION 3: RLS Policies for Chat Tables
-- ============================================

ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_share_history ENABLE ROW LEVEL SECURITY;

-- Chat Rooms: Users can see rooms they're part of
DROP POLICY IF EXISTS chat_rooms_select ON chat_rooms;
CREATE POLICY chat_rooms_select ON chat_rooms
    FOR SELECT
    USING (auth.uid() = donor_id OR auth.uid() = volunteer_id);

DROP POLICY IF EXISTS chat_rooms_insert ON chat_rooms;
CREATE POLICY chat_rooms_insert ON chat_rooms
    FOR INSERT
    WITH CHECK (auth.uid() = donor_id OR auth.uid() = volunteer_id);

-- Chat Messages: Users can see and send messages in their rooms
DROP POLICY IF EXISTS chat_messages_select ON chat_messages;
CREATE POLICY chat_messages_select ON chat_messages
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM chat_rooms 
            WHERE chat_rooms.id = chat_messages.room_id 
            AND (chat_rooms.donor_id = auth.uid() OR chat_rooms.volunteer_id = auth.uid())
        )
    );

DROP POLICY IF EXISTS chat_messages_insert ON chat_messages;
CREATE POLICY chat_messages_insert ON chat_messages
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM chat_rooms 
            WHERE chat_rooms.id = chat_messages.room_id 
            AND (chat_rooms.donor_id = auth.uid() OR chat_rooms.volunteer_id = auth.uid())
        )
        AND sender_id = auth.uid()
    );

-- Allow notifications update
DROP POLICY IF EXISTS notifications_update ON notifications;
CREATE POLICY notifications_update ON notifications
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Food Share History: Users can view their own sharing history
DROP POLICY IF EXISTS food_share_history_select ON food_share_history;
CREATE POLICY food_share_history_select ON food_share_history
    FOR SELECT
    USING (auth.uid() = donor_id OR auth.uid() = volunteer_id);

DROP POLICY IF EXISTS food_share_history_insert ON food_share_history;
CREATE POLICY food_share_history_insert ON food_share_history
    FOR INSERT
    WITH CHECK (auth.uid() = donor_id OR auth.uid() = volunteer_id);

-- ============================================
-- SECTION 4: Automated Chat Functions & Triggers
-- ============================================

-- Function to create chat room and system message on pickup acceptance
CREATE OR REPLACE FUNCTION create_chat_on_pickup_acceptance()
RETURNS TRIGGER AS $$
DECLARE
    v_room_id UUID;
    v_listing_title TEXT;
    v_donor_id UUID;
BEGIN
    -- Only proceed if status changed to 'accepted' (booked state)
    IF NEW.status = 'accepted' AND (OLD IS NULL OR OLD.status != 'accepted') THEN
        
        -- Get listing details
        SELECT title, donor_id INTO v_listing_title, v_donor_id 
        FROM listings WHERE id = NEW.listing_id;
        
        -- Check if room already exists
        SELECT id INTO v_room_id 
        FROM chat_rooms 
        WHERE donor_id = v_donor_id AND volunteer_id = NEW.volunteer_id;
        
        IF v_room_id IS NULL THEN
            -- Create new chat room
            INSERT INTO chat_rooms (donor_id, volunteer_id)
            VALUES (v_donor_id, NEW.volunteer_id)
            RETURNING id INTO v_room_id;
            
            -- Welcome system message
            INSERT INTO chat_messages (room_id, sender_id, message_type, content, pickup_id)
            VALUES (
                v_room_id, 
                v_donor_id, 
                'system', 
                '🎉 Chat initiated! Pickup accepted for "' || v_listing_title || '"',
                NEW.id
            );
        ELSE
            -- Room exists, just add new pickup notification
            INSERT INTO chat_messages (room_id, sender_id, message_type, content, pickup_id)
            VALUES (
                v_room_id, 
                v_donor_id, 
                'system', 
                '📦 New pickup accepted: "' || v_listing_title || '"',
                NEW.id
            );
            
            -- Update last_message_at
            UPDATE chat_rooms SET last_message_at = now() WHERE id = v_room_id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on pickups table
DROP TRIGGER IF EXISTS trigger_chat_on_pickup_acceptance ON pickups;
CREATE TRIGGER trigger_chat_on_pickup_acceptance
    AFTER INSERT OR UPDATE ON pickups
    FOR EACH ROW
    EXECUTE FUNCTION create_chat_on_pickup_acceptance();

-- Function to add to food share history on delivery
CREATE OR REPLACE FUNCTION add_to_share_history()
RETURNS TRIGGER AS $$
DECLARE
    v_listing_title TEXT;
    v_donor_id UUID;
BEGIN
    IF NEW.status = 'delivered' AND (OLD IS NULL OR OLD.status != 'delivered') THEN
        SELECT title, donor_id INTO v_listing_title, v_donor_id 
        FROM listings WHERE id = NEW.listing_id;
        
        INSERT INTO food_share_history (donor_id, volunteer_id, pickup_id, listing_id, food_title)
        VALUES (v_donor_id, NEW.volunteer_id, NEW.id, NEW.listing_id, v_listing_title)
        ON CONFLICT DO NOTHING;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_add_to_share_history ON pickups;
CREATE TRIGGER trigger_add_to_share_history
    AFTER UPDATE ON pickups
    FOR EACH ROW
    EXECUTE FUNCTION add_to_share_history();

-- ============================================
-- VERIFICATION
-- ============================================
-- Run these queries to verify the migration:
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'profiles' AND column_name LIKE '%location%';
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'listings' AND column_name LIKE '%pickup%';
-- SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename LIKE 'chat%';
