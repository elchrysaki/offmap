import 'server-only';

import type { Tables, TablesUpdate } from '@/lib/supabase/types';
import type { OpportunityResearch } from '@/lib/ai/verify-opportunity';

export type QueueBucket = 'unverified' | 'needs_intervention' | 'ai_checked' | 'ready_to_batch';

// Below this, treat the research as effectively unusable rather than "a bit
// uncertain" — either the model couldn't confirm it had the right page at
// all, or its own stated confidence is too low to trust for anything.
const LOW_CONFIDENCE_THRESHOLD = 0.3;

function parseResearch(
  opportunity: Pick<Tables<'opportunity'>, 'ai_research'>,
): OpportunityResearch | null {
  if (!opportunity.ai_research || typeof opportunity.ai_research !== 'object') return null;
  return opportunity.ai_research as unknown as OpportunityResearch;
}

// The AI never researches reach/prep_time — CLAUDE.md §6 and the researcher
// prompt itself (src/lib/ai/verify-opportunity.ts) are explicit that those
// are editorial judgment calls for a human, not facts a page states. So
// "ready_to_batch" never means "needs zero human input" — it means every
// fact the AI *is* allowed to determine came back confirmed, so the only
// things left for a human are the two judgment calls plus a glance at the
// summary (see src/app/admin/batch/page.tsx). That's still "a human read it
// and applied it," just efficiently, not a background auto-publish.
export function classifyOpportunity(
  opportunity: Pick<Tables<'opportunity'>, 'ai_research'>,
): QueueBucket {
  const research = parseResearch(opportunity);
  if (!research) return 'unverified';

  if (
    research.identity_confirmed !== true ||
    (research.overall_confidence ?? 0) < LOW_CONFIDENCE_THRESHOLD
  ) {
    return 'needs_intervention';
  }

  const factsConfirmed =
    research.application_url?.confidence === 'confirmed' &&
    research.funding?.confidence === 'confirmed' &&
    research.eligibility?.confidence === 'confirmed' &&
    research.deadline?.confidence === 'confirmed';

  return factsConfirmed ? 'ready_to_batch' : 'ai_checked';
}

export function getResearch(opportunity: Pick<Tables<'opportunity'>, 'ai_research'>) {
  return parseResearch(opportunity);
}

// Best-effort guesses only — always shown as an editable, pre-filled choice
// in the batch-apply view (src/app/admin/batch/page.tsx), never applied
// silently. A human confirms or corrects every row before anything
// publishes; that's what keeps this consistent with §6.
export function guessFundingEnum(text: string | null): TablesUpdate<'opportunity'>['funding'] {
  if (!text) return null;
  const lower = text.toLowerCase();
  if (lower.includes('unfunded') || lower.includes('no funding') || lower.includes('self-funded')) {
    return 'unfunded';
  }
  if (lower.includes('fully') || lower.includes('all expenses') || lower.includes('all costs')) {
    return 'fully_funded';
  }
  if (lower.includes('partial') || lower.includes('some costs') || lower.includes('grant')) {
    return 'partially_funded';
  }
  return null;
}

export function guessFormatEnum(text: string | null): TablesUpdate<'opportunity'>['format'] {
  if (!text) return null;
  const lower = text.toLowerCase();
  if (lower.includes('hybrid')) return 'hybrid';
  if (lower.includes('online') || lower.includes('virtual') || lower.includes('remote')) {
    return 'online';
  }
  if (
    lower.includes('in person') ||
    lower.includes('in-person') ||
    lower.includes('on-site') ||
    lower.includes('onsite')
  ) {
    return 'in_person';
  }
  return null;
}

function isoOrNull(value: string | null | undefined): string | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

export type BatchRowOverrides = {
  funding: NonNullable<TablesUpdate<'opportunity'>['funding']>;
  reach: NonNullable<TablesUpdate<'opportunity'>['reach']>;
  prep_time: NonNullable<TablesUpdate<'opportunity'>['prep_time']>;
  format: TablesUpdate<'opportunity'>['format'];
};

// Builds the real gate-field patch for one batch-apply row. Only ever
// called after a moderator has reviewed the batch-apply screen and
// submitted the form — this is the one place AI research values cross into
// real fields for this flow, same boundary rule as the single-row edit page
// (src/lib/admin/ai-research.ts never writes gate fields; a human does, by
// hand there and by reviewed-batch-submit here).
export function buildBatchApplyPatch(
  opportunity: Tables<'opportunity'>,
  overrides: BatchRowOverrides,
): TablesUpdate<'opportunity'> {
  const research = parseResearch(opportunity);
  if (!research) throw new Error('No AI research to apply for this opportunity.');

  return {
    apply_url: research.application_url?.value ?? null,
    funding: overrides.funding,
    funding_details: research.funding?.value ?? null,
    eligibility: research.eligibility?.value ?? null,
    reach: overrides.reach,
    prep_time: overrides.prep_time,
    format: overrides.format,
    deadline_raw: research.deadline?.value ?? null,
    deadline_at:
      research.deadline?.precision === 'exact' ? isoOrNull(research.deadline.value) : null,
    deadline_precision: research.deadline?.precision ?? 'unknown',
    opens_at:
      research.opens_at?.confidence === 'confirmed' ? isoOrNull(research.opens_at.value) : null,
    host_city: research.host_city?.confidence === 'confirmed' ? research.host_city.value : null,
    country: research.country?.confidence === 'confirmed' ? research.country.value : null,
  };
}
