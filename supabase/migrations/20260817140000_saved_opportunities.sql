-- Server-side saved opportunities for signed-in students. Guests keep using
-- local-only storage (ADR 0005) — this table only ever holds authenticated
-- students' own saves, never guest data.
create table saved_opportunity (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles (id) on delete cascade,
  opportunity_id uuid not null references opportunity (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (profile_id, opportunity_id)
);

alter table saved_opportunity enable row level security;

-- A student can only ever see, add, or remove their own saves. No policy
-- anywhere lets one student see another's saved list.
create policy "read own saves" on saved_opportunity
  for select
  to authenticated
  using (auth.uid() = profile_id);

create policy "insert own saves" on saved_opportunity
  for insert
  to authenticated
  with check (auth.uid() = profile_id);

create policy "delete own saves" on saved_opportunity
  for delete
  to authenticated
  using (auth.uid() = profile_id);

-- no update policy: a save is toggled via insert/delete, not edited
