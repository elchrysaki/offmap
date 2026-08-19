'use client';

import Link from 'next/link';
import { useEffect, useId, useState } from 'react';

const NAV_LINKS = [
  { href: '/browse', label: 'Browse' },
  { href: '/community', label: 'Community' },
  { href: '/get-app', label: 'Get the app' },
  { href: '/submit', label: 'Add opportunity' },
];

// The "sandwich" (hamburger) nav for the iPad-width band — the desktop top
// nav's full inline link row gets tight between the mobile bottom-tab
// breakpoint and desktop (CLAUDE.md's Route D: top nav web, bottom tab
// mobile/app — this fills the tablet gap between the two). Shown only
// `md:flex lg:hidden`; SiteHeader keeps the full row at `lg:` and up, and
// BottomNav keeps covering below `md`.
export function TabletMenu({ signedIn }: { signedIn: boolean }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  // Close on route change via Escape, and lock scroll while open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  return (
    <div className="hidden md:block lg:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? 'Close menu' : 'Open menu'}
        onClick={() => setOpen((v) => !v)}
        className="relative flex h-11 w-11 flex-col items-center justify-center gap-[5px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--cobalt)]"
        style={{
          borderRadius: 'var(--radius-pill)',
          border: 'var(--border-width) solid var(--ink)',
          background: open ? 'var(--ink)' : 'var(--card)',
        }}
      >
        <span
          aria-hidden="true"
          className="h-[2px] w-5 transition-transform"
          style={{
            background: open ? 'var(--card)' : 'var(--ink)',
            transform: open ? 'translateY(7px) rotate(45deg)' : 'none',
          }}
        />
        <span
          aria-hidden="true"
          className="h-[2px] w-5 transition-opacity"
          style={{ background: open ? 'var(--card)' : 'var(--ink)', opacity: open ? 0 : 1 }}
        />
        <span
          aria-hidden="true"
          className="h-[2px] w-5 transition-transform"
          style={{
            background: open ? 'var(--card)' : 'var(--ink)',
            transform: open ? 'translateY(-7px) rotate(-45deg)' : 'none',
          }}
        />
      </button>

      {open && (
        <>
          <button
            aria-hidden="true"
            tabIndex={-1}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40"
            style={{ background: 'rgba(20,18,16,0.35)' }}
          />
          <nav
            id={panelId}
            aria-label="Primary"
            className="fixed top-[73px] right-4 left-4 z-50 flex flex-col gap-2 p-4"
            style={{
              background: 'var(--card)',
              border: 'var(--border-width) solid var(--ink)',
              borderRadius: 'var(--radius-card)',
              boxShadow: 'var(--shadow-offset)',
            }}
          >
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="font-[family-name:var(--font-archivo)] px-3 py-3 text-[15px] font-bold tracking-[0.02em] uppercase focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--cobalt)]"
                style={{ color: 'var(--ink)', borderBottom: '1.5px solid var(--rule)' }}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href={signedIn ? '/profile' : '/sign-in'}
              onClick={() => setOpen(false)}
              className="font-[family-name:var(--font-archivo)] mt-1 px-4 py-3 text-center text-[14px] font-bold tracking-[0.06em] uppercase focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--cobalt)]"
              style={{
                borderRadius: 'var(--radius-pill)',
                border: 'var(--border-width) solid var(--ink)',
                background: 'var(--ink)',
                color: 'var(--card)',
              }}
            >
              {signedIn ? 'Profile' : 'Sign in'}
            </Link>
          </nav>
        </>
      )}
    </div>
  );
}
