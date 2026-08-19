import Link from 'next/link';

const COLUMNS: { heading: string; links: { href: string; label: string }[] }[] = [
  {
    heading: 'Explore',
    links: [
      { href: '/browse', label: 'Browse' },
      { href: '/community', label: 'Community' },
      { href: '/get-app', label: 'Get the app' },
      { href: '/submit', label: 'Add opportunity' },
    ],
  },
  {
    heading: 'Account',
    links: [
      { href: '/sign-in', label: 'Sign in' },
      { href: '/sign-up', label: 'Create account' },
      { href: '/profile', label: 'Profile' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { href: '/contact', label: 'Contact' },
      { href: '/licenses', label: 'Licenses' },
      { href: '/privacy', label: 'Privacy' },
      { href: '/terms', label: 'Terms' },
    ],
  },
];

export function SiteFooter() {
  return (
    <div
      className="px-4 py-10 sm:px-6 md:py-16"
      style={{
        background: 'var(--paper)',
        backgroundImage: 'radial-gradient(var(--rule) 1.4px, transparent 1.4px)',
        backgroundSize: '18px 18px',
      }}
    >
      <div
        className="relative mx-auto max-w-6xl overflow-hidden px-6 pt-10 pb-6 sm:px-10 sm:pt-12"
        style={{
          background: 'var(--ink)',
          borderRadius: 'var(--radius-panel)',
          border: 'var(--border-width) solid var(--ink)',
          boxShadow: '0 0 0 4px var(--card), 0 0 0 7px var(--marigold)',
        }}
      >
        <div className="relative z-10 flex flex-wrap items-start justify-between gap-10">
          <span
            className="font-[family-name:var(--font-bungee)] text-lg tracking-tight uppercase"
            style={{ color: 'var(--paper)' }}
          >
            OffMap
          </span>

          <nav aria-label="Footer" className="flex flex-wrap gap-x-14 gap-y-8">
            {COLUMNS.map((col) => (
              <div key={col.heading}>
                <p
                  className="font-[family-name:var(--font-archivo)] text-[11px] font-extrabold tracking-[0.14em] uppercase"
                  style={{ color: 'rgba(245,239,227,0.45)' }}
                >
                  {col.heading}
                </p>
                <ul className="mt-3 flex flex-col gap-2.5">
                  {col.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="font-[family-name:var(--font-archivo)] text-[13px] font-bold tracking-[0.02em] transition-opacity hover:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--marigold)]"
                        style={{ color: 'var(--paper)', opacity: 0.85 }}
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>

          <Link
            href="/sign-in"
            className="font-[family-name:var(--font-archivo)] inline-flex shrink-0 items-center gap-2 px-6 py-3 text-[13px] font-extrabold tracking-[0.05em] uppercase transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--marigold)]"
            style={{
              borderRadius: 'var(--radius-pill)',
              border: 'var(--border-width) solid var(--marigold)',
              background: 'var(--marigold)',
              color: 'var(--ink)',
              boxShadow: '4px 4px 0 rgba(245,239,227,0.25)',
            }}
          >
            Sign in &rarr;
          </Link>
        </div>

        <div className="relative z-10 mt-14 flex flex-wrap items-end justify-between gap-4 sm:mt-20">
          <p
            className="font-[family-name:var(--font-archivo)] max-w-[36ch] text-[13px]"
            style={{ color: 'rgba(245,239,227,0.55)' }}
          >
            &copy; {new Date().getFullYear()} OffMap. Guest-first, always free for students.
          </p>
        </div>

        <span
          aria-hidden="true"
          className="font-[family-name:var(--font-bungee)] pointer-events-none absolute -bottom-[0.14em] -left-[0.03em] z-0 text-[clamp(4.2rem,16vw,11rem)] leading-none uppercase select-none"
          style={{ color: 'var(--paper)', opacity: 0.07 }}
        >
          OffMap
        </span>
      </div>
    </div>
  );
}
