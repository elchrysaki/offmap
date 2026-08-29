-- Lets a signed-in submitter's resubmission of an already-known link add
-- their note to the *existing* row instead of creating a duplicate --
-- something their own RLS otherwise wouldn't allow (students have no
-- UPDATE policy on opportunity; only ambassadors/moderators do). Narrowly
-- scoped: appends to additional_information only, on live rows only, with a
-- hard length cap -- same SECURITY DEFINER pattern as the duplicate-lookup
-- function above.
create or replace function public.append_submission_note(p_opportunity_id uuid, p_note text)
returns void
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_state review_state;
  v_current text;
begin
  select review_state, additional_information into v_state, v_current
  from opportunity where id = p_opportunity_id;

  if v_state is null or v_state not in ('lead', 'in_review', 'published') then
    raise exception 'Opportunity not found or not open for notes.';
  end if;

  if length(p_note) > 2000 then
    raise exception 'Note too long.';
  end if;

  update opportunity
  set additional_information = coalesce(v_current || E'\n\n', '') || p_note
  where id = p_opportunity_id;
end;
$$;

revoke all on function public.append_submission_note(uuid, text) from public;
revoke all on function public.append_submission_note(uuid, text) from anon;
grant execute on function public.append_submission_note(uuid, text) to authenticated;
