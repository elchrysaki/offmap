import 'server-only';

import { createClient } from '@/lib/supabase/server';

export async function getSavedOpportunityIds() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data } = await supabase
    .from('saved_opportunity')
    .select('opportunity_id')
    .eq('profile_id', user.id);

  return data?.map((row) => row.opportunity_id) ?? [];
}

export async function saveOpportunity(opportunityId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('Must be signed in to save an opportunity');

  const { error } = await supabase
    .from('saved_opportunity')
    .insert({ profile_id: user.id, opportunity_id: opportunityId });

  // Already saved is not an error — insert is idempotent from the caller's view.
  if (error && error.code !== '23505') throw error;
}

export async function unsaveOpportunity(opportunityId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('Must be signed in to unsave an opportunity');

  const { error } = await supabase
    .from('saved_opportunity')
    .delete()
    .eq('profile_id', user.id)
    .eq('opportunity_id', opportunityId);

  if (error) throw error;
}
