import { createClient as createSupabaseClient } from '@supabase/supabase-js';

import type { Database } from './types';

// A stateless anon client for reads that don't depend on the current
// visitor at all (taxonomy lookup tables) — no cookies, no session. Exists
// so those reads can sit behind unstable_cache: the cookie-based client in
// server.ts calls next/headers' cookies(), which Next.js explicitly warns
// against using inside a cached function (it varies per request, so it
// can't share a cache key across visitors).
export function createPublicClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
