'use client';

import { useEffect, useRef } from 'react';

type MockCard = { tag: string; title: string; meta: string };

// Matches the approved design concept exactly. Mock listings — flagged in
// the on-page hint copy — not real published opportunities. Swap for real
// grouped data once there's enough listing volume to fill three rows
// (CLAUDE.md §12 step 8).
const ROWS: { color: string; items: MockCard[] }[] = [
  {
    color: 'var(--cobalt)',
    items: [
      { tag: 'Conference', title: 'TEDx Athens Youth', meta: 'Open call · 16–19 · Athens' },
      { tag: 'Conference', title: 'Web Summit Lisbon — Student Pass', meta: 'Discounted · 18+ · Lisbon' },
      { tag: 'Conference', title: 'Athens Science Festival', meta: 'Free entry · 15–19 · Athens' },
      { tag: 'Conference', title: 'Youth Diplomacy Forum', meta: 'Travel funded · 16–20 · Brussels' },
      { tag: 'Conference', title: 'Climate Futures Summit', meta: 'Fully funded · 17–21 · Berlin' },
      { tag: 'Conference', title: 'Model UN — The Hague', meta: 'Self-funded · 16–19 · The Hague' },
    ],
  },
  {
    color: 'var(--teal)',
    items: [
      { tag: 'Hackathon', title: 'Junction Hack Athens', meta: 'Weekend · 17–24 · Athens' },
      { tag: 'Hackathon', title: 'NASA Space Apps Piraeus', meta: 'Weekend · 15–24 · Piraeus' },
      { tag: 'Hackathon', title: 'HackTheBank Fintech', meta: 'Prize pool · 18–25 · Remote' },
      { tag: 'Hackathon', title: 'AI4Good Hackathon', meta: 'Fully funded · 16–22 · Thessaloniki' },
      { tag: 'Hackathon', title: 'Girls Who Code Jam', meta: 'Free · 14–18 · Remote' },
      { tag: 'Hackathon', title: 'Robotics Build-Off', meta: 'Weekend · 15–19 · Patras' },
    ],
  },
  {
    color: 'var(--violet)',
    items: [
      { tag: 'Course', title: 'MIT PRIMES-USA', meta: 'Fully funded · 16–18 · Remote' },
      { tag: 'Course', title: 'CERN Summer School', meta: 'Stipend · 18–24 · Geneva' },
      { tag: 'Course', title: 'Piraeus Robotics Bootcamp', meta: 'Funded · 16–19 · Piraeus' },
      { tag: 'Course', title: 'Oxford Summer Politics', meta: 'Fee-based, bursaries · 17–19 · Oxford' },
      { tag: 'Course', title: 'Deep Learning Intensive', meta: 'Free · 18+ · Remote' },
      { tag: 'Course', title: 'Marine Biology Fieldwork', meta: 'Funded · 17–20 · Crete' },
    ],
  },
];

export function OpportunitiesReel() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<Array<HTMLDivElement | null>>([]);
  const countRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    try {
      if (typeof window === 'undefined') return;
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      // Must match Tailwind's `md:` breakpoint (768px) — the pinned height and
      // sticky positioning only exist above that width. A mismatched threshold
      // here meant this JS ran its scroll-jack math against an unpinned,
      // normal-height section for any width between the two breakpoints.
      const isDesktop = window.matchMedia('(min-width: 768px)').matches;
      if (reduceMotion || !isDesktop) return;

      const wrap = wrapRef.current;
      if (!wrap) return;

      const shiftRow = (row: HTMLDivElement | null, progress: number, direction: 1 | -1) => {
        if (!row || !row.parentElement) return;
        const max = row.scrollWidth - row.parentElement.clientWidth;
        if (max <= 0) return;
        const start = direction > 0 ? -max * 0.5 : max * 0.5;
        const end = direction > 0 ? max * 0.5 : -max * 0.5;
        row.style.transform = `translateX(${start + (end - start) * progress}px)`;
      };

      const update = () => {
        const rect = wrap.getBoundingClientRect();
        const viewportH = window.innerHeight;
        const scrollable = rect.height - viewportH;
        if (scrollable <= 0) return;
        const progress = Math.max(0, Math.min(1, (0 - rect.top) / scrollable));
        rowRefs.current.forEach((row, i) => shiftRow(row, progress, i % 2 === 0 ? 1 : -1));
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

      window.addEventListener('scroll', schedule, { passive: true });
      window.addEventListener('resize', schedule);
      document.addEventListener('visibilitychange', schedule);
      update();
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
    <section ref={wrapRef} className="relative md:h-[280vh]" style={{ background: 'var(--ink)' }}>
      <div className="flex flex-col justify-center gap-5 overflow-hidden py-16 md:sticky md:top-0 md:h-screen md:py-0">
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

        {ROWS.map((row, i) => (
          <div key={i} className="overflow-x-auto px-6 pb-1 md:overflow-visible">
            <div
              ref={(el) => {
                rowRefs.current[i] = el;
              }}
              className="flex gap-4 will-change-transform"
            >
              {row.items.map((item, j) => (
                <div
                  key={j}
                  className="flex w-[220px] flex-none flex-col gap-2.5 p-4"
                  style={{
                    background: 'var(--card)',
                    border: 'var(--border-width) solid var(--ink)',
                    borderRadius: 'var(--radius-card)',
                  }}
                >
                  <span
                    className="font-[family-name:var(--font-archivo)] w-fit px-2 py-0.5 text-[10px] font-bold tracking-[0.06em] uppercase"
                    style={{ background: row.color, color: 'var(--ink)', borderRadius: 'var(--radius-stamp)' }}
                  >
                    {item.tag}
                  </span>
                  <h3 className="font-[family-name:var(--font-fraunces)] text-[15px] leading-snug font-bold">
                    {item.title}
                  </h3>
                  <p className="text-[12px]" style={{ color: 'var(--muted)' }}>
                    {item.meta}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}

        <p
          className="font-[family-name:var(--font-archivo)] px-6 text-[11px] font-bold tracking-[0.05em] uppercase"
          style={{ color: 'rgba(245,239,227,0.5)' }}
        >
          Conferences · Hackathons · Courses — three registers, one deadline spine. Mock listings shown.
        </p>
      </div>
    </section>
  );
}
