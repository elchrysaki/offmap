'use client';

import { useEffect, useState } from 'react';

import { createClient } from '@/lib/supabase/client';
import { isLocallySaved, toggleLocalSaved } from '@/lib/local-saved';

type NotifyFlags = {
  notify_opens: boolean;
  notify_start_writing: boolean;
  notify_closing: boolean;
};

const NOTIFY_OPTIONS: { key: keyof NotifyFlags; label: string }[] = [
  { key: 'notify_opens', label: 'When applications open' },
  { key: 'notify_start_writing', label: 'A good time to start writing' },
  { key: 'notify_closing', label: '24 hours before it closes' },
];

// Quiet Save control (CLAUDE.md §7 card rule: "quiet Save top-right").
// Signed-in students write straight to saved_opportunity (RLS lets a user
// insert/update/delete only their own rows — see
// supabase/migrations/20260817140000_saved_opportunities.sql and
// 20260819172931_profile_personalization.sql for the update policy and the
// three notify_* flags). Guests use the same device-local storage the
// browse cards already assume (src/lib/local-saved.ts), merged into the
// account on sign-in by AuthSaveSync — guests never see notify toggles
// since there's no account to email. A button's label matches the
// confirmation it produces (CLAUDE.md §8): "Save opportunity" produces
// "Saved".
export function SaveButton({ opportunityId }: { opportunityId: string }) {
  const [saved, setSaved] = useState(false);
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const [pending, setPending] = useState(false);
  const [notifyFlags, setNotifyFlags] = useState<NotifyFlags | null>(null);
  const [notifyOpen, setNotifyOpen] = useState(false);

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
        .select('notify_opens, notify_start_writing, notify_closing')
        .eq('profile_id', user.id)
        .eq('opportunity_id', opportunityId)
        .maybeSingle();
      if (cancelled) return;
      setSaved(Boolean(data));
      if (data) setNotifyFlags(data);
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
        if (!error) {
          setSaved(false);
          setNotifyFlags(null);
          setNotifyOpen(false);
        }
      } else {
        const { error } = await supabase
          .from('saved_opportunity')
          .insert({ profile_id: user.id, opportunity_id: opportunityId });
        if (!error || error.code === '23505') {
          setSaved(true);
          setNotifyFlags({
            notify_opens: false,
            notify_start_writing: false,
            notify_closing: false,
          });
        }
      }
    } finally {
      setPending(false);
    }
  }

  async function setNotify(key: keyof NotifyFlags, value: boolean) {
    if (!notifyFlags) return;
    const previous = notifyFlags;
    setNotifyFlags({ ...notifyFlags, [key]: value });

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    // Supabase's generated Update type rejects a computed { [key]: value }
    // literal (it can't verify a dynamic key against the known column
    // set) — building the full flag set and only changing one key keeps
    // the object shape concrete instead.
    const { error } = await supabase
      .from('saved_opportunity')
      .update({ ...notifyFlags, [key]: value })
      .eq('profile_id', user.id)
      .eq('opportunity_id', opportunityId);

    if (error) setNotifyFlags(previous);
  }

  return (
    <div className="inline-flex flex-col items-start gap-2">
      <div className="inline-flex items-center gap-2">
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

        {saved && signedIn && (
          <button
            type="button"
            onClick={() => setNotifyOpen((v) => !v)}
            aria-expanded={notifyOpen}
            aria-label={notifyOpen ? 'Hide notification options' : 'Notify me'}
            className="inline-flex h-8 w-8 items-center justify-center text-[15px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--cobalt)]"
            style={{
              borderRadius: 'var(--radius-pill)',
              border: 'var(--border-width) solid var(--ink)',
              background:
                notifyFlags &&
                (notifyFlags.notify_opens ||
                  notifyFlags.notify_start_writing ||
                  notifyFlags.notify_closing)
                  ? 'var(--marigold)'
                  : 'var(--card)',
              color: 'var(--ink)',
            }}
          >
            <span aria-hidden="true">🔔</span>
          </button>
        )}
      </div>

      {saved && signedIn && notifyOpen && notifyFlags && (
        <div
          className="flex flex-col gap-1.5 px-3 py-2.5 text-[13px]"
          style={{
            border: 'var(--border-width) solid var(--ink)',
            borderRadius: 'var(--radius-card)',
            background: 'var(--card)',
          }}
        >
          {NOTIFY_OPTIONS.map((option) => (
            <label key={option.key} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={notifyFlags[option.key]}
                onChange={(e) => setNotify(option.key, e.target.checked)}
              />
              {option.label}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
