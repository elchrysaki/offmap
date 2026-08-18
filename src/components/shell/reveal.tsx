'use client';

import { useEffect, useRef, useState } from 'react';

// Smooth scroll-in transition for shell-register marketing sections.
// Respects prefers-reduced-motion (CLAUDE.md §10) — no animation, just show.
//
// Visible by default: if the observer never fires (or throws), content is
// never left permanently hidden — it just skips the entrance animation.
export function Reveal({
  children,
  className,
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const node = ref.current;
    if (!node || !('IntersectionObserver' in window)) return;

    setAnimated(true);
    setVisible(false);

    let settled = false;
    const reveal = () => {
      if (settled) return;
      settled = true;
      setVisible(true);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          reveal();
          observer.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -30px 0px' },
    );
    observer.observe(node);

    // safety net: never leave content stuck invisible
    const timer = window.setTimeout(reveal, 2500);

    return () => {
      observer.disconnect();
      window.clearTimeout(timer);
    };
  }, []);

  const { transitionDelay, ...restStyle } = style ?? {};

  return (
    <div
      ref={ref}
      className={className}
      style={
        animated
          ? {
              ...restStyle,
              opacity: visible ? 1 : 0,
              transform: visible ? 'translateY(0)' : 'translateY(24px)',
              transition: `opacity 0.6s ease ${transitionDelay ?? '0ms'}, transform 0.6s ease ${transitionDelay ?? '0ms'}`,
            }
          : restStyle
      }
    >
      {children}
    </div>
  );
}
