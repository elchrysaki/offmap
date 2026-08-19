'use client';

import { useEffect, useState } from 'react';

import { createClient } from '@/lib/supabase/client';
import { isLocallySaved, toggleLocalSaved } from '@/lib/local-saved';

// Quiet Save control (CLAUDE.md §7 card rule: "quiet Save top-right").
// Signed-in students write straight to saved_opportunity (RLS lets a user
// insert/delete only their own rows — see
// supabase/migrations/20260817140000_saved_opportunities.sql). Guests use
// the same device-local storage the browse cards already assume
// (src/lib/local-saved.ts), merged into the account on sign-in by
// AuthSaveSync. A button's label matches the confirmation it produces
// (CLAUDE.md §8): "Save opportunity" produces "Saved".
export function SaveButton({ opportunityId }: { opportunityId: string }) {
  const [saved, setSaved] = useState(false);
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const supabase = createClient();

    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (cancelled) return;

      if (!user) {
        setSignedIn(false);
        setSaved(isLocallySaved(opportunityId));
        return;
      }

      setSignedIn(true);
      const { data } = await supabase
        .from('saved_opportunity')
        .select('id')
        .eq('profile_id', user.id)
        .eq('opportunity_id', opportunityId)
        .maybeSingle();
      if (!cancelled) setSaved(Boolean(data));
    });

    return () => {
      cancelled = true;
    };
  }, [opportunityId]);

  async function toggle() {
    if (pending) return;
    setPending(true);

    try {
      if (!signedIn) {
        const next = toggleLocalSaved(opportunityId);
        setSaved(next.includes(opportunityId));
        return;
      }

      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      if (saved) {
        const { error } = await supabase
          .from('saved_opportunity')
          .delete()
          .eq('profile_id', user.id)
          .eq('opportunity_id', opportunityId);
        if (!error) setSaved(false);
      } else {
        const { error } = await supabase
          .from('saved_opportunity')
          .insert({ profile_id: user.id, opportunity_id: opportunityId });
        if (!error || error.code === '23505') setSaved(true);
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={signedIn === null || pending}
      aria-pressed={saved}
      className="font-[family-name:var(--font-archivo)] inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-bold uppercase focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--cobalt)] disabled:opacity-60"
      style={{
        borderRadius: 'var(--radius-pill)',
        border: 'var(--border-width) solid var(--ink)',
        background: saved ? 'var(--lime)' : 'var(--card)',
        color: 'var(--ink)',
      }}
    >
      <span aria-hidden="true">{saved ? '★' : '☆'}</span>
      {saved ? 'Saved' : 'Save opportunity'}
    </button>
  );
}
