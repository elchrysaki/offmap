'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import type { EffortRung } from '@/lib/queries/opportunities';

// The effort ladder as primary navigation (CLAUDE.md §7, signature element
// 3), above type and field filters.
const RUNGS: { id: EffortRung; label: string; needsCountry?: boolean }[] = [
  { id: 'coffee_break', label: 'Coffee break', needsCountry: true },
  { id: 'weekend_trip', label: 'Weekend trip' },
  { id: 'aim_higher', label: 'Aim higher' },
  { id: 'off_path', label: 'Off path', needsCountry: true },
];

const COUNTRY_STORAGE_KEY = 'offmap:country';

export function EffortLadder() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeRung = searchParams.get('rung');
  const [country, setCountry] = useState('');

  useEffect(() => {
    const stored = window.localStorage.getItem(COUNTRY_STORAGE_KEY);
    if (stored) setCountry(stored);
  }, []);

  function applyRung(rung: EffortRung) {
    const params = new URLSearchParams(searchParams.toString());
    if (activeRung === rung) {
      params.delete('rung');
    } else {
      params.set('rung', rung);
      if (country) params.set('country', country);
    }
    router.push(`/browse?${params.toString()}`);
  }

  function handleCountryChange(value: string) {
    setCountry(value);
    window.localStorage.setItem(COUNTRY_STORAGE_KEY, value);
    if (activeRung) {
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set('country', value);
      else params.delete('country');
      router.push(`/browse?${params.toString()}`);
    }
  }

  const needsCountry = RUNGS.find((r) => r.id === activeRung)?.needsCountry;

  return (
    <nav aria-label="Effort level" className="flex flex-wrap items-center gap-2">
      {RUNGS.map((rung) => {
        const active = activeRung === rung.id;
        return (
          <button
            key={rung.id}
            type="button"
            onClick={() => applyRung(rung.id)}
            aria-pressed={active}
            className="font-[family-name:var(--font-archivo)] px-4 py-2 text-[13px] font-bold uppercase focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--cobalt)]"
            style={{
              borderRadius: 'var(--radius-pill)',
              border: 'var(--border-width) solid var(--ink)',
              background: active ? 'var(--ink)' : 'var(--card)',
              color: active ? 'var(--card)' : 'var(--ink)',
              boxShadow: active ? 'none' : 'var(--shadow-offset)',
              letterSpacing: '0.06em',
            }}
          >
            {rung.label}
          </button>
        );
      })}

      {needsCountry && (
        <label
          className="ml-1 flex items-center gap-2 text-[13px]"
          style={{ color: 'var(--muted)' }}
        >
          Your country
          <input
            type="text"
            value={country}
            onChange={(e) => handleCountryChange(e.target.value)}
            placeholder="e.g. Greece"
            className="px-2 py-1 text-[13px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--cobalt)]"
            style={{
              borderRadius: '8px',
              border: 'var(--border-width) solid var(--ink)',
              background: 'var(--card)',
              color: 'var(--ink)',
            }}
          />
        </label>
      )}
    </nav>
  );
}
