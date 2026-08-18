import 'server-only';

import { createClient } from '@/lib/supabase/server';
import type { Tables, TablesUpdate } from '@/lib/supabase/types';

export type AdminOpportunity = Tables<'opportunity'>;

const MULTISELECT_JUNCTIONS = {
  field: { table: 'opportunity_field', column: 'field_id' },
  academic_level: { table: 'opportunity_academic_level', column: 'academic_level_id' },
  geo_scope: { table: 'opportunity_geo_scope', column: 'geo_scope_id' },
  audience_group: { table: 'opportunity_audience_group', column: 'audience_group_id' },
  funding_feature: { table: 'opportunity_funding_feature', column: 'funding_feature_id' },
} as const;

export type MultiselectKey = keyof typeof MULTISELECT_JUNCTIONS;

// Relies on the "moderators/ambassadors read all opportunities" RLS policies —
// returns nothing for a caller without either role, since RLS just filters rows.
export async function getPendingOpportunities() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('opportunity')
    .select('*')
    .in('review_state', ['lead', 'in_review'])
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data;
}

export async function getOpportunityById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from('opportunity').select('*').eq('id', id).single();

  if (error) throw error;
  return data;
}

// Returns the selected ids for every multi-select taxonomy on one opportunity,
// keyed the same way the edit form's checkbox groups are named.
export async function getOpportunitySelections(id: string) {
  const supabase = await createClient();

  const results = await Promise.all(
    (Object.keys(MULTISELECT_JUNCTIONS) as MultiselectKey[]).map(async (key) => {
      const { table, column } = MULTISELECT_JUNCTIONS[key];
      const { data, error } = await supabase.from(table).select(column).eq('opportunity_id', id);
      if (error) throw error;
      return [key, (data ?? []).map((row) => row[column as keyof typeof row] as string)] as const;
    }),
  );

  return Object.fromEntries(results) as Record<MultiselectKey, string[]>;
}

export async function updateOpportunity(id: string, patch: TablesUpdate<'opportunity'>) {
  const supabase = await createClient();
  const { error } = await supabase.from('opportunity').update(patch).eq('id', id);

  // publish_gate and other CHECK constraints surface here as Postgres errors —
  // let the caller decide how to show that to the admin.
  if (error) throw error;
}

// Replaces the full set of selections for one taxonomy on one opportunity —
// delete-then-insert is simplest and safe here since these junction tables
// carry no data of their own beyond the two ids.
export async function setOpportunitySelections(
  id: string,
  key: MultiselectKey,
  selectedIds: string[],
) {
  const supabase = await createClient();
  const { table, column } = MULTISELECT_JUNCTIONS[key];

  const { error: deleteError } = await supabase.from(table).delete().eq('opportunity_id', id);
  if (deleteError) throw deleteError;

  if (selectedIds.length === 0) return;

  // The insert shape genuinely varies by table (different FK column name per
  // taxonomy), which the generated per-table types can't express generically.
  const rows = selectedIds.map((value) => ({ opportunity_id: id, [column]: value }));
  const { error: insertError } = await supabase.from(table).insert(rows as never[]);
  if (insertError) throw insertError;
}

export async function rejectOpportunity(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('opportunity')
    .update({ review_state: 'rejected' })
    .eq('id', id);

  if (error) throw error;
}
