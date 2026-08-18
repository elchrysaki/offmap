-- One row per authenticated user, linked to Supabase's built-in auth.users.
-- No birthdate, no parental-consent flow: 16+ is self-declared once, at signup,
-- and a profile can't exist without that confirmation (CLAUDE.md §2 non-negotiable #8).
create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  age_confirmed_16_plus boolean not null,
  age_confirmed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint must_confirm_16_plus check (age_confirmed_16_plus = true)
);

alter table profiles enable row level security;

-- A user can see and manage only their own row. No student-to-student
-- visibility of any kind (CLAUDE.md §2 non-negotiable #2) — there is no
-- policy anywhere that lets one user select another user's profile.
create policy "read own profile" on profiles
  for select
  to authenticated
  using (auth.uid() = id);

create policy "insert own profile" on profiles
  for insert
  to authenticated
  with check (auth.uid() = id);

create policy "update own profile" on profiles
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- deliberately no delete policy yet: account deletion isn't built,
-- so there's nothing that should be able to remove a profile row.
