-- Replaces the single is_admin flag with two real roles. Neither is
-- self-assignable — role is only ever set by direct SQL, never through the app.

-- Drop the old is_admin-based policies first: they depend on is_admin(), so
-- the function can't be dropped until they're gone.
drop policy if exists "admins read all opportunities" on opportunity;
drop policy if exists "admins insert opportunities" on opportunity;
drop policy if exists "admins update opportunities" on opportunity;
drop policy if exists "admins delete opportunities" on opportunity;

create type profile_role as enum ('ambassador', 'moderator');

alter table profiles add column role profile_role;
-- no rows exist yet with is_admin = true, so this is a clean cutover
alter table profiles drop column is_admin;

drop function if exists public.is_admin();

create or replace function public.is_moderator()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select coalesce((select role = 'moderator' from profiles where id = auth.uid()), false);
$$;

create or replace function public.can_edit_opportunities()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select coalesce((select role in ('ambassador', 'moderator') from profiles where id = auth.uid()), false);
$$;

revoke execute on function public.is_moderator() from public;
grant execute on function public.is_moderator() to authenticated;
revoke execute on function public.can_edit_opportunities() from public;
grant execute on function public.can_edit_opportunities() to authenticated;

-- Moderators: full, unrestricted access. They're the final say on publish/reject.
create policy "moderators read all opportunities" on opportunity
  for select to authenticated using (is_moderator());

create policy "moderators insert opportunities" on opportunity
  for insert to authenticated with check (is_moderator());

create policy "moderators update opportunities" on opportunity
  for update to authenticated using (is_moderator()) with check (is_moderator());

create policy "moderators delete opportunities" on opportunity
  for delete to authenticated using (is_moderator());

-- Ambassadors: can see and edit any listing (not just their own submissions),
-- and create new ones, but can never move a row to published/rejected/archived
-- themselves and can never delete. The publish gate constraint plus this role
-- boundary means every published listing was moderator-touched at least once.
create policy "ambassadors read all opportunities" on opportunity
  for select to authenticated using (can_edit_opportunities());

create policy "ambassadors insert opportunities" on opportunity
  for insert to authenticated
  with check (can_edit_opportunities() and review_state in ('lead', 'in_review'));

create policy "ambassadors update pending opportunities" on opportunity
  for update to authenticated
  using (can_edit_opportunities())
  with check (can_edit_opportunities() and review_state in ('lead', 'in_review'));
