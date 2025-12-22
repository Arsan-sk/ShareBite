-- Give Admins Full Access to Profiles
-- This fixes the issue where "Verification Requests" list is empty because the join with profiles fails due to RLS.

create policy "Admins can view all profiles"
on public.profiles for select
using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- Ensure Verification Requests are visible (Redundant safety)
drop policy if exists "Admins view all requests" on public.verification_requests;
create policy "Admins view all requests"
on public.verification_requests for select
using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);
