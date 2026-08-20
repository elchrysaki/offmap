'use client';

import { useEffect, useRef, useState } from 'react';

const TOUR_KEY = 'offmap:browse-tour-seen';

type Step = {
  selector: string;
  title: string;
  body: string;
  // Steps with a real target require the student to actually click it to
  // advance (Elena's call, 20 Aug: "it actually interacts with your
  // screen and shows you what to click", not a corner card with a Next
  // button). The final step has no single correct target, so it finishes
  // via its own "Got it" button instead — still a real click, just on the
  // tour's own UI rather than the page underneath.
  requireClick: boolean;
};

const STEPS: Step[] = [
  {
    selector: '[data-tour="filter-trigger"]',
    title: 'Open the filters',
    body: 'Subject, level, funding, format, deadline — tap Filters to narrow things down.',
    requireClick: true,
  },
  {
    selector: '[data-tour="save-button"]',
    title: 'Save what you like',
    body: 'Tap the star to save an opportunity, even as a guest. Sign in later and it comes with you.',
    requireClick: true,
  },
  {
    selector: '[data-tour="results"]',
    title: 'Start browsing',
    body: 'This is everything that matches right now — scroll to see it all.',
    requireClick: false,
  },
];

const MAX_FIND_ATTEMPTS = 24;

