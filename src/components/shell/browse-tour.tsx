'use client';

import { useEffect, useState } from 'react';

const TOUR_KEY = 'offmap:browse-tour-seen';

const STEPS = [
  {
    title: 'Start with the effort ladder',
    body: 'Coffee break, weekend trip, aim higher, off path — sorted by how much time and travel something takes, not just its deadline.',
  },
  {
    title: 'Narrow it down',
    body: 'Filter by subject, academic level, who can apply, funding, format or how soon it closes — mix as many as you need.',
  },
  {
    title: 'Save what you like',
    body: 'Tap ☆ Save on anything, even as a guest. Sign in later and everything you saved comes with you.',
  },
];

// One-time, session-cached (localStorage, same pattern as country-intro.tsx)
// walkthrough on first real /browse visit — a short step sequence rather
// than DOM-anchored tooltips, which would need per-breakpoint positioning
// logic against a page whose filter bars already reflow a lot (CLAUDE.md
// §7: no gamified language, so this stays plain — no "quest"/"step 1 of 3"
// badge language beyond a quiet progress dot row).
export function BrowseTour() {
  const [step, setStep] = useState<number | null>(null);

  useEffect(() => {
    if (window.localStorage.getItem(TOUR_KEY) === '1') return;
    setStep(0);
  }, []);

  function dismiss() {
    window.localStorage.setItem(TOUR_KEY, '1');
    setStep(null);
  }

  if (step === null) return null;

  const current = STEPS[step]!;
  const isLast = step === STEPS.length - 1;

  return (
    <div
      role="dialog"
      aria-label="Quick tour"
      className="fixed right-6 bottom-6 z-40 flex w-full max-w-sm flex-col gap-3 p-5"
      style={{
        borderRadius: 'var(--radius-card)',
        border: 'var(--border-width) solid var(--ink)',
        boxShadow: 'var(--shadow-offset)',
        background: 'var(--card)',
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <h2 className="font-[family-name:var(--font-fraunces)] text-[17px] font-bold">
          {current.title}
        </h2>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Skip tour"
          className="shrink-0 text-[13px] font-bold underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--cobalt)]"
          style={{ color: 'var(--muted)' }}
        >
          Skip
        </button>
      </div>
      <p className="text-[14px]" style={{ color: 'var(--muted)' }}>
        {current.body}
      </p>
      <div className="flex items-center justify-between">
        <div className="flex gap-1.5" aria-hidden="true">
          {STEPS.map((s, i) => (
            <span
              key={s.title}
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: i === step ? 'var(--ink)' : 'var(--rule)' }}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={() => (isLast ? dismiss() : setStep(step + 1))}
          className="font-[family-name:var(--font-archivo)] px-4 py-2 text-[12px] font-extrabold tracking-[0.05em] uppercase focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--cobalt)]"
          style={{
            borderRadius: 'var(--radius-pill)',
            border: 'var(--border-width) solid var(--ink)',
            background: 'var(--ink)',
            color: 'var(--card)',
          }}
        >
          {isLast ? 'Got it' : 'Next'}
        </button>
      </div>
    </div>
  );
}
