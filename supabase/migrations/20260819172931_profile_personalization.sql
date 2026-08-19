-- Personalized signup/onboarding (CLAUDE.md §7 student-facing flow):
-- self-declared status, country, study preferences, goals, and experience
-- level, used to filter the post-onboarding recommended sweep. Also adds
-- a status lifecycle and per-type notification flags to saved_opportunity,
-- since a save now needs to move through Goals -> Apply -> Applied ->
-- Archived and can independently ask for up to three distinct alerts
-- (opens / start-writing / closing) instead of the single "closing soon"
-- check the alert system had before.

create type profile_status as enum ('student', 'professor', 'organiser', 'other');
create type experience_level as enum ('high_school', 'undergraduate', 'graduate', 'professional');
create type saved_status as enum ('goals', 'apply', 'applied', 'archived');

alter table profiles
  add column first_name text,
  add column last_name text,
  add column status profile_status,
  add column country text,
  add column experience_level experience_level,
  add column onboarding_completed_at timestamptz;

-- Goals taxonomy — data, not schema, per CLAUDE.md §5: new options are an
-- INSERT into this table, never a migration. Starter set below.
create table goal (
  id text primary key,
  label_en text not null,
  label_el text not null,
  sort_order integer not null
);

alter table goal enable row level security;

create policy "goal is public read" on goal
  for select
  to anon, authenticated
  using (true);

insert into goal (id, label_en, label_el, sort_order) values
  ('find_funding', 'Find funding', 'Εύρεση χρηματοδότησης', 10),
  ('build_cv', 'Build my CV / experience', 'Χτίσιμο βιογραφικού / εμπειρίας', 20),
  ('get_into_program', 'Get into a specific programme', 'Εισαγωγή σε συγκεκριμένο πρόγραμμα', 30),
  ('explore_abroad', 'Explore studying abroad', 'Εξερεύνηση σπουδών στο εξωτερικό', 40),
  ('other', 'Something else', 'Κάτι άλλο', 50);

-- Study-preference and goal selections, multi-select junctions matching
-- the existing opportunity_<taxonomy> pattern (20260817070622_multiselect_taxonomy.sql).
-- Reuses the existing `field` taxonomy rather than inventing a second one.
create table profile_field (
  profile_id uuid not null references profiles(id) on delete cascade,
  field_id text not null references field(id) on delete cascade,
  primary key (profile_id, field_id)
);

create table profile_goal (
  profile_id uuid not null references profiles(id) on delete cascade,
  goal_id text not null references goal(id) on delete cascade,
  primary key (profile_id, goal_id)
);

alter table profile_field enable row level security;
alter table profile_goal enable row level security;

create policy "read own field preferences" on profile_field
  for select to authenticated using (auth.uid() = profile_id);
create policy "write own field preferences" on profile_field
  for insert to authenticated with check (auth.uid() = profile_id);
create policy "delete own field preferences" on profile_field
  for delete to authenticated using (auth.uid() = profile_id);

create policy "read own goals" on profile_goal
  for select to authenticated using (auth.uid() = profile_id);
create policy "write own goals" on profile_goal
  for insert to authenticated with check (auth.uid() = profile_id);
create policy "delete own goals" on profile_goal
  for delete to authenticated using (auth.uid() = profile_id);

-- Saved-opportunity lifecycle + per-alert-type tracking. Replaces the
-- single last_alert_sent_at (which only ever tracked one alert type,
-- "closing soon") with three independent timestamps, since a save can
-- now fire up to three distinct alerts over its life. The Edge Function
-- (supabase/functions/send-deadline-alerts) is updated in this same
-- change to match — see that file.
alter table saved_opportunity
  add column status saved_status not null default 'goals',
  add column notify_opens boolean not null default false,
  add column notify_start_writing boolean not null default false,
  add column notify_closing boolean not null default false,
  add column opens_alert_sent_at timestamptz,
  add column start_writing_alert_sent_at timestamptz,
  add column closing_alert_sent_at timestamptz;

update saved_opportunity set closing_alert_sent_at = last_alert_sent_at where last_alert_sent_at is not null;

alter table saved_opportunity drop column last_alert_sent_at;

-- Missing before now: saved_opportunity had insert/read/delete policies
-- but no update policy at all, so a student could never change a save's
-- status or notification flags from the client. Needed for the new
-- Goals/Apply/Applied/Archived board and the per-save notification bells.
create policy "update own saves" on saved_opportunity
  for update
  to authenticated
  using (auth.uid() = profile_id)
  with check (auth.uid() = profile_id);
