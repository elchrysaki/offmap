import 'server-only';

import { createClient } from '@/lib/supabase/server';
import { findDuplicateAmong, getLiveCandidates } from '@/lib/admin/duplicates';

export type LeadSubmissionResult = {
  attachedToExisting: boolean;
};

export type LeadSubmissionInput = {
  title: string;
  officialUrl: string;
  typeId: string;
  organiser: string;
  note: string;
  submitterName: string;
  submitterEmail: string;
};

export class SubmissionRateLimitError extends Error {
  constructor() {
    super('Submission rate limit exceeded');
    this.name = 'SubmissionRateLimitError';
  }
}

// Generous enough for a real ambassador submitting several finds in one
// sitting, tight enough to stop a scripted loop from a single account.
// Tracked in `submission_attempt` (supabase/migrations/
// 20260829094322_submission_rate_limiting.sql), deliberately separate from
// `opportunity` so this never touches the publish-gate / lead RLS surface.
const HOURLY_LIMIT = 5;
const DAILY_LIMIT = 15;

// Public intake (CLAUDE.md §7, §12 step 10): writes a minimal `lead` row
// into the same review queue ambassadors already work from in /admin. Runs
// on the anon/authenticated Supabase client — there's no admin session
// here, so this only works because of the "public can submit leads" RLS
// policy (supabase/migrations/20260819120000_public_lead_submission.sql),
// which pins review_state to 'lead' and source_type to 'submission' and
// refuses the insert if any gate/AI field is set. Nothing this function
// does can reach a published listing on its own — an ambassador or
// moderator has to pick the row up in /admin first (CLAUDE.md §6).
//
// `submitted_by` is shown publicly on the detail page once the listing
// publishes ("Submitted by Nikos."), so it only ever holds a name someone
// chose to be credited under — never an email. A submitter's email (asked
// for as "in case a moderator has a question", never required) goes into
// `additional_information` instead, which is admin-only and never rendered
// on a public page.
export async function submitLead(input: LeadSubmissionInput): Promise<LeadSubmissionResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not signed in.');

  const hourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const [{ count: hourlyCount }, { count: dailyCount }] = await Promise.all([
    supabase
      .from('submission_attempt')
      .select('id', { count: 'exact', head: true })
      .eq('profile_id', user.id)
      .gte('created_at', hourAgo),
    supabase
      .from('submission_attempt')
      .select('id', { count: 'exact', head: true })
      .eq('profile_id', user.id)
      .gte('created_at', dayAgo),
  ]);

  if ((hourlyCount ?? 0) >= HOURLY_LIMIT || (dailyCount ?? 0) >= DAILY_LIMIT) {
    throw new SubmissionRateLimitError();
  }

  await supabase
    .from('submission_attempt')
    .insert({ profile_id: user.id, official_url: input.officialUrl });

  const additionalInformation =
    [
      input.note.trim() ? `Why it's selective (from the submitter): ${input.note.trim()}` : null,
      input.submitterEmail.trim()
        ? `Submitter contact (not shown publicly): ${input.submitterEmail.trim()}`
        : null,
    ]
      .filter(Boolean)
      .join('\n\n') || null;

  // Exact-URL duplicate check (CLAUDE.md §5's duplicate-handling note):
  // the same official link already exists as a live row, so this
  // resubmission's info gets folded into that row instead of creating a
  // second one for the same event. Only an exact normalized-URL match is
  // handled here — anything merely similar (possibly a different edition of
  // an annual programme) still becomes its own lead and surfaces as a
  // "possible duplicate" for a moderator to judge in /admin, never merged
  // automatically.
  const candidates = await getLiveCandidates();
  const [exactMatch] = findDuplicateAmong(
    {
      title: input.title || null,
      organiser: input.organiser || null,
      official_url: input.officialUrl,
    },
    candidates,
  ).filter((match) => match.confidence === 'certain');

  if (exactMatch) {
    const note = [
      `Resubmitted by ${input.submitterName.trim() || 'a student'} (already in our system):`,
      additionalInformation,
    ]
      .filter(Boolean)
      .join('\n');

    const { error } = await supabase.rpc('append_submission_note', {
      p_opportunity_id: exactMatch.candidate.id,
      p_note: note,
    });
    if (error) throw error;

    return { attachedToExisting: true };
  }

  const { error } = await supabase.from('opportunity').insert({
    title: input.title.trim() || null,
    official_url: input.officialUrl,
    type_id: input.typeId,
    organiser: input.organiser.trim() || null,
    submitted_by: input.submitterName.trim() || null,
    additional_information: additionalInformation,
  });

  if (error) throw error;
  return { attachedToExisting: false };
}
