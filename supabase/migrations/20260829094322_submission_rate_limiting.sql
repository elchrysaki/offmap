-- Lightweight append-only log for rate-limiting the public /submit form.
-- Deliberately separate from `opportunity` so this never touches the
-- publish-gate / lead RLS surface (see the "signed-in students can submit
-- leads" policy) -- this table only ever answers "how many times has this
-- account tried recently," nothing about listing content.
create table public.submission_attempt (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references auth.users(id) on delete cascade,
  official_url text not null,
  created_at timestamptz not null default now()
);

create index submission_attempt_profile_id_created_at_idx
  on public.submission_attempt (profile_id, created_at desc);

alter table public.submission_attempt enable row level security;

create policy "insert own submission attempts"
  on public.submission_attempt
  for insert
  to authenticated
  with check (profile_id = (select auth.uid()));

create policy "select own submission attempts"
  on public.submission_attempt
  for select
  to authenticated
  using (profile_id = (select auth.uid()));
