'use client';

import { useEffect } from 'react';

import { createClient } from '@/lib/supabase/client';
import { getLocalSavedIds, clearLocalSaved } from '@/lib/local-saved';
import { mergeLocalSaves } from '@/lib/queries/merge-local-saves';

// Folds guest-local saves into the account exactly once per sign-in, then
// clears local storage so the server table becomes the source of truth
// (ADR 0005). Mounted once in the root layout — renders nothing.
export function AuthSaveSync() {
  useEffect(() => {
    const supabase = createClient();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event !== 'SIGNED_IN') return;

      const localIds = getLocalSavedIds();
      if (localIds.length === 0) return;

      mergeLocalSaves(localIds)
        .then(clearLocalSaved)
        .catch(() => {
          // Leave local saves in place if the merge fails — nothing is lost,
          // it'll just retry on the next sign-in.
        });
    });

    return () => subscription.unsubscribe();
  }, []);

  return null;
}
