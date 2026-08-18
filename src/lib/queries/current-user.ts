import 'server-only';

import { createClient } from '@/lib/supabase/server';

// Read-only session check for nav/profile-placeholder UI. Not part of the
// auth flow itself — just "is someone signed in" for display purposes.
export async function getCurrentUserEmail() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user?.email ?? null;
}
