-- Quick test to verify chat trigger exists
SELECT 
    trigger_name, 
    event_manipulation, 
    event_object_table,
    action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'trigger_chat_on_pickup_acceptance';

-- Check if function exists
SELECT proname, prosrc 
FROM pg_proc 
WHERE proname = 'create_chat_on_pickup_acceptance';

-- Test if chat rooms table has data
SELECT COUNT(*) as chat_room_count FROM chat_rooms;

-- Check recent pickups and their status
SELECT 
    p.id,
    p.status,
    p.volunteer_id,
    l.donor_id,
    l.title as food_title,
    p.created_at
FROM pickups p
JOIN listings l ON p.listing_id = l.id
ORDER BY p.created_at DESC
LIMIT 5;
