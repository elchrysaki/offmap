-- Supports two AI-assisted features:
-- 1. On-demand "verify with AI" in the admin dashboard (human-triggered, human-reviewed).
-- 2. A scheduled checker for listings whose application link isn't live yet.
-- Neither writes directly to a gate field (apply_url, funding, etc.) — findings
-- land in candidate/notes columns for a moderator to review and apply by hand.
-- This is the same "never publish an inference" boundary as excluded_claims (§6).

alter table opportunity add column ai_research jsonb;
alter table opportunity add column ai_research_at timestamptz;

alter table opportunity add column apply_url_candidate text;
alter table opportunity add column apply_url_candidate_note text;

drop view opportunity_public;

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
