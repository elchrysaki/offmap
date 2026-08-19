'use client';

import { useState } from 'react';
import Link from 'next/link';

import { createClient } from '@/lib/supabase/client';
import { rowMeta } from '@/lib/format';
import { SAVED_STATUS_OPTIONS, savedStatusLabel } from '@/lib/profile-labels';
import { CountdownNumeral } from '@/components/core/countdown-numeral';
import type { SavedRow } from '@/lib/queries/saved-opportunities';

type NotifyKey = 'notify_opens' | 'notify_start_writing' | 'notify_closing';

const NOTIFY_OPTIONS: { key: NotifyKey; label: string }[] = [
  { key: 'notify_opens', label: 'Applications open' },
  { key: 'notify_start_writing', label: 'Start writing' },
  { key: 'notify_closing', label: '24h before close' },
];

type Save = SavedRow;

// The Goals / Apply / Applied / Archived board (Elena's call, 20 Aug —
// supabase/migrations/20260819172931_profile_personalization.sql). Takes
// the server-rendered initial data as a prop and manages status/notify/
// remove itself via the browser client — same RLS-scoped-to-auth.uid()
// trust boundary as SaveButton, no server action needed.
export function SavedBoard({ initialSaves }: { initialSaves: Save[] }) {
  const supabase = createClient();
  const [saves, setSaves] = useState(initialSaves);
  const [openNotifyId, setOpenNotifyId] = useState<string | null>(null);

  async function setStatus(save: Save, status: Save['status']) {
    setSaves((prev) => prev.map((s) => (s.id === save.id ? { ...s, status } : s)));

    const { error } = await supabase.from('saved_opportunity').update({ status }).eq('id', save.id);

    if (error) {
      setSaves((prev) => prev.map((s) => (s.id === save.id ? { ...s, status: save.status } : s)));
    }
  }

  async function setNotify(save: Save, key: NotifyKey, value: boolean) {
    setSaves((prev) => prev.map((s) => (s.id === save.id ? { ...s, [key]: value } : s)));

    const flags = {
      notify_opens: save.notify_opens,
      notify_start_writing: save.notify_start_writing,
      notify_closing: save.notify_closing,
    };
    const { error } = await supabase
      .from('saved_opportunity')
      .update({ ...flags, [key]: value })
      .eq('id', save.id);

    if (error) {
      setSaves((prev) => prev.map((s) => (s.id === save.id ? { ...s, [key]: save[key] } : s)));
    }
  }

  async function remove(save: Save) {
    setSaves((prev) => prev.filter((s) => s.id !== save.id));
    await supabase.from('saved_opportunity').delete().eq('id', save.id);
  }

  if (saves.length === 0) {
    return (
      <p className="mt-6 text-[14px]" style={{ color: 'var(--muted)' }}>
        Nothing saved yet.{' '}
        <Link href="/browse" className="font-bold underline" style={{ color: 'var(--cobalt)' }}>
          Start browsing
        </Link>
        .
      </p>
    );
  }

  return (
    <div className="mt-6 flex flex-col gap-8">
      {SAVED_STATUS_OPTIONS.map((column) => {
        const columnSaves = saves.filter((save) => save.status === column.value);
        if (columnSaves.length === 0) return null;

        return (
          <section key={column.value}>
            <p
              className="font-[family-name:var(--font-archivo)] text-[11px] font-extrabold tracking-[0.13em] uppercase"
              style={{ color: 'var(--muted)' }}
            >
              {column.label} ({columnSaves.length})
            </p>

            <ul className="mt-3 flex flex-col gap-3">
              {columnSaves.map((save) => (
                <li
                  key={save.id}
                  className="px-4 py-3.5"
                  style={{ border: '1.5px solid var(--rule)', borderRadius: 'var(--radius-card)' }}
                >
                  {save.opportunity ? (
                    <div className="flex items-start gap-3">
                      <div className="w-11 shrink-0 pt-0.5 text-right">
                        <CountdownNumeral
                          daysRemaining={save.opportunity.days_remaining}
                          status={save.opportunity.status}
                          opensAt={null}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <Link
                          href={`/opportunities/${save.opportunity_id}`}
                          className="font-[family-name:var(--font-fraunces)] block truncate text-[15px] font-bold hover:underline"
                        >
                          {save.opportunity.title || 'Untitled opportunity'}
                        </Link>
                        <p
                          className="mt-0.5 truncate text-[12px]"
                          style={{ color: 'var(--muted)' }}
                        >
                          {rowMeta(save.opportunity)}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-[13px] italic" style={{ color: 'var(--muted)' }}>
                      This listing is no longer available.
                    </p>
                  )}

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <select
                      value={save.status}
                      onChange={(e) => setStatus(save, e.target.value as Save['status'])}
                      className="px-2.5 py-1.5 text-[12px] font-bold"
                      style={{
                        borderRadius: 'var(--radius-stamp)',
                        border: 'var(--border-width) solid var(--ink)',
                        background: 'var(--card)',
                        color: 'var(--ink)',
                      }}
                      aria-label={`Move ${save.opportunity?.title ?? 'this save'} to a different list`}
                    >
                      {SAVED_STATUS_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>

                    {save.opportunity && (
                      <button
                        type="button"
                        onClick={() => setOpenNotifyId(openNotifyId === save.id ? null : save.id)}
                        aria-expanded={openNotifyId === save.id}
                        aria-label="Notify me"
                        className="inline-flex h-8 w-8 items-center justify-center text-[14px]"
                        style={{
                          borderRadius: 'var(--radius-pill)',
                          border: 'var(--border-width) solid var(--ink)',
                          background:
                            save.notify_opens || save.notify_start_writing || save.notify_closing
                              ? 'var(--marigold)'
                              : 'var(--card)',
                        }}
                      >
                        <span aria-hidden="true">🔔</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => remove(save)}
                      className="font-[family-name:var(--font-archivo)] px-2.5 py-1.5 text-[12px] font-bold underline"
                      style={{ color: 'var(--muted)' }}
                    >
                      Remove
                    </button>
                  </div>

                  {openNotifyId === save.id && (
                    <div
                      className="mt-2.5 flex flex-col gap-1.5 px-3 py-2.5 text-[12px]"
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
                            checked={save[option.key]}
                            onChange={(e) => setNotify(save, option.key, e.target.checked)}
                          />
                          {option.label}
                        </label>
                      ))}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
