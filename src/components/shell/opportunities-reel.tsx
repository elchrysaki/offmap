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
const SCROLL_SPEED = 0.6; // px of row movement per px of page scroll

function Card({ item, color, hidden }: { item: MockCard; color: string; hidden?: boolean }) {
  return (
    <div
      aria-hidden={hidden || undefined}
      className="flex w-[220px] flex-none flex-col gap-2.5 p-4"
      style={{
        background: 'var(--card)',
        border: 'var(--border-width) solid var(--ink)',
        borderRadius: 'var(--radius-card)',
      }}
    >
      <span
        className="font-[family-name:var(--font-archivo)] w-fit px-2 py-0.5 text-[10px] font-bold tracking-[0.06em] uppercase"
        style={{ background: color, color: 'var(--ink)', borderRadius: 'var(--radius-stamp)' }}
      >
        {item.tag}
      </span>
      <h3 className="font-[family-name:var(--font-fraunces)] text-[15px] leading-snug font-bold">{item.title}</h3>
      <p className="text-[12px]" style={{ color: 'var(--muted)' }}>
        {item.meta}
      </p>
    </div>
  );
}

export function OpportunitiesReel() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<Array<HTMLDivElement | null>>([]);
  const countRef = useRef<HTMLSpanElement>(null);
  const offsetRef = useRef<number[]>(ROWS.map(() => 0));
  const lapWidthRef = useRef<number[]>(ROWS.map(() => 0));
  const draggingRef = useRef<Array<{ pointerId: number; startX: number; startOffset: number } | null>>(
    ROWS.map(() => null),
  );
  const lastScrollYRef = useRef(0);

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

      // Duplicate each row's cards into extra laps so the belt has
      // somewhere to go when it wraps — done once, imperatively, so mobile
      // and no-JS visitors only ever see the single real lap React rendered.
      rowRefs.current.forEach((row, i) => {
        if (!row) return;
        const originalCards = Array.from(row.children);
        lapWidthRef.current[i] = row.scrollWidth;
        for (let lap = 1; lap < LAPS; lap++) {
          originalCards.forEach((card) => {
            const clone = card.cloneNode(true) as HTMLElement;
            clone.setAttribute('aria-hidden', 'true');
            row.appendChild(clone);
          });
        }
      });

      const wrapOffset = (i: number) => {
        const lap = lapWidthRef.current[i] ?? 0;
        if (lap <= 0) return;
        let offset = offsetRef.current[i] ?? 0;
        while (offset <= -lap) offset += lap;
        while (offset > 0) offset -= lap;
        offsetRef.current[i] = offset;
      };

      const paint = () => {
        rowRefs.current.forEach((row, i) => {
          if (!row) return;
          row.style.transform = `translateX(${offsetRef.current[i]}px)`;
        });
      };

      const isPinned = () => {
        const rect = wrap.getBoundingClientRect();
        return rect.top <= 0 && rect.bottom >= window.innerHeight;
      };

      const update = () => {
        const y = window.scrollY;
        const delta = y - lastScrollYRef.current;
        lastScrollYRef.current = y;

        if (delta !== 0 && isPinned()) {
          ROWS.forEach((row, i) => {
            if (draggingRef.current[i]) return; // paused — under manual control
            offsetRef.current[i] = (offsetRef.current[i] ?? 0) + delta * SCROLL_SPEED * row.direction;
            wrapOffset(i);
          });
        }
        paint();

        if (countRef.current) {
          const rect = wrap.getBoundingClientRect();
          const scrollable = rect.height - window.innerHeight;
          const progress = scrollable > 0 ? Math.max(0, Math.min(1, -rect.top / scrollable)) : 0;
          countRef.current.textContent = `${Math.round(progress * 100)}%`;
        }
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

      lastScrollYRef.current = window.scrollY;
      paint();

      window.addEventListener('scroll', schedule, { passive: true });
      window.addEventListener('resize', schedule);
      document.addEventListener('visibilitychange', schedule);

      // Manual control: grab-drag or trackpad/wheel horizontal swipe on any
      // row pauses that row's scroll-driven movement and lets the visitor
      // move it themselves. Scrolling the page again afterwards resumes
      // from wherever they left it — nothing snaps back, nothing resets.
      const cleanupRowListeners: Array<() => void> = [];
      rowRefs.current.forEach((row, i) => {
        if (!row) return;

        const onPointerDown = (e: PointerEvent) => {
          draggingRef.current[i] = {
            pointerId: e.pointerId,
            startX: e.clientX,
            startOffset: offsetRef.current[i] ?? 0,
          };
          row.setPointerCapture(e.pointerId);
        };
        const onPointerMove = (e: PointerEvent) => {
          const drag = draggingRef.current[i];
          if (!drag || drag.pointerId !== e.pointerId) return;
          offsetRef.current[i] = drag.startOffset + (e.clientX - drag.startX);
          wrapOffset(i);
          paint();
        };
        const endDrag = (e: PointerEvent) => {
          const drag = draggingRef.current[i];
          if (!drag || drag.pointerId !== e.pointerId) return;
          draggingRef.current[i] = null;
          try {
            row.releasePointerCapture(e.pointerId);
          } catch {
            // pointer capture may already be released by the browser
          }
        };
        const onWheel = (e: WheelEvent) => {
          if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return; // vertical swipe — let the page scroll
          e.preventDefault();
          offsetRef.current[i] = (offsetRef.current[i] ?? 0) - e.deltaX;
          wrapOffset(i);
          paint();
        };

        row.addEventListener('pointerdown', onPointerDown);
        row.addEventListener('pointermove', onPointerMove);
        row.addEventListener('pointerup', endDrag);
        row.addEventListener('pointercancel', endDrag);
        row.addEventListener('wheel', onWheel, { passive: false });

        cleanupRowListeners.push(() => {
          row.removeEventListener('pointerdown', onPointerDown);
          row.removeEventListener('pointermove', onPointerMove);
          row.removeEventListener('pointerup', endDrag);
          row.removeEventListener('pointercancel', endDrag);
          row.removeEventListener('wheel', onWheel);
        });
      });

      return () => {
        if (rafId !== null) window.cancelAnimationFrame(rafId);
        window.removeEventListener('scroll', schedule);
        window.removeEventListener('resize', schedule);
        document.removeEventListener('visibilitychange', schedule);
        cleanupRowListeners.forEach((fn) => fn());
      };
    } catch {
      // scroll-linked motion is a progressive enhancement only
    }
  }, []);

  return (
    <section ref={wrapRef} className="relative overflow-x-hidden md:h-[280vh]" style={{ background: 'var(--ink)' }}>
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
          <div key={i} className="overflow-x-auto px-6 pb-1 md:overflow-hidden">
            <div
              ref={(el) => {
                rowRefs.current[i] = el;
              }}
              className="flex w-fit cursor-grab gap-4 will-change-transform select-none active:cursor-grabbing"
            >
              {row.items.map((item, j) => (
                <Card key={j} item={item} color={row.color} />
              ))}
            </div>
          </div>
        ))}

        <p
          className="font-[family-name:var(--font-archivo)] px-6 text-[11px] font-bold tracking-[0.05em] uppercase"
          style={{ color: 'rgba(245,239,227,0.5)' }}
        >
          Conferences · Hackathons · Courses — three registers, one deadline spine. Drag any row to explore. Mock
          listings shown.
        </p>
      </div>
    </section>
  );
}
