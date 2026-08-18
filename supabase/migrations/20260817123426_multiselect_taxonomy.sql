-- Brings the schema in line with the real submission form that existed in
-- offmap-hub (.github/ISSUE_TEMPLATE/submit-opportunity.yml): several fields
-- that were single-select here are genuinely multi-select in practice
-- (an opportunity can be "Engineering and Technology" AND "Policy").

-- ============================================================
-- New lookup tables (taxonomy is data, not schema — same pattern as type/field)
-- ============================================================

create table academic_level (
  id text primary key,
  label_en text not null,
  label_el text not null,
  sort_order int not null
);
alter table academic_level enable row level security;
create policy "academic_level is public read" on academic_level for select to anon, authenticated using (true);

create table geo_scope (
  id text primary key,
  label_en text not null,
  label_el text not null,
  sort_order int not null
);
alter table geo_scope enable row level security;
create policy "geo_scope is public read" on geo_scope for select to anon, authenticated using (true);

create table audience_group (
  id text primary key,
  label_en text not null,
  label_el text not null,
  sort_order int not null
);
alter table audience_group enable row level security;
create policy "audience_group is public read" on audience_group for select to anon, authenticated using (true);

create table funding_feature (
  id text primary key,
  label_en text not null,
  label_el text not null,
  sort_order int not null
);
alter table funding_feature enable row level security;
create policy "funding_feature is public read" on funding_feature for select to anon, authenticated using (true);

-- ============================================================
-- opportunity: new free-text fields matching the real form
-- ============================================================

alter table opportunity add column host_city text;
alter table opportunity add column eligible_countries text; -- "Specific eligible countries or regions", free text
alter table opportunity add column funding_details text;
alter table opportunity add column audience_notes text;
alter table opportunity add column specific_majors text;
alter table opportunity add column application_requirements text;
alter table opportunity add column additional_information text;

-- for "no application link yet": set an expected window, a scheduled job
-- checks back during it. No separate status column needed — the query is
-- just "apply_url is null and expected_application_season is not null".
alter table opportunity add column expected_application_season text;
alter table opportunity add column application_link_last_checked_at timestamptz;

-- ============================================================
-- Move field_id (single FK) to a multi-select junction table
-- ============================================================

-- the view selects o.* and must be dropped before field_id can be dropped;
-- recreated identically at the end of this migration (field_id just won't
-- be part of o.* anymore going forward).
drop view opportunity_public;

create table opportunity_field (
  opportunity_id uuid not null references opportunity (id) on delete cascade,
  field_id text not null references field (id),
  primary key (opportunity_id, field_id)
);
alter table opportunity_field enable row level security;

insert into opportunity_field (opportunity_id, field_id)
select id, field_id from opportunity where field_id is not null;

alter table opportunity drop column field_id;

-- ============================================================
-- Junction tables for the other multi-selects
-- ============================================================

create table opportunity_academic_level (
  opportunity_id uuid not null references opportunity (id) on delete cascade,
  academic_level_id text not null references academic_level (id),
  primary key (opportunity_id, academic_level_id)
);
alter table opportunity_academic_level enable row level security;

create table opportunity_geo_scope (
  opportunity_id uuid not null references opportunity (id) on delete cascade,
  geo_scope_id text not null references geo_scope (id),
  primary key (opportunity_id, geo_scope_id)
);
alter table opportunity_geo_scope enable row level security;

create table opportunity_audience_group (
  opportunity_id uuid not null references opportunity (id) on delete cascade,
  audience_group_id text not null references audience_group (id),
  primary key (opportunity_id, audience_group_id)
);
alter table opportunity_audience_group enable row level security;

create table opportunity_funding_feature (
  opportunity_id uuid not null references opportunity (id) on delete cascade,
  funding_feature_id text not null references funding_feature (id),
  primary key (opportunity_id, funding_feature_id)
);
alter table opportunity_funding_feature enable row level security;

-- ============================================================
-- RLS for all five junction tables: same shape every time —
-- public can read a row only if its parent opportunity is publicly visible;
-- moderators have full access; ambassadors can manage rows on opportunities
-- they're allowed to edit (lead/in_review, per the opportunity RLS rules).
-- ============================================================

