import 'server-only';

import { createClient } from '@/lib/supabase/server';

async function getLookup(
  table: 'type' | 'field' | 'academic_level' | 'geo_scope' | 'audience_group' | 'funding_feature',
) {
  const supabase = await createClient();
  const { data, error } = await supabase.from(table).select('id, label_en').order('sort_order');

  if (error) throw error;
  return data;
}

export const getTypes = () => getLookup('type');
export const getFields = () => getLookup('field');
export const getAcademicLevels = () => getLookup('academic_level');
export const getGeoScopes = () => getLookup('geo_scope');
export const getAudienceGroups = () => getLookup('audience_group');
export const getFundingFeatures = () => getLookup('funding_feature');
