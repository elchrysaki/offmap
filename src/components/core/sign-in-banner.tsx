import Link from 'next/link';

// Guest-only nudge — saving already works without an account (device-local),
// this just surfaces the cross-device sync upgrade. Never a requirement to
// browse, save, or submit (ADR 0005, guest-first stays the default).
export function SignInBanner() {
  return (
    <div
      className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"
      style={{
        background: 'var(--card)',
        border: 'var(--border-width) solid var(--ink)',
        borderRadius: 'var(--radius-card)',
        boxShadow: 'var(--shadow-offset-sm)',
      }}
    >
      <p className="text-[13px] font-bold" style={{ color: 'var(--ink)' }}>
        Sign in to sync your saved opportunities across devices.
      </p>
      <Link
        href="/sign-in"
        className="font-[family-name:var(--font-archivo)] shrink-0 px-4 py-2 text-[12px] font-extrabold tracking-[0.05em] uppercase focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--cobalt)]"
        style={{
          borderRadius: 'var(--radius-pill)',
          border: 'var(--border-width) solid var(--ink)',
          background: 'var(--ink)',
          color: 'var(--card)',
        }}
      >
        Sign in
      </Link>
    </div>
  );
}
