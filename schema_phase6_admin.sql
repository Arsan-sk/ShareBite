-- PHASE 6: ADMIN & VERIFICATION SCHEMA
-- -----------------------------------------------------------------------------
-- This script adds the Verification System tables and Admin updates.
-- -----------------------------------------------------------------------------

-- 1. Create Verification Requests Table
create type verification_status as enum ('pending', 'approved', 'rejected');

create table public.verification_requests (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) not null,
  status verification_status default 'pending',
  document_url text, -- URL to the uploaded proof (ID/License)
  submitted_at timestamp with time zone default timezone('utc'::text, now()) not null,
  reviewed_at timestamp with time zone,
  reviewed_by uuid references public.profiles(id),
  rejection_reason text,
  
  -- Prevent multiple pending requests for same user
  constraint unique_pending_request unique (user_id, status)
);

-- 2. Update Profiles Table (Add Verification Details)
alter table public.profiles 
add column if not exists verified_at timestamp with time zone,
add column if not exists verified_by uuid references public.profiles(id);

-- 3. RLS Policies for Verification Requests

alter table public.verification_requests enable row level security;

-- A. Users can view their own requests
create policy "Users view own requests" 
on public.verification_requests for select 
using (auth.uid() = user_id);

-- B. Admins can view ALL requests
-- (We'll assume Admins have role='admin' in public.profiles)
create policy "Admins view all requests" 
on public.verification_requests for select 
using ( 
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin') 
);

-- C. Users can insert (Create Request)
create policy "Users can create requests" 
on public.verification_requests for insert 
with check (auth.uid() = user_id);

-- D. Admins can update (Approve/Reject)
create policy "Admins can update requests" 
on public.verification_requests for update 
using ( 
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin') 
);

-- 4. Storage Bucket Policy Update (Allow Uploads for Verification)
-- We reuse 'sharebite-assets'. Existing policies allow authenticated uploads, which is fine.
-- But logically, we might want a separate folder or bucket for sensitive docs.
-- For MVP, we stick to 'sharebite-assets/verification/'. 
-- Policy "Verified or Auth" covers it.

-- 5. Helper Function: Approve Verification
-- This RPC safely updates both the request status AND the user profile.
create or replace function public.approve_verification(p_request_id uuid, p_admin_id uuid)
returns boolean language plpgsql security definer as $$
declare
  v_target_user_id uuid;
begin
  -- 1. Check Admin Permission (Double check)
  if not exists (select 1 from public.profiles where id = p_admin_id and role = 'admin') then
    raise exception 'Unauthorized';
  end if;

  -- 2. Get Request Details
  select user_id into v_target_user_id from public.verification_requests where id = p_request_id;
  
  if v_target_user_id is null then return false; end if;

  -- 3. Update Request
  update public.verification_requests 
  set status = 'approved', reviewed_at = now(), reviewed_by = p_admin_id 
  where id = p_request_id;

  -- 4. Update Profile
  update public.profiles 
  set is_verified = true, verified_at = now(), verified_by = p_admin_id
  where id = v_target_user_id;

  -- 5. Send Notification
  insert into public.notifications (user_id, type, title, message, link)
  values (v_target_user_id, 'info', 'You are Verified!', 'Your account has been officially verified.', '/profile');

  return true;
end;
$$;

create or replace function public.reject_verification(p_request_id uuid, p_admin_id uuid, p_reason text)
returns boolean language plpgsql security definer as $$
declare
  v_target_user_id uuid;
begin
     -- 1. Check Admin Permission
  if not exists (select 1 from public.profiles where id = p_admin_id and role = 'admin') then
    raise exception 'Unauthorized';
  end if;

  select user_id into v_target_user_id from public.verification_requests where id = p_request_id;

  update public.verification_requests 
  set status = 'rejected', reviewed_at = now(), reviewed_by = p_admin_id, rejection_reason = p_reason
  where id = p_request_id;

  insert into public.notifications (user_id, type, title, message, link)
  values (v_target_user_id, 'info', 'Verification Rejected', 'Reason: ' || p_reason, '/profile');

  return true;
end;
$$;
