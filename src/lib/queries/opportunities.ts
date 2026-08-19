import 'server-only';

import { createClient } from '@/lib/supabase/server';

export type EffortRung = 'coffee_break' | 'weekend_trip' | 'aim_higher' | 'off_path';

export type BrowseFilters = {
  rung?: EffortRung;
  country?: string; // the student's own country, needed for coffee_break / off_path
  typeId?: string;
};

// opportunity_public already filters to published + not-expired rows and
// computes days_remaining/status in Postgres (CLAUDE.md: derived values are
// never stored). Effort-ladder logic (CLAUDE.md §7) is applied here.
export async function listBrowseOpportunities(filters: BrowseFilters = {}) {
  const supabase = await createClient();
  let query = supabase
    .from('opportunity_public')
    .select(
      'id, title, organiser, funding, eligibility, host_city, country, format, reach, prep_time, deadline_precision, days_remaining, status, type_id',
    )
    .order('days_remaining', { ascending: true, nullsFirst: false });

  if (filters.typeId) query = query.eq('type_id', filters.typeId);

  switch (filters.rung) {
    case 'coffee_break':
      query = query.eq('reach', 'local').eq('prep_time', 'under_an_hour');
      if (filters.country) query = query.eq('country', filters.country);
      break;
    case 'weekend_trip':
      query = query.eq('reach', 'national').eq('prep_time', 'a_weekend');
      break;
    case 'aim_higher':
      query = query.eq('reach', 'international');
      break;
    case 'off_path':
      query = query.eq('reach', 'local');
      if (filters.country) query = query.neq('country', filters.country);
      break;
    default:
      // No rung selected — country is a plain filter, not an
      // effort-ladder qualifier (coffee_break/off_path use it differently
      // above, so this only applies when neither is active).
      if (filters.country) query = query.eq('country', filters.country);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

// Distinct countries across published, open opportunities — for the
// country filter bar. Small dataset for now; a dedicated indexed query if
// the catalogue grows large enough for this to matter.
export async function listCountries() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('opportunity_public')
    .select('country')
    .not('country', 'is', null);

  if (error) throw error;
  const unique = Array.from(
    new Set(data.map((row) => row.country).filter((c): c is string => !!c)),
  );
  return unique.sort((a, b) => a.localeCompare(b));
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
