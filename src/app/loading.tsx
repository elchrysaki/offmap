// App-wide loading/welcome screen (CLAUDE.md §15, 17 Aug site-IA
// expansion) — Next's Suspense fallback during server-rendered navigation.
// Redesigned 20 Aug (Elena's call): the wordmark now scrolls continuously,
// same `.animate-marquee` CSS loop the Ticker uses on the home page
// (src/components/shell/ticker.tsx) rather than the old Framer Motion
// wipe/zoom sequence — a plain infinite scroll reads faster as "still
// loading" than a multi-second choreographed animation does, and it's
// free: pure CSS, respects prefers-reduced-motion automatically (see the
// media query in globals.css), no JS to hydrate before it can even start.
const WORDS = Array.from({ length: 8 }, () => 'OFFMAP');

export default function Loading() {
  return (
    <div
      role="status"
      aria-label="Loading OffMap"
      className="flex items-center overflow-hidden"
      style={{ height: '100vh', background: 'var(--ink)' }}
    >
      <ul className="animate-marquee m-0 flex list-none items-center gap-16 p-0 whitespace-nowrap">
        {[...WORDS, ...WORDS].map((word, i) => (
          <li
            key={i}
            className="font-[family-name:var(--font-bungee)] text-[clamp(2.5rem,9vw,6rem)] leading-none uppercase"
            style={{ color: 'var(--paper)' }}
          >
            {word}
          </li>
        ))}
      </ul>
    </div>
  );
}
