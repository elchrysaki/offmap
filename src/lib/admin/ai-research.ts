import 'server-only';

import { researchOpportunity } from '@/lib/ai/verify-opportunity';
import { getOpportunityById, updateOpportunity } from '@/lib/queries/admin-opportunities';

// Shared by both the single-row "Verify with AI" action on the edit page
// (src/app/admin/opportunities/[id]/actions.ts) and the bulk trigger on the
// queue page (src/app/admin/actions.ts), so there's exactly one place that
// calls researchOpportunity() and writes the result — bulk and single-row
// verification get identical behavior, including the apply_url_candidate
// fill below. Never writes to a gate field (funding, apply_url, etc.) —
// only ai_research / ai_research_at / apply_url_candidate(_note), same
// boundary as the rest of §6.
export async function runAiResearchForOpportunity(id: string) {
  const opportunity = await getOpportunityById(id);

  let research;
  let errorMessage: string | null = null;
  try {
    research = await researchOpportunity({
      title: opportunity.title,
      organiser: opportunity.organiser,
      officialUrl: opportunity.official_url,
      applyUrl: opportunity.apply_url,
      current: {
        funding: opportunity.funding,
        eligibility: opportunity.eligibility,
        deadlineRaw: opportunity.deadline_raw,
        format: opportunity.format,
        hostCity: opportunity.host_city,
        country: opportunity.country,
      },
    });
  } catch (err) {
    errorMessage = err instanceof Error ? err.message : 'AI research failed.';
  }

  // apply_url_candidate/apply_url_candidate_note are not gate fields (the
  // publish_gate CHECK constraint never reads them) — same candidate columns
  // the weekly link-checker Edge Function writes to, so a moderator sees one
  // consistent "suggested apply link" slot regardless of which job found it.
  // The real apply_url field is still never touched here (§6).
  const applyUrlCandidate =
    research &&
    research.application_url.value &&
    research.application_url.confidence !== 'not-found'
      ? research.application_url.value
      : null;
  const applyUrlCandidateNote = research
    ? `${research.application_url.confidence}: ${research.application_url.note}`
    : null;

  await updateOpportunity(id, {
    ai_research: errorMessage ? { error: errorMessage } : research,
    ai_research_at: new Date().toISOString(),
    apply_url_candidate: applyUrlCandidate,
    apply_url_candidate_note: applyUrlCandidateNote,
    // Running research is itself a sign someone has started working this
    // lead — move it out of the untouched "new" bucket in the queue. Only
    // ever advances lead -> in_review, never touches an already-further-along row.
    review_state: opportunity.review_state === 'lead' ? 'in_review' : opportunity.review_state,
  });

  return errorMessage;
}
