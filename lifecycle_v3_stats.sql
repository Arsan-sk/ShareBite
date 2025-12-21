-- UPDATED: Lifecycle State Management with EMAIL Notifications & STATS

-- A. Request Pickup (Volunteer/NGO action)
create or replace function public.request_pickup(
  p_listing_id uuid,
  p_volunteer_id uuid
)
returns boolean
language plpgsql
security definer
as $$
declare
  v_listing_owner_id uuid;
  v_listing_status text;
  v_volunteer_email text;
  v_listing_title text;
begin
  -- Check listing status
  select donor_id, status, title into v_listing_owner_id, v_listing_status, v_listing_title
  from public.listings
  where id = p_listing_id;

  if v_listing_status != 'available' then
    return false; -- Listing not available
  end if;

  -- Get volunteer email
  select email into v_volunteer_email from public.profiles where id = p_volunteer_id;

  -- Prevent duplicate requests
  if exists (select 1 from public.pickups where listing_id = p_listing_id and volunteer_id = p_volunteer_id) then
    return false;
  end if;

  -- Insert pending pickup
  insert into public.pickups (listing_id, volunteer_id, status)
  values (p_listing_id, p_volunteer_id, 'pending');

  -- Notify Donor with EMAIL in message
  insert into public.notifications (user_id, type, title, message, link)
  values (
    v_listing_owner_id,
    'pickup_request',
    'New Pickup Request',
    'User ' || coalesce(v_volunteer_email, 'Unknown') || ' requested to pickup "' || v_listing_title || '". Check Activity to Accept/Reject.',
    '/activity'
  );

  return true;
end;
$$;

-- B. Accept Pickup (Donor action)
create or replace function public.accept_pickup(
  p_pickup_id uuid,
  p_donor_id uuid
)
returns boolean
language plpgsql
security definer
as $$
declare
  v_listing_id uuid;
  v_volunteer_id uuid;
begin
  -- Verify ownership and get IDs
  select listing_id, volunteer_id into v_listing_id, v_volunteer_id
  from public.pickups
  join public.listings on pickups.listing_id = listings.id
  where pickups.id = p_pickup_id and listings.donor_id = p_donor_id;

  if v_listing_id is null then
    return false; -- Unauthorized or invalid
  end if;

  -- 1. Update Listing -> Booked
  update public.listings set status = 'booked' where id = v_listing_id;

  -- 2. Update Target Pickup -> Accepted
  update public.pickups set status = 'accepted' where id = p_pickup_id;

  -- 3. Reject other pending pickups
  update public.pickups 
  set status = 'rejected' 
  where listing_id = v_listing_id and id != p_pickup_id and status = 'pending';

  -- 4. Notify Volunteer
  insert into public.notifications (user_id, type, title, message, link)
  values (
    v_volunteer_id,
    'pickup_accepted',
    'Request Accepted',
    'Your pickup request was accepted! Please proceed to pickup.',
    '/activity'
  );

  return true;
end;
$$;

-- C. Confirm Pickup (Donor action - Handover)
create or replace function public.confirm_pickup(
  p_listing_id uuid,
  p_donor_id uuid
)
returns boolean
language plpgsql
security definer
as $$
begin
  -- Validate ownership
  if not exists (select 1 from public.listings where id = p_listing_id and donor_id = p_donor_id) then
    return false;
  end if;

  -- Update Listing
  update public.listings set status = 'picked_up' where id = p_listing_id;
  
  -- Update Linked Accepted Pickup
  update public.pickups set status = 'picked_up', pickup_time = now()
  where listing_id = p_listing_id and status = 'accepted';

  return true;
end;
$$;

-- D. Complete Delivery (Volunteer action - Dropoff) + STATS UPDATE
create or replace function public.complete_delivery(
  p_listing_id uuid,
  p_volunteer_id uuid
)
returns boolean
language plpgsql
security definer
as $$
declare 
    v_donor_id uuid;
begin
  -- Get donor id for notification
  select donor_id into v_donor_id from public.listings where id = p_listing_id;

  -- Update Pickup
  update public.pickups 
  set status = 'delivered', completed_at = now()
  where listing_id = p_listing_id and volunteer_id = p_volunteer_id and status = 'picked_up';
  
  if not found then
    return false;
  end if;

  -- Update Listing
  update public.listings set status = 'delivered' where id = p_listing_id;

  -- STATS: Update Donor Stats (Impact Score + 5, Meals Shared + 1)
  update public.profiles
  set impact_score = coalesce(impact_score, 0) + 5,
      meals_shared = coalesce(meals_shared, 0) + 1
  where id = v_donor_id;

  -- STATS: Update Volunteer Stats (Impact Score + 10)
  update public.profiles
  set impact_score = coalesce(impact_score, 0) + 10
  where id = p_volunteer_id;

  -- Notify Donor
  insert into public.notifications (user_id, type, title, message, link)
  values (
    v_donor_id,
    'delivery_completed',
    'Food Delivered',
    'Your food donation has need delivered! +5 Impact Score.',
    '/activity'
  );

  return true;
end;
$$;
