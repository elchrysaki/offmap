'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

// Small, hand-rolled line icons — no icon library per CLAUDE.md §9's
// "never do without asking first: add a dependency that pulls in a design
// system or UI kit." Kept intentionally small (18px) — a prior version of
// this nav idea used oversized icons and it read as noisy.
const ICONS: Record<string, React.ReactNode> = {
  home: <path d="M3 9.5 9 4l6 5.5V15a1 1 0 0 1-1 1h-3v-4H7v4H4a1 1 0 0 1-1-1Z" />,
  browse: <path d="M8 3a5 5 0 1 0 0 10 5 5 0 0 0 0-10Zm5.5 11L16 16.5" strokeLinecap="round" />,
  community: (
    <path d="M6 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm6 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM2 15c0-2 1.8-3.5 4-3.5S10 13 10 15M8 15c0-2 1.8-3.5 4-3.5S16 13 16 15" />
  ),
  profile: <path d="M9 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm-5 8c0-2.8 2.2-5 5-5s5 2.2 5 5" />,
};

const TABS = [
  { href: '/', label: 'Home', icon: 'home' },
  { href: '/browse', label: 'Browse', icon: 'browse' },
  { href: '/community', label: 'Community', icon: 'community' },
  { href: '/profile', label: 'Profile', icon: 'profile' },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 flex md:hidden"
      style={{ background: 'var(--paper)', borderTop: 'var(--border-width) solid var(--ink)' }}
    >
      {TABS.map((tab) => {
        const active = tab.href === '/' ? pathname === '/' : pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? 'page' : undefined}
            className="flex flex-1 flex-col items-center gap-0.5 py-2 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[color:var(--cobalt)]"
            style={{ color: active ? 'var(--cobalt)' : 'var(--muted)' }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              aria-hidden="true"
            >
              {ICONS[tab.icon]}
            </svg>
            <span className="font-[family-name:var(--font-archivo)] text-[10px] font-bold tracking-[0.04em] uppercase">
              {tab.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
