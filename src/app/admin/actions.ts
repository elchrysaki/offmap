'use server';

import { revalidatePath } from 'next/cache';

import { runAiResearchForOpportunity } from '@/lib/admin/ai-research';
import { mergeOpportunities, rejectOpportunity } from '@/lib/queries/admin-opportunities';

// Cap concurrent Gemini calls when a moderator selects a large batch — a
// bulk verify across the whole queue at once shouldn't fire 25+ requests in
// parallel. Each row's failure (bad URL, no search hit, API error) is caught
// per-id so one bad row can't stop the rest of the batch.
const BULK_CONCURRENCY = 3;

// Bulk "Verify with AI" — reads the same `ids` checkbox group the queue page
// renders (name="ids"), one value per selected row. Native form submit, no
// client JS required, so it stays keyboard-operable for free.
export async function bulkRunAiResearch(formData: FormData) {
  const ids = Array.from(new Set(formData.getAll('ids').map(String).filter(Boolean)));

  for (let i = 0; i < ids.length; i += BULK_CONCURRENCY) {
    const batch = ids.slice(i, i + BULK_CONCURRENCY);
    await Promise.all(
      batch.map((id) =>
        runAiResearchForOpportunity(id).catch((err) => {
          console.error(`Bulk AI research failed for opportunity ${id}:`, err);
        }),
      ),
    );
  }

  revalidatePath('/admin');
}

// Single-row "Verify with AI" trigger from the queue list itself, so a
// moderator doesn't have to open the edit page just to kick off research.
export async function runAiResearchFromQueue(id: string) {
  await runAiResearchForOpportunity(id);
  revalidatePath('/admin');
}

// Quick reject straight from the queue. Same rejectOpportunity() the edit
// page's Reject button calls; RLS still enforces that only a moderator's
// session can actually perform the update (ambassadors' "with check" only
// permits review_state in ('lead', 'in_review')), so this is a UI
// convenience, not a new privilege.
export async function quickRejectFromQueue(id: string) {
  await rejectOpportunity(id);
  revalidatePath('/admin');
}

// Merges a flagged possible-duplicate into the canonical row a moderator
// picked (see src/lib/admin/duplicates.ts for how the match was found and
// mergeOpportunities() for the fill-gaps-only merge rule). RLS enforces the
// actual privilege check — only a moderator's session can move a row to
// 'archived' — this is just the UI entry point.
export async function mergeIntoOpportunity(duplicateId: string, canonicalId: string) {
  await mergeOpportunities(duplicateId, canonicalId);
  revalidatePath('/admin');
}
