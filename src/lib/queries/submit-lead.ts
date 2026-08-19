import 'server-only';

import { createClient } from '@/lib/supabase/server';

export type LeadSubmissionInput = {
  officialUrl: string;
  typeId: string;
  organiser: string;
  note: string;
  submitterName: string;
  submitterEmail: string;
};

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
export async function submitLead(input: LeadSubmissionInput) {
  const supabase = await createClient();

  const additionalInformation =
    [
      input.note.trim() ? `Why it's selective (from the submitter): ${input.note.trim()}` : null,
      input.submitterEmail.trim()
        ? `Submitter contact (not shown publicly): ${input.submitterEmail.trim()}`
        : null,
    ]
      .filter(Boolean)
      .join('\n\n') || null;

  const { error } = await supabase.from('opportunity').insert({
    official_url: input.officialUrl,
    type_id: input.typeId,
    organiser: input.organiser.trim() || null,
    submitted_by: input.submitterName.trim() || null,
    additional_information: additionalInformation,
  });

  if (error) throw error;
}
