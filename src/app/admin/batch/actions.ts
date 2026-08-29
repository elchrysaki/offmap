'use server';

import { redirect } from 'next/navigation';

import { createClient } from '@/lib/supabase/server';
import { getOpportunityById, updateOpportunity } from '@/lib/queries/admin-opportunities';
import { buildBatchApplyPatch, type BatchRowOverrides } from '@/lib/admin/opportunity-buckets';
import type { Enums } from '@/lib/supabase/types';

function rowOverrides(formData: FormData, id: string): BatchRowOverrides {
  return {
    funding: formData.get(`funding-${id}`) as Enums<'funding'>,
    reach: formData.get(`reach-${id}`) as Enums<'reach'>,
    prep_time: formData.get(`prep_time-${id}`) as Enums<'prep_time'>,
    format: (formData.get(`format-${id}`) as Enums<'format'> | '') || null,
  };
}

// The one place AI research values cross into real gate fields for the
// batch flow — only reachable after a moderator has looked at the review
// screen (src/app/admin/batch/page.tsx) and explicitly submitted it. Each
// row is applied independently: one bad row (missing a judgment-call field,
// a stale AI research blob) doesn't block the rest of the batch.
export async function batchApplyAndPublish(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const ids = Array.from(new Set(formData.getAll('ids').map(String).filter(Boolean)));
  let published = 0;
  const failures: string[] = [];

  for (const id of ids) {
    try {
      const overrides = rowOverrides(formData, id);
      if (!overrides.funding || !overrides.reach || !overrides.prep_time) {
        throw new Error('Funding, reach, and prep time are all required.');
      }

      const opportunity = await getOpportunityById(id);
      const patch = buildBatchApplyPatch(opportunity, overrides);

      await updateOpportunity(id, {
        ...patch,
        review_state: 'published',
        last_verified_at: new Date().toISOString(),
        verified_by: user?.email ?? null,
      });
      published += 1;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not publish.';
      failures.push(`${id.slice(0, 8)}: ${message}`);
    }
  }

  const params = new URLSearchParams();
  params.set('published', String(published));
  if (failures.length > 0) params.set('failed', failures.join('; '));

  redirect(`/admin/batch?${params.toString()}`);
}
