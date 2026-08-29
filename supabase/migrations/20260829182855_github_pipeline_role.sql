-- A dedicated, least-privilege Postgres role for the Stage 2 GitHub Actions
-- research pipeline (CLAUDE.md §15's staged AI-scale plan). Deliberately
-- NOT the anon/authenticated PostgREST roles and NOT service_role --
-- connects directly over Postgres (psycopg2) so column-level grants can
-- enforce §6's gate-field boundary at the database layer, not just in
-- application code: this role can read opportunity rows and write research
-- findings, and is physically incapable of writing a gate field, no matter
-- what the Python script does.
--
-- No password is set here on purpose -- passwords never belong in a
-- committed migration. Elena sets it once, directly against the live
-- database, with:
--   alter role github_pipeline with password '<generate one>';
-- then builds the GitHub Actions secret from her project's own connection
-- string with this role's name/password substituted in.
create role github_pipeline with login nosuperuser nocreatedb nocreaterole noinherit noreplication connection limit 3;

grant usage on schema public to github_pipeline;

-- Full-row read of pending rows only: the pipeline needs every existing
-- field (title, organiser, current funding/eligibility/etc.) to know what's
-- already on file, the same "Current value on file" context the Gemini
-- prompt already receives.
grant select on public.opportunity to github_pipeline;

create policy "github pipeline reads pending opportunities"
  on public.opportunity
  for select
  to github_pipeline
  using (review_state in ('lead', 'in_review'));

-- Column-scoped on purpose: even a compromised or buggy script literally
-- cannot UPDATE apply_url, funding, deadline_at, or any other gate field
-- through this role -- the grant doesn't extend to those columns at all.
grant update (ai_research, ai_research_at, apply_url_candidate, apply_url_candidate_note, review_state)
  on public.opportunity to github_pipeline;

create policy "github pipeline updates pending opportunities"
  on public.opportunity
  for update
  to github_pipeline
  using (review_state in ('lead', 'in_review'))
  with check (review_state in ('lead', 'in_review'));
