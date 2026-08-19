'use client';

import { useEffect, useRef } from 'react';

type MockCard = { tag: string; title: string; meta: string };

// Matches the approved design concept exactly. Mock listings — flagged in
// the on-page hint copy — not real published opportunities. Swap for real
// grouped data once there's enough listing volume to fill three rows
// (CLAUDE.md §12 step 8).
const ROWS: { color: string; direction: 1 | -1; items: MockCard[] }[] = [
  {
    color: 'var(--cobalt)',
    direction: 1,
    items: [
      { tag: 'Conference', title: 'TEDx Athens Youth', meta: 'Open call · 16–19 · Athens' },
      { tag: 'Conference', title: 'Web Summit Lisbon — Student Pass', meta: 'Discounted · 18+ · Lisbon' },
      { tag: 'Conference', title: 'Athens Science Festival', meta: 'Free entry · 15–19 · Athens' },
      { tag: 'Conference', title: 'Youth Diplomacy Forum', meta: 'Travel funded · 16–20 · Brussels' },
      { tag: 'Conference', title: 'Climate Futures Summit', meta: 'Fully funded · 17–21 · Berlin' },
      { tag: 'Conference', title: 'Model UN — The Hague', meta: 'Self-funded · 16–19 · The Hague' },
      { tag: 'Conference', title: 'Youth Assembly at the UN', meta: 'Free · 16–19 · New York' },
      { tag: 'Conference', title: 'Global Student Forum', meta: 'Fully funded · 17–22 · Singapore' },
      { tag: 'Conference', title: 'European Youth Parliament', meta: 'Travel funded · 16–20 · Strasbourg' },
      { tag: 'Conference', title: 'Athens AI Summit', meta: 'Free entry · 15–19 · Athens' },
    ],
  },
  {
    color: 'var(--teal)',
    direction: -1,
    items: [
      { tag: 'Hackathon', title: 'Junction Hack Athens', meta: 'Weekend · 17–24 · Athens' },
      { tag: 'Hackathon', title: 'NASA Space Apps Piraeus', meta: 'Weekend · 15–24 · Piraeus' },
      { tag: 'Hackathon', title: 'HackTheBank Fintech', meta: 'Prize pool · 18–25 · Remote' },
      { tag: 'Hackathon', title: 'AI4Good Hackathon', meta: 'Fully funded · 16–22 · Thessaloniki' },
      { tag: 'Hackathon', title: 'Girls Who Code Jam', meta: 'Free · 14–18 · Remote' },
      { tag: 'Hackathon', title: 'Robotics Build-Off', meta: 'Weekend · 15–19 · Patras' },
      { tag: 'Hackathon', title: 'Global Game Jam Athens', meta: 'Weekend · 15–24 · Athens' },
      { tag: 'Hackathon', title: 'FinTech Builders Sprint', meta: 'Prize pool · 18–25 · Remote' },
      { tag: 'Hackathon', title: 'Green Tech Hack Thessaloniki', meta: 'Fully funded · 16–22 · Thessaloniki' },
      { tag: 'Hackathon', title: 'Open Source Weekend', meta: 'Free · 15–20 · Remote' },
    ],
  },
  {
    color: 'var(--violet)',
    direction: 1,
    items: [
      { tag: 'Course', title: 'MIT PRIMES-USA', meta: 'Fully funded · 16–18 · Remote' },
      { tag: 'Course', title: 'CERN Summer School', meta: 'Stipend · 18–24 · Geneva' },
      { tag: 'Course', title: 'Piraeus Robotics Bootcamp', meta: 'Funded · 16–19 · Piraeus' },
      { tag: 'Course', title: 'Oxford Summer Politics', meta: 'Fee-based, bursaries · 17–19 · Oxford' },
      { tag: 'Course', title: 'Deep Learning Intensive', meta: 'Free · 18+ · Remote' },
      { tag: 'Course', title: 'Marine Biology Fieldwork', meta: 'Funded · 17–20 · Crete' },
      { tag: 'Course', title: 'Harvard Pre-College Program', meta: 'Fee-based, bursaries · 16–18 · Cambridge' },
      { tag: 'Course', title: 'ESA Space Camp', meta: 'Fully funded · 16–19 · Noordwijk' },
      { tag: 'Course', title: 'Bioinformatics Summer Lab', meta: 'Stipend · 17–21 · Heidelberg' },
      { tag: 'Course', title: 'Data Science Intensive', meta: 'Free · 18+ · Remote' },
    ],
  },
];

