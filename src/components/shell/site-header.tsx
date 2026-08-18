import Link from 'next/link';

import { getCurrentUserEmail } from '@/lib/queries/current-user';

import { TabletMenu } from './tablet-menu';

const NAV_LINKS = [
  { href: '/browse', label: 'Browse' },
  { href: '/community', label: 'Community' },
  { href: '/get-app', label: 'Get the app' },
];

// Top nav, desktop web. Bottom tab bar (BottomNav) covers mobile/app.
export async function SiteHeader() {
  const email = await getCurrentUserEmail();

  return (
    <header
      className="sticky top-0 z-40 hidden md:block"
      style={{ background: 'var(--marigold)', borderBottom: 'var(--border-width) solid var(--ink)' }}
    >
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="font-[family-name:var(--font-bungee)] text-xl tracking-tight uppercase"
          style={{ color: 'var(--ink)' }}
        >
          OffMap
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-6 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="font-[family-name:var(--font-archivo)] border-b-2 border-transparent text-[13px] font-bold tracking-[0.06em] uppercase transition-colors hover:border-[color:var(--ink)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--cobalt)]"
              style={{ color: 'var(--ink)' }}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/profile"
            className="font-[family-name:var(--font-archivo)] px-4 py-2 text-[13px] font-bold tracking-[0.06em] uppercase transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--cobalt)]"
            style={{
              borderRadius: 'var(--radius-pill)',
              border: 'var(--border-width) solid var(--ink)',
              background: 'var(--ink)',
              color: 'var(--card)',
              boxShadow: 'var(--shadow-offset-paper-sm)',
            }}
          >
            {email ? 'Profile' : 'Sign in'}
          </Link>
        </nav>

        <TabletMenu signedIn={Boolean(email)} />
      </div>
    </header>
  );
}
