'use client';

import { useEffect, useState } from 'react';

// Filters (type/field/level/eligibility/reach/funding/format/deadline) used
// to render as eight always-visible pill bars, which read as noise on
// browse (Elena's call, 20 Aug: "make the filters hidden"). This wraps them
// behind a single trigger; server-rendered filter bars are passed straight
// through as children, so the filters themselves stay plain <Link>-based
// pill navs with no client JS of their own — only the show/hide chrome is
// client-side.
export function FilterDrawer({
  children,
  activeCount,
}: {
  children: React.ReactNode;
  activeCount: number;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <div className="mt-7">
      <button
        type="button"
        data-tour="filter-trigger"
        onClick={() => setOpen(true)}
        aria-expanded={open}
        aria-haspopup="dialog"
        className="font-[family-name:var(--font-archivo)] inline-flex items-center gap-2 px-4 py-2.5 text-[13px] font-extrabold tracking-[0.04em] uppercase focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--cobalt)]"
        style={{
          borderRadius: 'var(--radius-pill)',
          border: 'var(--border-width) solid var(--ink)',
          background: activeCount > 0 ? 'var(--lime)' : 'var(--card)',
          color: 'var(--ink)',
          boxShadow: 'var(--shadow-offset-sm)',
        }}
      >
        <span aria-hidden="true">☰</span>
        Filters
        {activeCount > 0 && (
          <span
            className="inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[11px]"
            style={{ background: 'var(--ink)', color: 'var(--card)' }}
          >
            {activeCount}
          </span>
        )}
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Filters"
          className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
        >
          <button
            type="button"
            aria-label="Close filters"
            onClick={() => setOpen(false)}
            className="absolute inset-0"
            style={{ background: 'rgba(20,18,16,0.55)' }}
          />
          <div
            className="relative flex max-h-[80vh] w-full max-w-2xl flex-col gap-4 overflow-y-auto p-6 sm:m-6"
            style={{
              borderRadius: 'var(--radius-panel)',
              border: 'var(--border-width) solid var(--ink)',
              boxShadow: 'var(--shadow-offset)',
              background: 'var(--card)',
            }}
          >
            <div className="flex items-center justify-between">
              <h2 className="font-[family-name:var(--font-fraunces)] text-[20px] font-extrabold">
                Filters
              </h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close filters"
                className="font-[family-name:var(--font-archivo)] px-3 py-1.5 text-[12px] font-bold uppercase focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--cobalt)]"
                style={{
                  borderRadius: 'var(--radius-pill)',
                  border: 'var(--border-width) solid var(--ink)',
                  background: 'var(--card)',
                  color: 'var(--ink)',
                }}
              >
                Done
              </button>
            </div>
            <div className="flex flex-col gap-4">{children}</div>
          </div>
        </div>
      )}
    </div>
  );
}
