import 'server-only';

import { createClient } from '@/lib/supabase/server';

export type EffortRung = 'coffee_break' | 'weekend_trip' | 'aim_higher' | 'off_path';

export type DeadlineRange = 'week' | 'month' | 'longer';

const TAXONOMY_JUNCTIONS = {
  field: { table: 'opportunity_field', column: 'field_id' },
  academic_level: { table: 'opportunity_academic_level', column: 'academic_level_id' },
  geo_scope: { table: 'opportunity_geo_scope', column: 'geo_scope_id' },
  audience_group: { table: 'opportunity_audience_group', column: 'audience_group_id' },
  funding_feature: { table: 'opportunity_funding_feature', column: 'funding_feature_id' },
} as const;

export type TaxonomyKey = keyof typeof TAXONOMY_JUNCTIONS;

export type BrowseFilters = {
  rung?: EffortRung;
  country?: string; // the student's own country, needed for coffee_break / off_path
  typeId?: string;
  fieldId?: string;
  academicLevelId?: string;
  geoScopeId?: string;
  audienceGroupId?: string; // eligibility criteria — audience_group already covers this, no new taxonomy
  fundingFeatureId?: string;
  format?: string; // online / in_person / hybrid, labelled Remote/On-site/Hybrid in the UI
  deadline?: DeadlineRange;
};

// opportunity_public already filters to published + not-expired rows and
// computes days_remaining/status in Postgres (CLAUDE.md: derived values are
// never stored). Effort-ladder logic (CLAUDE.md §7) is applied here.
export async function listBrowseOpportunities(filters: BrowseFilters = {}) {
  const supabase = await createClient();

  // Multi-select taxonomies live in junction tables, not columns on
  // opportunity_public — resolve each active one to a set of opportunity
  // ids first, then intersect, rather than joining in the main query (RLS
  // on each junction table already scopes rows to published/unexpired
  // parents, so this stays safe for anon visitors — same approach as
  // getOpportunityTaxonomyIds below).
  const activeTaxonomyFilters: { key: TaxonomyKey; value: string }[] = (
    [
      ['field', filters.fieldId],
      ['academic_level', filters.academicLevelId],
      ['geo_scope', filters.geoScopeId],
      ['audience_group', filters.audienceGroupId],
      ['funding_feature', filters.fundingFeatureId],
    ] as const
  )
    .filter((entry): entry is [TaxonomyKey, string] => Boolean(entry[1]))
    .map(([key, value]) => ({ key, value }));

  // Fired in parallel, not one at a time — with 2+ active filters, a
  // sequential await-in-a-loop here was adding a full extra round trip per
  // filter to every browse load, which is exactly the kind of latency
  // students would feel as "filters are slow."
  let matchingIds: string[] | null = null;
  const taxonomyResults = await Promise.all(
    activeTaxonomyFilters.map(async ({ key, value }) => {
      const { table, column } = TAXONOMY_JUNCTIONS[key];
      // Table/column are picked dynamically from TAXONOMY_JUNCTIONS, so
      // Supabase's generated per-table overloads can't narrow this — same
      // trade-off as getOpportunityTaxonomyIds below.
      const { data, error } = await supabase
        .from(table)
        .select('opportunity_id')
        .eq(column as string, value);
      if (error) throw error;
      return new Set((data ?? []).map((row) => row.opportunity_id as string));
    }),
  );
  for (const ids of taxonomyResults) {
    matchingIds = matchingIds === null ? Array.from(ids) : matchingIds.filter((id) => ids.has(id));
  }
  if (matchingIds !== null && matchingIds.length === 0) return [];

  let query = supabase
    .from('opportunity_public')
    .select(
      'id, title, organiser, funding, eligibility, host_city, country, format, reach, prep_time, deadline_precision, days_remaining, status, opens_at, type_id',
    )
    .order('days_remaining', { ascending: true, nullsFirst: false });

  if (matchingIds !== null) query = query.in('id', matchingIds);
  if (filters.typeId) query = query.eq('type_id', filters.typeId);
  if (filters.format) {
    query = query.eq('format', filters.format as 'online' | 'in_person' | 'hybrid');
  }

  if (filters.deadline === 'week') query = query.lte('days_remaining', 7);
  else if (filters.deadline === 'month') query = query.lte('days_remaining', 30);
  else if (filters.deadline === 'longer') query = query.gt('days_remaining', 30);

  switch (filters.rung) {
    case 'coffee_break':
      query = query.eq('reach', 'local').eq('prep_time', 'under_an_hour');
      // ilike, not eq: country is free text entered by ambassadors with
      // inconsistent casing ("greece" vs "Greece") — the new world-country
      // picker (src/lib/countries.ts) always sends proper-cased names, so
      // an exact match would silently drop real rows. Case-insensitive
      // matching is strictly safer here regardless of source.
      if (filters.country) query = query.ilike('country', filters.country);
      break;
    case 'weekend_trip':
      query = query.eq('reach', 'national').eq('prep_time', 'a_weekend');
      break;
    case 'aim_higher':
      query = query.eq('reach', 'international');
      break;
    case 'off_path':
      query = query.eq('reach', 'local');
      if (filters.country) query = query.not('country', 'ilike', filters.country);
      break;
    default:
      // No rung selected — country is a plain filter, not an
      // effort-ladder qualifier (coffee_break/off_path use it differently
      // above, so this only applies when neither is active).
      if (filters.country) query = query.ilike('country', filters.country);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

// The post-onboarding "recommended for you" sweep — opportunities tagged
// with at least one of the student's chosen fields, soonest deadline
// first. Deliberately simple (no scoring/ranking beyond that) — CLAUDE.md
// §12 step 11 calls real match/ranking logic later work, this is just
// enough to make onboarding feel like it did something.
export async function listRecommendedOpportunities(fieldIds: string[], limit = 6) {
  if (fieldIds.length === 0) return [];

  const supabase = await createClient();
  const { data: matches, error: matchError } = await supabase
    .from('opportunity_field')
    .select('opportunity_id')
    .in('field_id', fieldIds);

  if (matchError) throw matchError;

  const opportunityIds = Array.from(new Set((matches ?? []).map((row) => row.opportunity_id)));
  if (opportunityIds.length === 0) return [];

  const { data, error } = await supabase
    .from('opportunity_public')
    .select(
      'id, title, organiser, funding, eligibility, host_city, country, format, reach, prep_time, deadline_precision, days_remaining, status, type_id',
    )
    .in('id', opportunityIds)
    .order('days_remaining', { ascending: true, nullsFirst: false })
    .limit(limit);

  if (error) throw error;
  return data;
}

export async function getOpportunityById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('opportunity_public')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

// Public read of the selected taxonomy ids for one opportunity, via the same
// junction tables the admin dashboard writes to. RLS on each junction table
// only returns rows whose parent opportunity is published and not expired,
// so this is safe to call for anon visitors (CLAUDE.md §5).
export async function getOpportunityTaxonomyIds(
  id: string,
): Promise<Record<TaxonomyKey, string[]>> {
  const supabase = await createClient();

  const results = await Promise.all(
    (Object.keys(TAXONOMY_JUNCTIONS) as TaxonomyKey[]).map(async (key) => {
      const { table, column } = TAXONOMY_JUNCTIONS[key];
      const { data, error } = await supabase.from(table).select(column).eq('opportunity_id', id);
      if (error) throw error;
      return [key, (data ?? []).map((row) => row[column as keyof typeof row] as string)] as const;
    }),
  );

  return Object.fromEntries(results) as Record<TaxonomyKey, string[]>;
}
