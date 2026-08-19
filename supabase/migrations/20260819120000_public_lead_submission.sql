-- Public /submit route (CLAUDE.md §7, §12 step 10): a stranger with no
-- account can send a link and a type. This is the only way an anon
-- session can ever write to `opportunity` — every other write path
-- (admin/new, admin's edit/publish/reject) requires an authenticated
-- ambassador or moderator (see 20260817093154_ambassador_moderator_roles.sql).
--
-- The with_check clause is deliberately restrictive, not just "review_state
-- = lead": it also pins source_type and blocks every gate/AI/provenance
-- field from being set on the insert itself. Without that, a crafted
-- request could try to smuggle funding/eligibility/apply_url/last_verified_at
-- etc. straight past an ambassador's eyes on day one — the publish_gate
-- CHECK constraint only stops review_state from reaching 'published' with
-- those fields missing, it does nothing to stop an anon caller from
-- filling them in on a 'lead' row and hoping nobody re-checks. Locking the
-- insert down here keeps "everything past official_url + type is OffMap's
-- job" true structurally, not just by convention.
create policy "public can submit leads" on opportunity
  for insert
  to anon, authenticated
  with check (
    review_state = 'lead'
    and source_type = 'submission'
    and official_url is not null
    and type_id is not null
    and verified_by is null
    and last_verified_at is null
    and apply_url is null
    and funding is null
    and eligibility is null
    and prep_time is null
    and reach is null
    and format is null
    and deadline_at is null
    and opens_at is null
    and excluded_claims is null
    and missing_information is null
    and ai_research is null
    and ai_research_at is null
    and apply_url_candidate is null
    and apply_url_candidate_note is null
    and application_link_last_checked_at is null
  );