create policy "public read via opportunity visibility" on opportunity_field
  for select to anon, authenticated
  using (exists (
    select 1 from opportunity o where o.id = opportunity_id
    and o.review_state = 'published' and (o.deadline_at is null or o.deadline_at >= now())
  ));
create policy "moderators full access" on opportunity_field
  for all to authenticated using (is_moderator()) with check (is_moderator());
create policy "ambassadors manage pending" on opportunity_field
  for all to authenticated
  using (can_edit_opportunities() and exists (
    select 1 from opportunity o where o.id = opportunity_id and o.review_state in ('lead', 'in_review')
  ))
  with check (can_edit_opportunities() and exists (
    select 1 from opportunity o where o.id = opportunity_id and o.review_state in ('lead', 'in_review')
  ));

create policy "public read via opportunity visibility" on opportunity_academic_level
  for select to anon, authenticated
  using (exists (
    select 1 from opportunity o where o.id = opportunity_id
    and o.review_state = 'published' and (o.deadline_at is null or o.deadline_at >= now())
  ));
create policy "moderators full access" on opportunity_academic_level
  for all to authenticated using (is_moderator()) with check (is_moderator());
create policy "ambassadors manage pending" on opportunity_academic_level
  for all to authenticated
  using (can_edit_opportunities() and exists (
    select 1 from opportunity o where o.id = opportunity_id and o.review_state in ('lead', 'in_review')
  ))
  with check (can_edit_opportunities() and exists (
    select 1 from opportunity o where o.id = opportunity_id and o.review_state in ('lead', 'in_review')
  ));

create policy "public read via opportunity visibility" on opportunity_geo_scope
  for select to anon, authenticated
  using (exists (
    select 1 from opportunity o where o.id = opportunity_id
    and o.review_state = 'published' and (o.deadline_at is null or o.deadline_at >= now())
  ));
create policy "moderators full access" on opportunity_geo_scope
  for all to authenticated using (is_moderator()) with check (is_moderator());
create policy "ambassadors manage pending" on opportunity_geo_scope
  for all to authenticated
  using (can_edit_opportunities() and exists (
    select 1 from opportunity o where o.id = opportunity_id and o.review_state in ('lead', 'in_review')
  ))
  with check (can_edit_opportunities() and exists (
    select 1 from opportunity o where o.id = opportunity_id and o.review_state in ('lead', 'in_review')
  ));

create policy "public read via opportunity visibility" on opportunity_audience_group
  for select to anon, authenticated
  using (exists (
    select 1 from opportunity o where o.id = opportunity_id
    and o.review_state = 'published' and (o.deadline_at is null or o.deadline_at >= now())
  ));
create policy "moderators full access" on opportunity_audience_group
  for all to authenticated using (is_moderator()) with check (is_moderator());
create policy "ambassadors manage pending" on opportunity_audience_group
  for all to authenticated
  using (can_edit_opportunities() and exists (
    select 1 from opportunity o where o.id = opportunity_id and o.review_state in ('lead', 'in_review')
  ))
  with check (can_edit_opportunities() and exists (
    select 1 from opportunity o where o.id = opportunity_id and o.review_state in ('lead', 'in_review')
  ));

-- ============================================================
-- Recreate the view dropped above — same definition as before, minus field_id
-- ============================================================

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

create policy "public read via opportunity visibility" on opportunity_funding_feature
  for select to anon, authenticated
  using (exists (
    select 1 from opportunity o where o.id = opportunity_id
    and o.review_state = 'published' and (o.deadline_at is null or o.deadline_at >= now())
  ));
create policy "moderators full access" on opportunity_funding_feature
  for all to authenticated using (is_moderator()) with check (is_moderator());
create policy "ambassadors manage pending" on opportunity_funding_feature
  for all to authenticated
  using (can_edit_opportunities() and exists (
    select 1 from opportunity o where o.id = opportunity_id and o.review_state in ('lead', 'in_review')
  ))
  with check (can_edit_opportunities() and exists (
    select 1 from opportunity o where o.id = opportunity_id and o.review_state in ('lead', 'in_review')
  ));
