import 'server-only';

import { researchOpportunity } from '@/lib/ai/verify-opportunity';
import { getOpportunityById, updateOpportunity } from '@/lib/queries/admin-opportunities';

// Shared by both the single-row "Verify with AI" action on the edit page
// (src/app/admin/opportunities/[id]/actions.ts) and the bulk trigger on the
// queue page (src/app/admin/actions.ts), so there's exactly one place that
// calls researchOpportunity() and writes the result. Never writes to a gate
// field (funding, apply_url, etc.) — only ai_research / ai_research_at, same
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
    });
  } catch (err) {
    errorMessage = err instanceof Error ? err.message : 'AI research failed.';
  }

  await updateOpportunity(id, {
    ai_research: errorMessage ? { error: errorMessage } : research,
    ai_research_at: new Date().toISOString(),
    // Running research is itself a sign someone has started working this
    // lead — move it out of the untouched "new" bucket in the queue. Only
    // ever advances lead -> in_review, never touches an already-further-along row.
    review_state: opportunity.review_state === 'lead' ? 'in_review' : opportunity.review_state,
  });

  return errorMessage;
}
