'use server';

import { createClient } from '@/lib/supabase/server';

// Runs once, right after a student signs in, to fold their guest-local saves
// into the account (ADR 0005). Safe to call with an already-empty list.
export async function mergeLocalSaves(opportunityIds: string[]) {
  if (opportunityIds.length === 0) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const rows = opportunityIds.map((opportunity_id) => ({
    profile_id: user.id,
    opportunity_id,
  }));

  // Duplicates (already-saved rows) are expected and fine to ignore.
  await supabase.from('saved_opportunity').upsert(rows, {
    onConflict: 'profile_id,opportunity_id',
    ignoreDuplicates: true,
  });
}
