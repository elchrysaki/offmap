'use client';

import { useEffect, useRef, useState } from 'react';

type Step = { num: string; title: string; body: string; detail: string; icon: React.ReactNode };

const iconProps = { width: 26, height: 26, viewBox: '0 0 22 22', fill: 'none', 'aria-hidden': true } as const;

const STEPS: Step[] = [
  {
    num: '01',
    title: 'Browse',
    body: 'Filter by effort, not just category — coffee break, weekend trip, or aim higher.',
    detail: 'The effort ladder is the primary filter, above type and field — reach and prep time first.',
    icon: (
      <svg {...iconProps}>
        <circle cx="9.5" cy="9.5" r="6" stroke="currentColor" strokeWidth="1.8" />
        <path d="M14 14l5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    num: '02',
    title: 'Save',
    body: 'No account needed. Save on your device, or sign in to sync across devices.',
    detail: 'Guest saves live on your device. Sign in once and they merge into your account automatically.',
    icon: (
      <svg {...iconProps}>
        <path d="M5 3.5h12a1 1 0 0 1 1 1V19l-7-4-7 4V4.5a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    num: '03',
    title: 'Get alerted',
    body: 'We tell you before the deadline, not after. One email, no noise.',
    detail: 'One email when it matters — never a weekly digest, never a marketing send.',
    icon: (
      <svg {...iconProps}>
        <path
          d="M11 3c-3 0-4.8 2.2-4.8 5v3.2L4.5 14.5h13L15.8 11.2V8c0-2.8-1.8-5-4.8-5Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path d="M9 17.5a2 2 0 0 0 4 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    num: '04',
    title: 'Apply',
    body: "Straight to the organiser's own application — we never sit in the middle.",
    detail: 'No application fee, no OffMap account required on their end. You apply directly to them.',
    icon: (
      <svg {...iconProps}>
        <path d="M3.5 11h13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M11.5 5l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

const AUTO_ADVANCE_MS = 4500;

// A single-accent interactive stepper — one big countdown-style numeral (the
// same device the product uses for deadlines) standing in as the "you are
// here" marker, a fill-as-you-go track, and click/arrow/keyboard-driven
// steps. Auto-advances gently; pauses on hover/focus AND has an explicit
// pause toggle, since hover-only pausing is invisible on touch devices.
export function HowItWorks() {
  const [active, setActive] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [autoPaused, setAutoPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const timerRef = useRef<number | null>(null);

  // Read after mount only — matches SSR output on first paint, then updates.
  useEffect(() => {
    setReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);

  const paused = hovered || autoPaused || reducedMotion;

  useEffect(() => {
    if (typeof window === 'undefined' || paused) return;

    timerRef.current = window.setTimeout(() => {
      setActive((i) => (i + 1) % STEPS.length);
    }, AUTO_ADVANCE_MS);

    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [active, paused]);

  const step = STEPS[active] ?? STEPS[0]!;

  const goTo = (i: number) => setActive((i + STEPS.length) % STEPS.length);

  return (
    <div
      className="relative mt-8 overflow-hidden"
      style={{
        background: 'var(--card)',
        backgroundImage: 'radial-gradient(var(--rule) 1.4px, transparent 1.4px)',
        backgroundSize: '16px 16px',
        border: 'var(--border-width) solid var(--ink)',
        borderRadius: 'var(--radius-panel)',
        boxShadow: 'var(--shadow-offset)',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight') goTo(active + 1);
        if (e.key === 'ArrowLeft') goTo(active - 1);
      }}
    >
      {/* fill-as-you-go track */}
      <div aria-hidden="true" style={{ height: 6, background: 'var(--rule)' }}>
        <div
          style={{
            height: '100%',
            width: `${((active + 1) / STEPS.length) * 100}%`,
            background: 'var(--marigold)',
            borderRight: '2px solid var(--ink)',
            transition: 'width 0.5s cubic-bezier(0.65,0,0.35,1)',
          }}
        />
      </div>

      <div className="grid gap-8 p-6 md:grid-cols-[auto_1fr] md:items-center md:p-10">
        {/* the big numeral — same device as the deadline countdown */}
        <div className="flex items-center justify-center">
          <span
            key={step.num}
            className="font-[family-name:var(--font-fraunces)] relative block leading-none font-black"
            style={{
              fontSize: 'clamp(4.5rem, 10vw, 7.5rem)',
              color: 'var(--ink)',
              animation: 'howstep-pop 0.45s cubic-bezier(0.34,1.56,0.64,1)',
            }}
          >
            {step.num}
          </span>
        </div>

        {/* content, cross-fades on step change */}
        <div key={step.num} style={{ animation: 'howstep-in 0.4s cubic-bezier(0.16,1,0.3,1)' }}>
          <div className="flex items-center gap-3">
            <span style={{ color: 'var(--cobalt)' }}>{step.icon}</span>
            <span
              className="font-[family-name:var(--font-bungee)] inline-block px-2.5 py-1 text-[10px] tracking-[0.05em] uppercase"
              style={{
                background: 'var(--marigold)',
                color: 'var(--ink)',
                borderRadius: 'var(--radius-stamp)',
                border: '1.4px solid var(--ink)',
                transform: 'rotate(-2.5deg)',
              }}
            >
              Step {active + 1} of {STEPS.length}
            </span>
          </div>
          <h3 className="font-[family-name:var(--font-fraunces)] relative mt-3 inline-block text-[1.9rem] leading-tight font-bold md:text-[2.3rem]">
            <span
              className="absolute right-0 bottom-1 left-0 -z-10"
              style={{ height: '0.42em', background: 'var(--marigold)', opacity: 0.55 }}
              aria-hidden="true"
            />
            {step.title}
          </h3>
          <p className="mt-2.5 max-w-[46ch] text-[17px] leading-relaxed font-medium" style={{ color: 'var(--ink)' }}>
            {step.body}
          </p>
          <p className="mt-3 max-w-[50ch] text-[14.5px] leading-relaxed" style={{ color: 'var(--muted)' }}>
            {step.detail}
          </p>
        </div>
      </div>

      {/* step selector / progress dots */}
      <div
        className="flex flex-wrap items-center justify-between gap-3 px-6 pb-6 md:px-10 md:pb-8"
        role="tablist"
        aria-label="How it works, steps"
      >
        <div className="flex gap-2.5">
          {STEPS.map((s, i) => (
            <button
              key={s.num}
              type="button"
              role="tab"
              title={s.title}
              aria-selected={i === active}
              aria-label={`Step ${i + 1}: ${s.title}`}
              onClick={() => goTo(i)}
              className="flex h-9 w-9 items-center justify-center rounded-full text-[12px] font-bold transition-transform hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--cobalt)]"
              style={{
                fontFamily: 'var(--font-archivo)',
                background: i === active ? 'var(--ink)' : 'var(--paper)',
                color: i === active ? 'var(--paper)' : 'var(--ink)',
                border: '1.6px solid var(--ink)',
              }}
            >
              {i + 1}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-pressed={autoPaused}
            aria-label={autoPaused ? 'Resume auto-advance' : 'Pause auto-advance'}
            title={autoPaused ? 'Resume auto-advance' : 'Pause auto-advance'}
            onClick={() => setAutoPaused((p) => !p)}
            className="flex h-9 w-9 items-center justify-center rounded-full text-[13px] transition-transform hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--cobalt)]"
            style={{ border: '1.6px solid var(--ink)', background: 'var(--paper)' }}
          >
            {autoPaused || reducedMotion ? '▶' : '❚❚'}
          </button>
          <button
            type="button"
            aria-label="Previous step"
            onClick={() => goTo(active - 1)}
            className="flex h-9 w-9 items-center justify-center rounded-full transition-transform hover:-translate-x-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--cobalt)]"
            style={{ border: '1.6px solid var(--ink)', background: 'var(--paper)' }}
          >
            &larr;
          </button>
          <button
            type="button"
            aria-label="Next step"
            onClick={() => goTo(active + 1)}
            className="flex h-9 w-9 items-center justify-center rounded-full transition-transform hover:translate-x-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--cobalt)]"
            style={{ border: '1.6px solid var(--ink)', background: 'var(--ink)', color: 'var(--paper)' }}
          >
            &rarr;
          </button>
        </div>
      </div>

      <style>{`
        @keyframes howstep-in {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes howstep-pop {
          0% { opacity: 0; transform: scale(0.7) rotate(-4deg); }
          60% { opacity: 1; transform: scale(1.08) rotate(1deg); }
          100% { opacity: 1; transform: scale(1) rotate(0deg); }
        }
        @media (prefers-reduced-motion: reduce) {
          @keyframes howstep-in { from { opacity: 1; } to { opacity: 1; } }
          @keyframes howstep-pop { from { opacity: 1; } to { opacity: 1; } }
        }
      `}</style>
    </div>
  );
}