// Every row is rendered three laps back-to-back on desktop (see the effect
// below) so the belt can wrap seamlessly — with a lap this wide there is
// always a full extra lap on either side of whatever's on screen, so
// resetting the offset by one lap width never shows a seam.
const LAPS = 3;
const LOOP_COUNT = 2.5; // full laps travelled while scrolling through the reel phase

// Phase boundaries, as fractions of the section's total pinned scroll range.
// Reel → flip (the strip rolls over, showing its "wrong side") → throw (a
// card peels off and gets flung) → slide (it skids along the bottom edge) →
// fade (it lifts away, unveiling How It Works underneath, unchanged).
const REEL_END = 0.6;
const FLIP_END = 0.72;
const THROW_END = 0.85;
const SLIDE_END = 0.95;

const THROWN_ITEM = ROWS[0]!.items[0]!;
const THROWN_COLOR = ROWS[0]!.color;

function clamp01(v: number) {
  return Math.max(0, Math.min(1, v));
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function wrapToRange(value: number, lap: number) {
  if (lap <= 0) return 0;
  let v = value % lap;
  if (v > 0) v -= lap;
  return v;
}

function Card({ item, color, variant = 'front' }: { item: MockCard; color: string; variant?: 'front' | 'back' }) {
  const back = variant === 'back';
  return (
    <div
      className="flex w-[220px] flex-none flex-col gap-2.5 p-4"
      style={{
        background: back ? 'var(--ink)' : 'var(--card)',
        border: `var(--border-width) solid ${back ? 'var(--paper)' : 'var(--ink)'}`,
        borderRadius: 'var(--radius-card)',
      }}
    >
      <span
        className="font-[family-name:var(--font-archivo)] w-fit px-2 py-0.5 text-[10px] font-bold tracking-[0.06em] uppercase"
        style={{ background: color, color: 'var(--ink)', borderRadius: 'var(--radius-stamp)', opacity: back ? 0.55 : 1 }}
      >
        {item.tag}
      </span>
      <h3
        className="font-[family-name:var(--font-fraunces)] text-[15px] leading-snug font-bold"
        style={back ? { color: 'var(--paper)' } : undefined}
      >
        {item.title}
      </h3>
      <p className="text-[12px]" style={{ color: back ? 'rgba(245,239,227,0.55)' : 'var(--muted)' }}>
        {item.meta}
      </p>
    </div>
  );
}

function FilmSprockets() {
  return (
    <div
      aria-hidden
      className="h-3 w-full shrink-0"
      style={{
        backgroundImage:
          'repeating-linear-gradient(to right, var(--paper) 0, var(--paper) 10px, transparent 10px, transparent 26px)',
        opacity: 0.3,
      }}
    />
  );
}

export function OpportunitiesReel() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const frontRowRefs = useRef<Array<HTMLDivElement | null>>([]);
  const backRowRefs = useRef<Array<HTMLDivElement | null>>([]);
  const thrownRef = useRef<HTMLDivElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);
  const lapWidthRef = useRef<number[]>(ROWS.map(() => 0));

  useEffect(() => {
    try {
      if (typeof window === 'undefined') return;
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      // Must match Tailwind's `md:` breakpoint (768px) — the pinned height and
      // sticky positioning only exist above that width.
      const isDesktop = window.matchMedia('(min-width: 768px)').matches;
      if (reduceMotion || !isDesktop) return;

      const wrap = wrapRef.current;
      if (!wrap) return;

      // Duplicate each row's cards into extra laps so the belt has somewhere
      // to go when it wraps — done once, imperatively, so mobile and no-JS
      // visitors only ever see the single real lap React rendered.
      const tripleRow = (row: HTMLDivElement | null) => {
        if (!row) return 0;
        const originalCards = Array.from(row.children);
        const lap = row.scrollWidth;
        for (let lap_i = 1; lap_i < LAPS; lap_i++) {
          originalCards.forEach((card) => {
            const clone = card.cloneNode(true) as HTMLElement;
            row.appendChild(clone);
          });
        }
        return lap;
      };

      frontRowRefs.current.forEach((row, i) => {
        lapWidthRef.current[i] = tripleRow(row);
      });
      backRowRefs.current.forEach((row) => tripleRow(row));

      const getProgress = () => {
        const rect = wrap.getBoundingClientRect();
        const scrollable = rect.height - window.innerHeight;
        return scrollable > 0 ? clamp01(-rect.top / scrollable) : 0;
      };

      const paintReel = (progress: number) => {
        const reelT = clamp01(progress / REEL_END);
        ROWS.forEach((row, i) => {
          const lap = lapWidthRef.current[i] ?? 0;
          const travel = lap * LOOP_COUNT;
          const offset = wrapToRange(-reelT * travel * row.direction, lap);
          const transform = `translateX(${offset}px)`;
          const front = frontRowRefs.current[i];
          const back = backRowRefs.current[i];
          if (front) front.style.transform = transform;
          if (back) back.style.transform = transform;
        });
      };

      const paintFlip = (progress: number) => {
        const flipT = clamp01((progress - REEL_END) / (FLIP_END - REEL_END));
        if (stageRef.current) stageRef.current.style.transform = `rotateX(${flipT * 180}deg)`;
      };

      const paintThrow = (progress: number) => {
        const card = thrownRef.current;
        if (!card) return;
        const w = window.innerWidth;
        const h = window.innerHeight;

        const startX = w * 0.86;
        const startY = h * 0.24;
        const landX = w * 0.7;
        const landY = h * 0.84;
        const slideX = w * 0.28;
        const liftY = h * 0.62;

        let x: number;
        let y: number;
        let rot: number;
        let scale: number;
        let opacity: number;

        if (progress <= FLIP_END) {
          x = startX;
          y = startY;
          rot = -8;
          scale = 0.7;
          opacity = 0;
        } else if (progress <= THROW_END) {
          const throwT = clamp01((progress - FLIP_END) / (THROW_END - FLIP_END));
          x = lerp(startX, landX, throwT);
          y = lerp(startY, landY, throwT);
          rot = lerp(-8, 22, throwT);
          scale = lerp(0.7, 1.05, throwT);
          opacity = clamp01(throwT / 0.3);
        } else if (progress <= SLIDE_END) {
          const slideT = clamp01((progress - THROW_END) / (SLIDE_END - THROW_END));
          x = lerp(landX, slideX, slideT);
          y = landY;
          rot = lerp(22, 0, slideT);
          scale = lerp(1.05, 1, slideT);
          opacity = 1;
        } else {
          const fadeT = clamp01((progress - SLIDE_END) / (1 - SLIDE_END));
          x = slideX;
          y = lerp(landY, liftY, fadeT);
          rot = 0;
          scale = lerp(1, 1.12, fadeT);
          opacity = 1 - fadeT;
        }

        card.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%) rotate(${rot}deg) scale(${scale})`;
        card.style.opacity = String(opacity);
      };

      const update = () => {
        const progress = getProgress();
        paintReel(progress);
        paintFlip(progress);
        paintThrow(progress);
        if (countRef.current) countRef.current.textContent = `${Math.round(progress * 100)}%`;
      };

      // Cancel-and-reschedule instead of a boolean "ticking" gate: a boolean
      // gate that's only cleared inside the rAF callback can leave the
      // animation showing a stale frame if that one callback is delayed —
      // rAF is paused for hidden tabs by design, and a scroll or resize that
      // fires while hidden would otherwise sit unresolved until the next
      // event happened to arrive after the tab became visible again. This
      // way every scroll/resize/visibility change always gets its own fresh
      // frame request, and returning to the tab snaps straight to the
      // correct position instead of waiting on the next scroll to catch up.
      let rafId: number | null = null;
      const schedule = () => {
        if (rafId !== null) window.cancelAnimationFrame(rafId);
        rafId = window.requestAnimationFrame(() => {
          rafId = null;
          update();
        });
      };

      update();
      window.addEventListener('scroll', schedule, { passive: true });
      window.addEventListener('resize', schedule);
      document.addEventListener('visibilitychange', schedule);

      return () => {
        if (rafId !== null) window.cancelAnimationFrame(rafId);
        window.removeEventListener('scroll', schedule);
        window.removeEventListener('resize', schedule);
        document.removeEventListener('visibilitychange', schedule);
      };
    } catch {
      // scroll-linked motion is a progressive enhancement only
    }
  }, []);

  return (
    <section ref={wrapRef} className="relative overflow-x-hidden md:h-[420vh]" style={{ background: 'var(--ink)' }}>
      <div className="relative flex flex-col justify-center gap-5 overflow-hidden py-16 md:sticky md:top-0 md:h-screen md:py-0">
        <FilmSprockets />

        <div className="flex items-baseline justify-between px-6">
          <h2
            className="font-[family-name:var(--font-fraunces)] text-2xl font-extrabold uppercase md:text-3xl"
            style={{ color: 'var(--paper)' }}
          >
            Opportunities
          </h2>
          <span
            ref={countRef}
            className="font-[family-name:var(--font-bungee)] text-[11px]"
            style={{ background: 'var(--lime)', color: 'var(--ink)', borderRadius: 'var(--radius-stamp)', padding: '6px 10px' }}
          >
            SCROLL &darr;
          </span>
        </div>

        <div style={{ perspective: '1400px' }}>
          <div ref={stageRef} className="relative flex flex-col gap-5" style={{ transformStyle: 'preserve-3d', willChange: 'transform' }}>
            <div className="flex flex-col gap-5" style={{ backfaceVisibility: 'hidden' }}>
              {ROWS.map((row, i) => (
                <div key={i} className="overflow-x-auto px-6 pb-1 md:overflow-hidden">
                  <div
                    ref={(el) => {
                      frontRowRefs.current[i] = el;
                    }}
                    className="flex w-fit gap-4 will-change-transform"
                  >
                    {row.items.map((item, j) => (
                      <Card key={j} item={item} color={row.color} />
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div
              aria-hidden="true"
              className="absolute inset-0 flex flex-col justify-center gap-5"
              style={{ backfaceVisibility: 'hidden', transform: 'rotateX(180deg)' }}
            >
              {ROWS.map((row, i) => (
                <div key={i} className="overflow-hidden px-6 pb-1">
                  <div
                    ref={(el) => {
                      backRowRefs.current[i] = el;
                    }}
                    className="flex w-fit gap-4 will-change-transform"
                  >
                    {row.items.map((item, j) => (
                      <Card key={j} item={item} color={row.color} variant="back" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div
          ref={thrownRef}
          aria-hidden
          className="pointer-events-none absolute top-0 left-0 opacity-0"
          style={{ willChange: 'transform, opacity' }}
        >
          <Card item={THROWN_ITEM} color={THROWN_COLOR} />
        </div>

        <p
          className="font-[family-name:var(--font-archivo)] px-6 text-[11px] font-bold tracking-[0.05em] uppercase"
          style={{ color: 'rgba(245,239,227,0.5)' }}
        >
          Conferences · Hackathons · Courses — three registers, one deadline spine. Mock listings shown.
        </p>

        <FilmSprockets />
      </div>
    </section>
  );
}