// Mandatory, DOM-anchored first-visit walkthrough on /browse (Elena's call,
// 20 Aug) — dims the real page and cuts a spotlight hole around a real
// element (the filter trigger, then the first card's Save button), and
// only advances once the student actually clicks it. No skip button by
// design: the whole point is that it's mandatory. Falls back to just
// advancing past a step if its target genuinely isn't on screen (e.g. no
// results yet), so the tour can never get stuck.
export function BrowseTour() {
  const [step, setStep] = useState<number | null>(null);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const findAttempts = useRef(0);

  useEffect(() => {
    if (window.localStorage.getItem(TOUR_KEY) === '1') return;
    setStep(0);
  }, []);

  useEffect(() => {
    if (step === null) return;

    findAttempts.current = 0;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    // setTimeout, not requestAnimationFrame: rAF gets throttled or fully
    // paused on a backgrounded/inactive tab in most browsers, which would
    // silently stall this fallback (and the tour with it) instead of
    // reliably skipping a step whose target never shows up.
    function tryFind() {
      if (cancelled || step === null) return;
      const selector = STEPS[step]!.selector;
      const el = document.querySelector<HTMLElement>(selector);
      const r = el?.getBoundingClientRect();

      if (el && r && r.width > 0 && r.height > 0) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setRect(r);
        return;
      }

      findAttempts.current += 1;
      if (findAttempts.current > MAX_FIND_ATTEMPTS) {
        // Target never showed up (e.g. no results, so no Save button to
        // point at) — skip this step rather than block the student forever.
        advance();
        return;
      }
      timer = setTimeout(tryFind, 50);
    }

    tryFind();

    function onScrollOrResize() {
      const el = document.querySelector<HTMLElement>(STEPS[step!]!.selector);
      if (el) setRect(el.getBoundingClientRect());
    }
    window.addEventListener('scroll', onScrollOrResize, true);
    window.addEventListener('resize', onScrollOrResize);

    function onDocClick(e: MouseEvent) {
      if (!STEPS[step!]!.requireClick) return;
      const el = document.querySelector<HTMLElement>(STEPS[step!]!.selector);
      if (el && e.target instanceof Node && el.contains(e.target)) {
        advance();
      }
    }
    document.addEventListener('click', onDocClick);

    return () => {
      cancelled = true;
      clearTimeout(timer);
      window.removeEventListener('scroll', onScrollOrResize, true);
      window.removeEventListener('resize', onScrollOrResize);
      document.removeEventListener('click', onDocClick);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  function advance() {
    setStep((s) => {
      if (s === null) return s;
      const next = s + 1;
      if (next >= STEPS.length) {
        window.localStorage.setItem(TOUR_KEY, '1');
        setRect(null);
        return null;
      }
      setRect(null);
      return next;
    });
  }

  if (step === null || !rect) return null;

  const current = STEPS[step]!;
  const pad = 8;
  const hole = {
    top: Math.max(rect.top - pad, 0),
    left: Math.max(rect.left - pad, 0),
    right: Math.min(rect.right + pad, window.innerWidth),
    bottom: Math.min(rect.bottom + pad, window.innerHeight),
  };

  // Below-target by default; flips above if there isn't room, so the
  // callout never gets clipped off the bottom of the viewport.
  const calloutBelow = hole.bottom + 160 < window.innerHeight;

  return (
    <div aria-hidden={false} role="dialog" aria-modal="true" aria-label="Quick tour">
      {/* Four dark bands surround the hole and block clicks outside it —
          the hole itself has no overlay element over it at all, so the
          real page element underneath receives the click directly. */}
      <div
        className="fixed inset-x-0 top-0 z-40"
        style={{ height: hole.top, background: 'rgba(20,18,16,0.6)' }}
      />
      <div
        className="fixed inset-x-0 bottom-0 z-40"
        style={{ top: hole.bottom, background: 'rgba(20,18,16,0.6)' }}
      />
      <div
        className="fixed z-40"
        style={{
          top: hole.top,
          height: hole.bottom - hole.top,
          left: 0,
          width: hole.left,
          background: 'rgba(20,18,16,0.6)',
        }}
      />
      <div
        className="fixed z-40"
        style={{
          top: hole.top,
          height: hole.bottom - hole.top,
          left: hole.right,
          right: 0,
          background: 'rgba(20,18,16,0.6)',
        }}
      />

      {/* Decorative highlight ring, exactly over the hole — pointer-events
          none so it never intercepts the click meant for the real element. */}
      <div
        className="pointer-events-none fixed z-40"
        style={{
          top: hole.top,
          left: hole.left,
          width: hole.right - hole.left,
          height: hole.bottom - hole.top,
          borderRadius: 'var(--radius-card)',
          border: '3px solid var(--marigold)',
          boxShadow: '0 0 0 3px var(--ink)',
        }}
      />

      <div
        className="fixed z-40 flex w-full max-w-sm flex-col gap-3 p-5"
        style={{
          left: Math.min(Math.max(hole.left, 16), window.innerWidth - 16 - 384),
          top: calloutBelow ? hole.bottom + 16 : undefined,
          bottom: calloutBelow ? undefined : window.innerHeight - hole.top + 16,
          borderRadius: 'var(--radius-card)',
          border: 'var(--border-width) solid var(--ink)',
          boxShadow: 'var(--shadow-offset)',
          background: 'var(--card)',
        }}
      >
        <h2 className="font-[family-name:var(--font-fraunces)] text-[17px] font-bold">
          {current.title}
        </h2>
        <p className="text-[14px]" style={{ color: 'var(--muted)' }}>
          {current.body}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex gap-1.5" aria-hidden="true">
            {STEPS.map((s, i) => (
              <span
                key={s.selector}
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: i === step ? 'var(--ink)' : 'var(--rule)' }}
              />
            ))}
          </div>
          {current.requireClick ? (
            <span
              className="font-[family-name:var(--font-archivo)] text-[11px] font-bold tracking-[0.05em] uppercase"
              style={{ color: 'var(--muted)' }}
            >
              Tap the highlighted spot →
            </span>
          ) : (
            <button
              type="button"
              onClick={advance}
              className="font-[family-name:var(--font-archivo)] px-4 py-2 text-[12px] font-extrabold tracking-[0.05em] uppercase focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--cobalt)]"
              style={{
                borderRadius: 'var(--radius-pill)',
                border: 'var(--border-width) solid var(--ink)',
                background: 'var(--ink)',
                color: 'var(--card)',
              }}
            >
              Got it, start browsing
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
