-- ============================================
-- Phase 8: Chat Enhancements
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Add read_at column to chat_messages for read status tracking
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS read_at TIMESTAMP WITH TIME ZONE;

-- 2. Add unread count columns to chat_rooms
ALTER TABLE chat_rooms ADD COLUMN IF NOT EXISTS donor_unread_count INTEGER DEFAULT 0;
ALTER TABLE chat_rooms ADD COLUMN IF NOT EXISTS volunteer_unread_count INTEGER DEFAULT 0;

-- 3. Function to increment unread count when new message arrives
CREATE OR REPLACE FUNCTION increment_unread_count()
RETURNS TRIGGER AS $$
DECLARE
    v_donor_id UUID;
    v_volunteer_id UUID;
BEGIN
    -- Get the participants
    SELECT donor_id, volunteer_id INTO v_donor_id, v_volunteer_id
    FROM chat_rooms WHERE id = NEW.room_id;
    
    -- Increment unread for the other user (not the sender)
    IF NEW.sender_id = v_donor_id THEN
        -- Sender is donor, increment volunteer's unread
        UPDATE chat_rooms 
        SET volunteer_unread_count = volunteer_unread_count + 1,
            last_message_at = NOW()
        WHERE id = NEW.room_id;
    ELSIF NEW.sender_id = v_volunteer_id THEN
        -- Sender is volunteer, increment donor's unread
        UPDATE chat_rooms 
        SET donor_unread_count = donor_unread_count + 1,
            last_message_at = NOW()
        WHERE id = NEW.room_id;
    ELSE
        -- System message, just update last_message_at
        UPDATE chat_rooms SET last_message_at = NOW() WHERE id = NEW.room_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Drop existing trigger if any and create new one
DROP TRIGGER IF EXISTS on_new_chat_message ON chat_messages;
CREATE TRIGGER on_new_chat_message
    AFTER INSERT ON chat_messages
    FOR EACH ROW
    EXECUTE FUNCTION increment_unread_count();

-- 5. Function to mark messages as read and reset unread count
CREATE OR REPLACE FUNCTION mark_chat_as_read(p_room_id UUID, p_user_id UUID)
RETURNS VOID AS $$
DECLARE
    v_donor_id UUID;
    v_volunteer_id UUID;
BEGIN
    -- Get participants
    SELECT donor_id, volunteer_id INTO v_donor_id, v_volunteer_id
    FROM chat_rooms WHERE id = p_room_id;
    
    -- Mark all messages from other user as read
    UPDATE chat_messages
    SET read_at = NOW()
    WHERE room_id = p_room_id 
      AND sender_id != p_user_id 
      AND read_at IS NULL;
    
    -- Reset unread count for current user
    IF p_user_id = v_donor_id THEN
        UPDATE chat_rooms SET donor_unread_count = 0 WHERE id = p_room_id;
    ELSIF p_user_id = v_volunteer_id THEN
        UPDATE chat_rooms SET volunteer_unread_count = 0 WHERE id = p_room_id;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Function to get total unread count for a user
CREATE OR REPLACE FUNCTION get_total_unread_count(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
    total_count INTEGER;
BEGIN
    SELECT COALESCE(SUM(
        CASE 
            WHEN donor_id = p_user_id THEN donor_unread_count
            WHEN volunteer_id = p_user_id THEN volunteer_unread_count
            ELSE 0
        END
    ), 0) INTO total_count
    FROM chat_rooms
    WHERE donor_id = p_user_id OR volunteer_id = p_user_id;
    
    RETURN total_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Enable realtime for chat_messages table
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;

-- Done!
SELECT 'Phase 8 Chat Enhancements Applied Successfully!' as status;
