'use client';

import { useEffect, useRef } from 'react';

import RadialRevealButton from './radial-reveal-button';

// Bold shell hero: full-bleed marigold field that pins on scroll while the
// next section rolls up over it. Degrades to a plain static hero under
// prefers-reduced-motion, on narrow screens, or if anything here throws —
// the content itself never depends on the animation to be readable.
export function Hero() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      if (typeof window === 'undefined') return;
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const isDesktop = window.matchMedia('(min-width: 768px)').matches;
      if (reduceMotion || !isDesktop) return;

      const wrap = wrapRef.current;
      const inner = innerRef.current;
      if (!wrap || !inner) return;

      let ticking = false;
      const update = () => {
        ticking = false;
        const rect = wrap.getBoundingClientRect();
        const viewportH = window.innerHeight;
        const scrollable = rect.height - viewportH;
        if (scrollable <= 0) return;
        const progress = Math.max(0, Math.min(1, (0 - rect.top) / scrollable));
        inner.style.transform = `scale(${1 - progress * 0.07}) translateY(${progress * -26}px)`;
        inner.style.opacity = String(1 - progress * 0.5);
      };
      const onScroll = () => {
        if (!ticking) {
          window.requestAnimationFrame(update);
          ticking = true;
        }
      };
      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onScroll);
      update();
      return () => {
        window.removeEventListener('scroll', onScroll);
        window.removeEventListener('resize', onScroll);
      };
    } catch {
      // scroll-linked motion is a progressive enhancement only
    }
  }, []);

  return (
    <div ref={wrapRef} className="relative md:h-[160vh]" style={{ background: 'var(--marigold)' }}>
      <div className="flex flex-col items-center justify-center overflow-hidden py-20 md:sticky md:top-0 md:h-screen md:py-0">
        <div
          ref={innerRef}
          className="mx-auto flex max-w-3xl flex-col items-start gap-6 px-6 will-change-transform"
        >
          <p
            className="font-[family-name:var(--font-archivo)] text-[13px] font-medium tracking-[0.28em] uppercase"
            style={{ color: 'var(--ink)', opacity: 0.68 }}
          >
            Selective programmes, verified by hand
          </p>

          <h1 className="font-[family-name:var(--font-fraunces)] text-5xl leading-[0.98] font-black tracking-tight uppercase md:text-7xl">
            The{' '}
            <span style={{ WebkitTextStroke: '2px var(--ink)', color: 'var(--marigold)' }}>
              opportunities
            </span>{' '}
            you actually get into.
          </h1>

          <p className="max-w-xl text-lg font-semibold" style={{ color: 'rgba(20,18,16,0.72)' }}>
            Selective programmes with a real organiser, a real deadline and a real funder — including
            the ones that never make it online.
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-4">
            <RadialRevealButton
              label="For students"
              link="/browse"
              addIcon
              icon={{ symbol: '→', side: 'right', size: 15, color: 'var(--card)', hoverColor: 'var(--card)' }}
              padding="16px 28px"
              colors={{
                fill: 'var(--ink)',
                textColor: 'var(--card)',
                hoverFill: 'var(--cobalt)',
                hoverTextColor: 'var(--card)',
              }}
              border={{ borderWidth: 2, borderStyle: 'solid', borderColor: 'var(--ink)' }}
              style={{ boxShadow: 'var(--shadow-offset-paper)' }}
            />
            <RadialRevealButton
              label="For organisations"
              link="/contact"
              padding="16px 28px"
              colors={{
                fill: 'var(--card)',
                textColor: 'var(--ink)',
                hoverFill: 'var(--ink)',
                hoverTextColor: 'var(--card)',
              }}
              border={{ borderWidth: 2, borderStyle: 'solid', borderColor: 'var(--ink)' }}
              style={{ boxShadow: 'var(--shadow-offset)' }}
            />
          </div>
        </div>

        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-7 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-1.5 md:flex"
          style={{ opacity: 0.6 }}
        >
          <span className="animate-bob font-[family-name:var(--font-archivo)] text-sm font-bold" style={{ color: 'var(--ink)' }}>
            &darr;
          </span>
          <span
            className="font-[family-name:var(--font-archivo)] text-[10px] font-extrabold tracking-[0.14em] uppercase"
            style={{ color: 'var(--ink)' }}
          >
            Scroll
          </span>
        </div>
      </div>
    </div>
  );
}
