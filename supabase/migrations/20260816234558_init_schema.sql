-- Closed sets that will never grow or need Greek translation.
create type format as enum ('online', 'in_person', 'hybrid');
create type reach as enum ('local', 'national', 'international');
create type review_state as enum ('lead', 'in_review', 'published', 'rejected', 'archived');
create type funding as enum ('fully_funded', 'partially_funded', 'unfunded');
create type prep_time as enum ('under_an_hour', 'a_weekend', 'longer');
create type source_type as enum ('ambassador', 'submission', 'pipeline');
create type deadline_precision as enum ('exact', 'month', 'unknown', 'rolling');

-- Taxonomy is data, not schema. Adding a category is an INSERT, never a migration.
create table type (
  id text primary key,
  label_en text not null,
  label_el text not null,
  sort_order int not null
);
alter table type enable row level security;
create policy "type is public read" on type for select to anon, authenticated using (true);

create table field (
  id text primary key,
  label_en text not null,
  label_el text not null,
  sort_order int not null
);
alter table field enable row level security;
create policy "field is public read" on field for select to anon, authenticated using (true);

create table opportunity (
  id uuid primary key default gen_random_uuid(),

  -- core: official_url + type_id are the minimum bar for 'lead', so they're required on every row
  title text,
  organiser text,
  official_url text not null,
  apply_url text,
  type_id text not null references type (id),
  field_id text references field (id),
  format format,
  reach reach,
  country text,

  -- gate fields
  funding funding,
  eligibility text,
  prep_time prep_time,

  -- dates: _raw preserves what the source literally said, deadline_at is the normalized value
  deadline_raw text,
  deadline_at timestamptz,
  deadline_precision deadline_precision not null default 'unknown',
  opens_at timestamptz,

  -- never-publish-an-inference (CLAUDE.md §6)
  excluded_claims text,
  missing_information text,

  -- provenance
  source_type source_type not null default 'submission',
  submitted_by text,
  verified_by text,
  last_verified_at timestamptz,

  review_state review_state not null default 'lead',

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- published requires funding, eligibility, reach, prep_time, last_verified_at, official_url, apply_url
  -- (official_url is already enforced not null above for every state)
  constraint publish_gate check (
    review_state != 'published'
    or (
      funding is not null
      and eligibility is not null
      and reach is not null
      and prep_time is not null
      and last_verified_at is not null
      and official_url is not null
      and apply_url is not null
    )
  )
);

alter table opportunity enable row level security;

-- anon/authenticated can only ever read published rows whose deadline hasn't passed.
-- rolling and null-deadline published rows are always visible.
create policy "published and not expired" on opportunity
  for select
  to anon, authenticated
  using (
    review_state = 'published'
    and (deadline_at is null or deadline_at >= now())
  );

-- derived values are computed here, never stored: days_remaining, status
-- security_invoker is required: without it, this view runs with the owner's
-- permissions and silently bypasses the RLS policy on opportunity above.
create view opportunity_public
  with (security_invoker = true)
as
select
  o.*,
  case
    when o.deadline_at is null then null
    else greatest(0, ceil(extract(epoch from (o.deadline_at - now())) / 86400))::int
  end as days_remaining,
  case
    when o.deadline_precision = 'rolling' then 'rolling'
    when o.deadline_at is null then 'unknown'
    when o.deadline_at < now() then 'closed'
    when o.deadline_at <= now() + interval '14 days' then 'closing_soon'
    when o.opens_at is not null and o.opens_at > now() then 'opens_soon'
    else 'open'
  end as status
from opportunity o;
