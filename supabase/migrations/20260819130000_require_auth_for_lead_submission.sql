-- /submit now requires a signed-in account (Elena's call, 19 Aug —
-- supersedes the "submit never requires an account" clause in ADR 0005;
-- see CLAUDE.md §12 step 10). This does not relax the publish-gate CHECK
-- constraint or add any new gate-field access — it only narrows who may
-- use the insert path added in 20260819120000_public_lead_submission.sql
-- from "anon, authenticated" to "authenticated" only. Forward-only per
-- CLAUDE.md §4: that migration is left as applied history, not edited.
drop policy "public can submit leads" on opportunity;

create policy "signed-in students can submit leads" on opportunity
  for insert
  to authenticated
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
