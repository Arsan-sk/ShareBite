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
  SELECT id INTO v_room_id FROM public.chat_rooms WHERE donor_id = v_donor_id AND volunteer_id = p_volunteer_id;
  
  IF v_room_id IS NOT NULL THEN
      INSERT INTO public.chat_messages (room_id, sender_id, message_type, content, pickup_id)
      VALUES (
          v_room_id,
          p_volunteer_id, -- Sent by volunteer (system msg)
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
