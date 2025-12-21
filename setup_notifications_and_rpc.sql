-- 1. Create Notifications Table if it doesn't exist
create table if not exists public.notifications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) not null,
  type text not null,
  title text not null,
  message text,
  link text,
  is_read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Drop policies to avoid conflicts if re-running
drop policy if exists "Users can view their own notifications" on public.notifications;
drop policy if exists "Server can insert notifications" on public.notifications;

alter table public.notifications enable row level security;

create policy "Users can view their own notifications"
  on public.notifications for select
  using ( auth.uid() = user_id );

create policy "Server can insert notifications"
  on public.notifications for insert
  with check ( true );

-- 3. Secure Booking Function (Re-runnable)
create or replace function public.book_listing(
  p_listing_id uuid,
  p_volunteer_id uuid
)
returns boolean
language plpgsql
security definer
as $$
declare
  v_listing_owner_id uuid;
begin
  -- Check availability
  select donor_id into v_listing_owner_id
  from public.listings
  where id = p_listing_id and status = 'available';

  if v_listing_owner_id is null then
    return false;
  end if;

  -- Update listing
  update public.listings
  set status = 'booked'
  where id = p_listing_id;

  -- Insert pickup
  insert into public.pickups (listing_id, volunteer_id, status)
  values (p_listing_id, p_volunteer_id, 'pending');

  -- Notification
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
