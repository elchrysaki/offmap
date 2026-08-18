'use client';

import { useState } from 'react';

// Empty state (CLAUDE.md §7): shell register, "Nothing here yet. Tell me
// when there is." plus one Alert me button writing a filter_alert. Every
// empty result is a subscription prompt.
//
// filter_alert isn't built yet (build order step 7, after browse/detail) —
// this fails loudly with a clear "not live yet" message rather than
// silently pretending to subscribe someone to nothing.
export function EmptyState() {
  const [clicked, setClicked] = useState(false);

  return (
    <div
      className="mt-8 px-6 py-12 text-center"
      style={{
        borderRadius: 'var(--radius-card)',
        border: 'var(--border-width) solid var(--ink)',
        boxShadow: 'var(--shadow-offset)',
        background: 'var(--card)',
      }}
    >
      <p className="font-[family-name:var(--font-fraunces)] text-2xl font-bold">
        Nothing here yet. Tell me when there is.
      </p>
      <button
        type="button"
        onClick={() => setClicked(true)}
        className="font-[family-name:var(--font-archivo)] mt-6 px-5 py-2.5 text-[13px] font-bold uppercase focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--cobalt)]"
        style={{
          borderRadius: 'var(--radius-pill)',
          border: 'var(--border-width) solid var(--ink)',
          background: 'var(--marigold)',
          color: 'var(--ink)',
          letterSpacing: '0.06em',
        }}
      >
        Alert me
      </button>
      {clicked && (
        <p className="mt-3 text-[13px]" style={{ color: 'var(--muted)' }} role="status">
          Deadline alerts aren&apos;t live yet — check back soon.
        </p>
      )}
    </div>
  );
}
