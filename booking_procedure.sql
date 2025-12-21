-- Secure Booking Function
create or replace function public.book_listing(
  p_listing_id uuid,
  p_volunteer_id uuid
)
returns boolean
language plpgsql
security definer -- Bypass RLS
as $$
declare
  v_listing_owner_id uuid;
begin
  -- 1. Check if listing is available and get owner
  select donor_id into v_listing_owner_id
  from public.listings
  where id = p_listing_id and status = 'available';

  if v_listing_owner_id is null then
    return false; -- Not found or not available
  end if;

  -- 2. Update listing status
  update public.listings
  set status = 'booked'
  where id = p_listing_id;

  -- 3. Create pickup record
  insert into public.pickups (listing_id, volunteer_id, status)
  values (p_listing_id, p_volunteer_id, 'pending');

  -- 4. Create Notification for Donor
  insert into public.notifications (user_id, type, title, message, link)
  values (
    v_listing_owner_id,
    'pickup_request',
    'New Pickup Request',
    'Your listing has been requested for pickup.',
    '/listings/' || p_listing_id
  );

  return true;
end;
$$;
