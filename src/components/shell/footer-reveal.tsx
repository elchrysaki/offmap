'use client';

import { useEffect, useRef, useState } from 'react';

// Curtain-reveal footer: the page content scrolls up and over it, uncovering
// it from behind rather than the footer just appearing in the normal flow.
// Desktop only — on mobile the fixed bottom tab bar already owns that space,
// so the footer stays in normal flow there (no JS needed, always correct).
export function FooterReveal({ children }: { children: React.ReactNode }) {
  const footerRef = useRef<HTMLDivElement>(null);
  const [spacerHeight, setSpacerHeight] = useState<number | null>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    try {
      if (typeof window === 'undefined') return;
      const isDesktop = window.matchMedia('(min-width: 768px)').matches;
      if (!isDesktop) return;

      setEnabled(true);
      const el = footerRef.current;
      if (!el) return;

      const update = () => setSpacerHeight(el.offsetHeight);
      update();

      const ro = 'ResizeObserver' in window ? new ResizeObserver(update) : null;
      ro?.observe(el);
      window.addEventListener('resize', update);
      return () => {
        ro?.disconnect();
        window.removeEventListener('resize', update);
      };
    } catch {
      // reveal effect is a progressive enhancement; footer still renders normally
    }
  }, []);

  return (
    <>
      {enabled && spacerHeight !== null && <div aria-hidden="true" style={{ height: spacerHeight }} />}
      <div ref={footerRef} className={enabled ? 'md:fixed md:inset-x-0 md:bottom-0' : ''} style={{ zIndex: 0 }}>
        {children}
      </div>
    </>
  );
}
