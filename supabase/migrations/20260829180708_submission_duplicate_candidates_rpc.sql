-- Lets a signed-in submitter's own /submit request check for likely
-- duplicates against pending (lead/in_review) rows they otherwise can't see
-- under RLS (only ambassadors/moderators can read those directly). Exposes
-- only title/organiser/official_url/review_state -- no gate fields, no
-- ai_research, no submitter identity -- to any authenticated caller, same
-- narrow-SECURITY-DEFINER pattern as is_moderator()/can_edit_opportunities().
create or replace function public.find_submission_duplicate_candidates()
returns table (
  id uuid,
  title text,
  organiser text,
  official_url text,
  review_state review_state
)
language sql
stable
security definer
set search_path to 'public'
as $$
  select id, title, organiser, official_url, review_state
  from opportunity
  where review_state in ('lead', 'in_review', 'published');
$$;

revoke all on function public.find_submission_duplicate_candidates() from public;
revoke all on function public.find_submission_duplicate_candidates() from anon;
grant execute on function public.find_submission_duplicate_candidates() to authenticated;
