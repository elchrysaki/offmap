import 'server-only';

import { createClient } from '@/lib/supabase/server';

export type SavedRow = {
  id: string;
  opportunity_id: string;
  status: 'goals' | 'apply' | 'applied' | 'archived';
  notify_opens: boolean;
  notify_start_writing: boolean;
  notify_closing: boolean;
  opportunity: {
    id: string;
    title: string | null;
    funding: string | null;
    eligibility: string | null;
    host_city: string | null;
    country: string | null;
    format: string | null;
    days_remaining: number | null;
    status: string | null;
  } | null;
};

// Every one of a student's saves, opportunity details attached where still
// visible. `opportunity` is deliberately null for a save whose listing has
// since expired or been unpublished — the "published and not expired" RLS
// policy on `opportunity` (CLAUDE.md §5/§6: an expired listing must never
// reach a client, even a student's own archived save) hides it same as
// anywhere else. SavedBoard renders those as "no longer available" rather
// than blank.
export async function getSavedOpportunitiesWithDetails(): Promise<SavedRow[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data: saves, error: savesError } = await supabase
    .from('saved_opportunity')
    .select('id, opportunity_id, status, notify_opens, notify_start_writing, notify_closing')
    .eq('profile_id', user.id);

  if (savesError) throw savesError;
  if (!saves || saves.length === 0) return [];

  const { data: opportunities, error: opportunitiesError } = await supabase
    .from('opportunity_public')
    .select('id, title, funding, eligibility, host_city, country, format, days_remaining, status')
    .in(
      'id',
      saves.map((save) => save.opportunity_id),
    );

  if (opportunitiesError) throw opportunitiesError;

  // id is typed nullable (view-inferred) but is the opportunity table's
  // primary key underneath — never actually null. Guard rather than assert.
  const byId = new Map(
    (opportunities ?? [])
      .filter((o): o is typeof o & { id: string } => o.id !== null)
      .map((o) => [o.id, o]),
  );

  return saves.map((save) => ({
    ...save,
    opportunity: byId.get(save.opportunity_id) ?? null,
  }));
}

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
