import 'server-only';

import { cache } from 'react';

import { createClient } from '@/lib/supabase/server';

// Read-only session check for nav/profile-placeholder UI. Not part of the
// auth flow itself — just "is someone signed in" for display purposes, so
// getSession() (decodes the cookie locally, no network call) is the right
// call here, not getUser() (which re-validates against the Auth server
// every time). proxy.ts's middleware already runs getUser() and refreshes
// the session on every request, so by the time a Server Component renders
// the cookie is already trustworthy for a non-authorization display
// decision. Every page that renders SiteHeader (i.e. every public page)
// was paying for this same "am I signed in" check twice — once in
// middleware, once here — this removes the second network round trip.
// React's cache() dedupes repeated calls within one render pass — SiteHeader
// (from (public)/layout.tsx) and the page itself both call this on most
// routes, and this way that's one getSession() call per request, not two.
export const getCurrentUserEmail = cache(async () => {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return session?.user.email ?? null;
});
