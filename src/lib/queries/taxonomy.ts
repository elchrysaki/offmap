import 'server-only';

import { unstable_cache } from 'next/cache';

import { createPublicClient } from '@/lib/supabase/public-client';

type TaxonomyTable =
  'type' | 'field' | 'academic_level' | 'geo_scope' | 'audience_group' | 'funding_feature';

// Taxonomy is data, not schema (CLAUDE.md §5) — but it's also
// effectively static: a new row is a rare ambassador/moderator action, not
// something a browsing student ever changes. Every /browse render (and
// every filter-pill click, which is a full navigation) was re-querying all
// 6 of these tables fresh — cached for an hour via a plain anon client
// (public-client.ts, not the per-request cookie-based one — unstable_cache
// can't share a key across requests that vary by cookies) so browsing
// students stop paying for it.
const getLookupCached = unstable_cache(
  async (table: TaxonomyTable) => {
    const supabase = createPublicClient();
    const { data, error } = await supabase.from(table).select('id, label_en').order('sort_order');
    if (error) throw error;
    return data;
  },
  ['taxonomy-lookup'],
  { revalidate: 3600, tags: ['taxonomy'] },
);

const getLookup = (table: TaxonomyTable) => getLookupCached(table);

export const getTypes = () => getLookup('type');
export const getFields = () => getLookup('field');
export const getAcademicLevels = () => getLookup('academic_level');
export const getGeoScopes = () => getLookup('geo_scope');
export const getAudienceGroups = () => getLookup('audience_group');
export const getFundingFeatures = () => getLookup('funding_feature');

// Onboarding goals — same lookup shape as the taxonomy tables above but a
// separate table (supabase/migrations/20260819172931_profile_personalization.sql),
// since it describes a student's own intent rather than an opportunity.
// Only hit during onboarding, not on every browse load, so left uncached.
export async function getGoals() {
  const supabase = createPublicClient();
  const { data, error } = await supabase.from('goal').select('id, label_en').order('sort_order');

  if (error) throw error;
  return data;
}
