'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

import { WORLD_COUNTRIES } from '@/lib/countries';

// Same key effort-ladder.tsx already reads/writes — one source of truth for
// "the student's country" across both the intro and the coffee-break/
// off-path rung inputs, rather than two caches drifting apart.
const COUNTRY_KEY = 'offmap:country';
// Separate sentinel from COUNTRY_KEY itself: an empty string is a valid,
// meaningful choice (Global), so "has the student chosen yet" can't be
// inferred from COUNTRY_KEY being empty/missing alone.
const CHOSEN_KEY = 'offmap:country-chosen';

type Phase = 'checking' | 'closed' | 'picker' | 'intro';

// Full-screen one-time country/Global picker (Elena's call, 20 Aug) — shown
// once per browser (cached via localStorage, not sessionStorage: a
// returning guest a week later should still skip straight to their country,
// same "recent cache" behaviour requested), reachable again anytime after
// via the small pill this component also renders. Pure CSS/SVG animation —
// no canvas/WebGL, no external data fetch (unlike the heavier
// components/shell/globe.tsx used on the landing page) — matches
// hero.tsx/how-it-works.tsx's progressive-enhancement convention:
// prefers-reduced-motion gets the static picker immediately, no plane.
export function CountryIntro({ initialCountry }: { initialCountry?: string }) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>('checking');
  const [showAnimation, setShowAnimation] = useState(true);
  const [current, setCurrent] = useState('');
  const [query, setQuery] = useState('');
  const [reducedMotion, setReducedMotion] = useState(false);

  const hasInitialized = useRef(false);

  useEffect(() => {
    setReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);

  useEffect(() => {
    // Only the very first mount should ever decide "show the intro" or
    // "redirect to the cached country" — every later run of this effect
    // just means the user navigated (clicked a filter pill, including
    // "All countries"), and an explicit in-session choice like that must
    // never get silently overridden back to the cached value.
    if (!hasInitialized.current) {
      hasInitialized.current = true;

      if (initialCountry !== undefined) {
        // A direct/bookmarked link with ?country= already present is
        // itself an explicit choice — persist it and skip straight to
        // closed.
        window.localStorage.setItem(COUNTRY_KEY, initialCountry);
        window.localStorage.setItem(CHOSEN_KEY, '1');
        setCurrent(initialCountry);
        setPhase('closed');
        return;
      }

      const chosen = window.localStorage.getItem(CHOSEN_KEY);
      const stored = window.localStorage.getItem(COUNTRY_KEY) ?? '';
      setCurrent(stored);

      if (chosen === '1') {
        setPhase('closed');
        // "Touching browse again" should land on the cached country, not
        // a reset "all countries" view — a bare /browse visit (nav click,
        // new tab) has no ?country= of its own, so the server-rendered
        // filter needs this nudged in, not just the overlay skipped.
        if (stored) {
          router.replace(`/browse?country=${encodeURIComponent(stored)}`);
        }
      } else {
        setPhase('intro');
      }
      return;
    }

    // Later navigations: just keep the pill's displayed country in sync
    // with whatever's actually in the URL now.
    setCurrent(initialCountry ?? '');
  }, [initialCountry, router]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return WORLD_COUNTRIES.slice(0, 8);
    return WORLD_COUNTRIES.filter((c) => c.toLowerCase().includes(q)).slice(0, 8);
  }, [query]);

  function choose(country: string) {
    window.localStorage.setItem(COUNTRY_KEY, country);
    window.localStorage.setItem(CHOSEN_KEY, '1');
    setCurrent(country);
    setPhase('closed');
    setQuery('');
    router.replace(country ? `/browse?country=${encodeURIComponent(country)}` : '/browse');
  }

  // Nothing renders until the localStorage check resolves — avoids a
  // flash of "Global" before the real stored country (if any) is read.
  if (phase === 'checking') return null;

  const overlayOpen = phase === 'intro' || phase === 'picker';

  return (
    <>
      {/* Always-available quick-switch pill (the "sliding list on top" to
          change country without replaying the animation). */}
      <div className="sticky top-0 z-30 flex justify-end px-6 pt-3" aria-hidden={overlayOpen}>
        <button
          type="button"
          onClick={() => {
            setShowAnimation(false);
            setPhase('picker');
          }}
          className="font-[family-name:var(--font-archivo)] pointer-events-auto px-3.5 py-2 text-[12px] font-bold uppercase transition-transform hover:-translate-y-0.5"
          style={{
            borderRadius: 'var(--radius-pill)',
            border: 'var(--border-width) solid var(--ink)',
            background: 'var(--card)',
            color: 'var(--ink)',
            boxShadow: 'var(--shadow-offset-sm)',
          }}
        >
          {current ? `📍 ${current}` : '🌐 Global'} — change
        </button>
      </div>

      {overlayOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Choose a country"
          className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden px-6"
          style={{ background: 'var(--ink)' }}
        >
          {showAnimation && phase === 'intro' && !reducedMotion && <FlightAnimation />}

          <div className="relative z-10 w-full max-w-md text-center">
            <p
              className="font-[family-name:var(--font-bungee)] text-[13px] uppercase"
              style={{ color: 'var(--marigold)' }}
            >
              OffMap
            </p>
            <h1
              className="font-[family-name:var(--font-fraunces)] mt-2 text-3xl leading-tight font-extrabold"
              style={{ color: 'var(--paper)' }}
            >
              Where are you looking?
            </h1>
            <p className="mt-2 text-[14px]" style={{ color: 'rgba(245,239,227,0.65)' }}>
              Pick your country to lead with what&apos;s local, or go global to see everything.
            </p>

            <div className="mt-6 flex flex-col gap-3">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for your country…"
                autoFocus
                className="px-4 py-3 text-[15px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--marigold)]"
                style={{
                  borderRadius: 'var(--radius-card)',
                  border: 'var(--border-width) solid var(--paper)',
                  background: 'rgba(245,239,227,0.06)',
                  color: 'var(--paper)',
                }}
              />

              {results.length > 0 && (
                <ul
                  className="flex flex-col overflow-hidden"
                  style={{
                    borderRadius: 'var(--radius-card)',
                    border: 'var(--border-width) solid var(--paper)',
                  }}
                >
                  {results.map((country, i) => (
                    <li key={country}>
                      <button
                        type="button"
                        onClick={() => choose(country)}
                        className="font-[family-name:var(--font-archivo)] w-full px-4 py-2.5 text-left text-[14px] font-semibold transition-colors hover:bg-[rgba(245,239,227,0.08)]"
                        style={{
                          color: 'var(--paper)',
                          borderTop: i > 0 ? '1px solid rgba(245,239,227,0.15)' : undefined,
                        }}
                      >
                        {country}
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              <button
                type="button"
                onClick={() => choose('')}
                className="font-[family-name:var(--font-archivo)] mt-1 px-4 py-3 text-[13px] font-extrabold tracking-[0.05em] uppercase transition-transform hover:-translate-y-0.5"
                style={{
                  borderRadius: 'var(--radius-pill)',
                  border: 'var(--border-width) solid var(--marigold)',
                  background: 'var(--marigold)',
                  color: 'var(--ink)',
                }}
              >
                🌐 Go global instead
              </button>

              {phase === 'picker' && (
                <button
                  type="button"
                  onClick={() => setPhase('closed')}
                  className="font-[family-name:var(--font-archivo)] text-[12px] font-bold underline"
                  style={{ color: 'rgba(245,239,227,0.6)' }}
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Dot-field background + a small plane tracing a curved path across it,
// looping. Pure CSS (offset-path + keyframes) — no canvas, no WebGL, no
// asset fetch. Purely atmospheric: it doesn't plot real geography or
// literal countries (that would need real geo data this repo doesn't have
// — see globe.tsx's much heavier external-GeoJSON approach), it's brand
// motion setting the mood before the real, accessible picker below it.
function FlightAnimation() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: 'radial-gradient(rgba(245,239,227,0.25) 1.5px, transparent 1.5px)',
          backgroundSize: '26px 26px',
        }}
      />
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 400 400"
        preserveAspectRatio="xMidYMid slice"
      >
        <path
          id="flight-path"
          d="M -20,320 C 80,180 140,340 220,220 C 280,140 340,200 420,80"
          fill="none"
          stroke="rgba(245,239,227,0.18)"
          strokeWidth="1.5"
          strokeDasharray="2 8"
        />
        {/* The plane lives inside the SVG and rides the same <path> via
            native SMIL animateMotion — kept in the SVG's own coordinate
            space rather than a separately-CSS-animated HTML element, so it
            can't drift out of sync with the visible dashed line once
            preserveAspectRatio scales the viewBox to fill the screen. */}
        <text fontSize="22" textAnchor="middle" fill="var(--marigold)">
          &#9992;
          <animateMotion dur="9s" repeatCount="indefinite" rotate="auto">
            <mpath href="#flight-path" />
          </animateMotion>
        </text>
      </svg>
    </div>
  );
}
