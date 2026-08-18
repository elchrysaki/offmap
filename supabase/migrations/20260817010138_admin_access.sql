-- Admin flag: manually flipped to true for authorized reviewers only, never
-- self-serve (no signup flow sets this). Defaults false for every new profile.
alter table profiles add column is_admin boolean not null default false;

-- SECURITY DEFINER so this can check profiles.is_admin without RLS recursion
-- (a normal policy calling back into a table it's guarding would deadlock).
-- search_path is pinned to prevent search-path hijacking on a definer function.
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select coalesce((select is_admin from profiles where id = auth.uid()), false);
$$;

-- Admins can see and manage every opportunity row, regardless of review_state
-- or deadline — the public policy (published + not expired) stays untouched
-- and applies to everyone else. Postgres OR-combines permissive policies, so
-- this is additive, not a replacement.
create policy "admins read all opportunities" on opportunity
  for select
  to authenticated
  using (is_admin());

create policy "admins insert opportunities" on opportunity
  for insert
  to authenticated
  with check (is_admin());

create policy "admins update opportunities" on opportunity
  for update
  to authenticated
  using (is_admin())
  with check (is_admin());

create policy "admins delete opportunities" on opportunity
  for delete
  to authenticated
  using (is_admin());
