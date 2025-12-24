-- =================================================================
-- FIX: Merge Duplicate Chat Rooms & Enforce Bidirectional Uniqueness
-- =================================================================

DO $$
DECLARE
    r RECORD;
    primary_id UUID;
    secondary_id UUID;
BEGIN
    -- 1. Identify and Merge Duplicates
    -- We look for cases where two rooms exist for the same pair of users but in swapped roles
    -- (A, B) and (B, A)
    FOR r IN 
        SELECT r1.id as id1, r2.id as id2, r1.donor_id, r1.volunteer_id
        FROM chat_rooms r1
        JOIN chat_rooms r2 ON r1.donor_id = r2.volunteer_id AND r1.volunteer_id = r2.donor_id
        WHERE r1.donor_id < r1.volunteer_id -- Canonical order to process pair only once
    LOOP
        primary_id := r.id1;
        secondary_id := r.id2;
        
        RAISE NOTICE 'Merging Room % (Secondary) into % (Primary)', secondary_id, primary_id;
        
        -- Move all messages from secondary room to primary room
        UPDATE chat_messages 
        SET room_id = primary_id 
        WHERE room_id = secondary_id;
        
        -- Delete the empty secondary room
        DELETE FROM chat_rooms WHERE id = secondary_id;
    END LOOP;
END$$;

-- 2. Enforce Uniqueness at Database Level
-- Drop old constraint that only checked (donor, volunteer) order
ALTER TABLE chat_rooms DROP CONSTRAINT IF EXISTS unique_chat_pair;

-- Create new unique index on the PAIR of users, regardless of order
-- distinct (LEAST(a,b), GREATEST(a,b)) ensures (A,B) and (B,A) are treated as same key
CREATE UNIQUE INDEX IF NOT EXISTS idx_chat_rooms_unique_participants 
ON chat_rooms (LEAST(donor_id, volunteer_id), GREATEST(donor_id, volunteer_id));


-- 3. Update Function: create_chat_on_pickup_acceptance
-- Must check for EXISTING room in EITHER direction
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
        
        -- Check if room already exists (Bidirectional Check)
        SELECT id INTO v_room_id 
        FROM chat_rooms 
        WHERE (donor_id = v_donor_id AND volunteer_id = NEW.volunteer_id)
           OR (donor_id = NEW.volunteer_id AND volunteer_id = v_donor_id);
        
        IF v_room_id IS NULL THEN
            -- Create new chat room
            -- We just insert them as given. The index prevents duplicates.
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


-- 4. Update Function: complete_delivery (from previous turn)
-- Must also check bidirectional to send completion message
CREATE OR REPLACE FUNCTION public.complete_delivery(
  p_listing_id uuid,
  p_volunteer_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE 
    v_donor_id uuid;
    v_room_id uuid;
    v_listing_title text;
    v_pickup_id uuid;
BEGIN
  -- Get donor id and title
  SELECT donor_id, title INTO v_donor_id, v_listing_title FROM public.listings WHERE id = p_listing_id;

  -- Update Pickup and get ID
  UPDATE public.pickups 
  SET status = 'delivered', completed_at = now()
  WHERE listing_id = p_listing_id AND volunteer_id = p_volunteer_id AND status = 'picked_up'
  RETURNING id INTO v_pickup_id;
  
  IF NOT FOUND THEN
    RETURN false;
  END IF;

  -- Update Listing
  UPDATE public.listings SET status = 'delivered' WHERE id = p_listing_id;

  -- STATS: Update Donor Stats (Impact Score + 5, Meals Shared + 1)
  UPDATE public.profiles
  SET impact_score = coalesce(impact_score, 0) + 5,
      meals_shared = coalesce(meals_shared, 0) + 1
  WHERE id = v_donor_id;

  -- STATS: Update Volunteer Stats (Impact Score + 10)
  UPDATE public.profiles
  SET impact_score = coalesce(impact_score, 0) + 10
  WHERE id = p_volunteer_id;

  -- Notify Donor
  INSERT INTO public.notifications (user_id, type, title, message, link)
  VALUES (
    v_donor_id,
    'delivery_completed',
    'Food Delivered',
    'Your food donation has need delivered! +5 Impact Score.',
    '/activity'
  );

  -- CHAT: Send "Delivery Complete" System Message
  -- BIDIRECTIONAL CHECK
  SELECT id INTO v_room_id 
  FROM public.chat_rooms 
  WHERE (donor_id = v_donor_id AND volunteer_id = p_volunteer_id)
     OR (donor_id = p_volunteer_id AND volunteer_id = v_donor_id);
  
  IF v_room_id IS NOT NULL THEN
      INSERT INTO public.chat_messages (room_id, sender_id, message_type, content, pickup_id)
      VALUES (
          v_room_id,
          p_volunteer_id, 
          'system',
          '✅ Delivery Complete! "' || v_listing_title || '" has been successfully delivered. Thank you! 🙏',
          v_pickup_id
      );
      
      -- Update room activity
      UPDATE public.chat_rooms SET last_message_at = now() WHERE id = v_room_id;
  END IF;

  RETURN true;
END;
$$;
