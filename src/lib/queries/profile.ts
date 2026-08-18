import 'server-only';

import { createClient } from '@/lib/supabase/server';

export async function getCurrentUserRole() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase.from('profiles').select('role').eq('id', user.id).single();

  return data?.role ?? null;
}
