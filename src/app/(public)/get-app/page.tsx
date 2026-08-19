'use client';

import { useEffect, useState } from 'react';

import { Reveal } from '@/components/shell/reveal';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

type WhyBox = { title: string; teaser: string; detail: string };

const WHY: WhyBox[] = [
  {
    title: 'Feels like an app',
    teaser: 'Its own window, its own icon — no browser chrome around it.',
    detail:
      "Once installed, OffMap opens in its own window with no address bar or tabs — same as any app on your dock or taskbar. It's the same site, just without the browser around it.",
  },
  {
    title: 'Nothing to download',
    teaser: 'No store, no update prompts, no storage eaten up.',
    detail:
      "There's no app store listing, no multi-hundred-megabyte download, and no separate update step — it's the same lightweight page you're on now, just pinned somewhere faster to reach.",
  },
  {
    title: 'Told before it matters',
    teaser: 'Deadline alerts land the same whether it’s installed or not.',
    detail:
      'Installing doesn’t change what you get told or when — that’s tied to your saves and notification settings either way. It just makes checking back faster.',
  },
  {
    title: 'Still free, still guest-first',
    teaser: 'No account required to install. No account required, period.',
    detail:
      'Installing is just a shortcut — it doesn’t require an account and doesn’t change anything about how OffMap works. Guest-first stays guest-first.',
  },
];

type Platform = 'chrome' | 'safari' | 'other';

const PLATFORMS: { id: Platform; label: string }[] = [
  { id: 'chrome', label: 'Chrome or Edge' },
  { id: 'safari', label: 'Safari' },
  { id: 'other', label: 'Something else' },
];

const cardStyle: React.CSSProperties = {
  background: 'var(--card)',
  border: 'var(--border-width) solid var(--ink)',
  borderRadius: 'var(--radius-card)',
  boxShadow: 'var(--shadow-offset-sm)',
};

export default function GetAppPage() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [openWhy, setOpenWhy] = useState<number | null>(null);
  const [platform, setPlatform] = useState<Platform>('chrome');

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setInstallEvent(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', onPrompt);

    const onInstalled = () => setInstalled(true);
    window.addEventListener('appinstalled', onInstalled);

    if (window.matchMedia('(display-mode: standalone)').matches) setInstalled(true);

    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  async function handleInstall() {
    if (!installEvent) return;
    await installEvent.prompt();
    const { outcome } = await installEvent.userChoice;
    if (outcome === 'accepted') setInstalled(true);
    setInstallEvent(null);
  }

  return (
    <main
      className="px-6 py-16 md:py-24"
      style={{
        background: 'var(--paper)',
        backgroundImage: 'radial-gradient(var(--rule) 1.4px, transparent 1.4px)',
        backgroundSize: '18px 18px',
      }}
    >
      {/* One framed panel — hero, then either the installed confirmation or
          the browser-picker + steps, all inside the same hard-shadow card. */}
      <Reveal
        className="relative mx-auto max-w-3xl overflow-hidden p-6 md:p-12"
        style={{
          background: 'var(--card)',
          border: 'var(--border-width) solid var(--ink)',
          borderRadius: 'var(--radius-panel)',
          boxShadow: 'var(--shadow-offset)',
        }}
      >
        <span
          aria-hidden="true"
          className="font-[family-name:var(--font-bungee)] pointer-events-none absolute -top-[6%] -right-[8%] z-0 text-[clamp(3rem,11vw,7rem)] leading-none uppercase select-none"
          style={{ color: 'var(--ink)', opacity: 0.035, transform: 'rotate(-8deg)' }}
        >
          OffMap
        </span>

        <div className="relative z-10 text-center">
          <p
            className="font-[family-name:var(--font-archivo)] text-[12px] font-extrabold tracking-[0.16em] uppercase"
            style={{ color: 'var(--muted)' }}
          >
            Get the app
          </p>
          <h1 className="font-[family-name:var(--font-fraunces)] mx-auto mt-3.5 max-w-[18ch] text-4xl leading-[1.05] font-extrabold md:text-5xl">
            OffMap, one click from your{' '}
            <em
              className="not-italic font-bold"
              style={{
                background: 'linear-gradient(to top, var(--marigold) 40%, transparent 40%)',
              }}
            >
              desktop
            </em>
            .
          </h1>
          <p
            className="mx-auto mt-4 max-w-[46ch] text-[15px] leading-relaxed font-medium"
            style={{ color: 'var(--muted)' }}
          >
            Installs straight from your browser onto your dock or taskbar — no store listing, no
            download size, still guest-first and free for students. It&apos;s the same OffMap you
            already know, just one click away instead of a search away.
          </p>
        </div>

        {installed ? (
          <div className="relative z-10 mt-10 flex flex-col items-center gap-3 py-8 text-center">
            <span
              className="flex h-14 w-14 items-center justify-center text-2xl"
              style={{
                borderRadius: '9999px',
                background: 'var(--lime)',
                border: 'var(--border-width) solid var(--ink)',
              }}
              aria-hidden="true"
            >
              ★
            </span>
            <h2 className="font-[family-name:var(--font-fraunces)] text-2xl font-extrabold">
              You&apos;re all set
            </h2>
            <p className="max-w-[38ch] text-[14.5px]" style={{ color: 'var(--muted)' }}>
              OffMap is installed on this device — open it the same way you&apos;d open any other
              app.
            </p>
          </div>
        ) : (
          <div className="relative z-10 mt-10">
            <div
              className="flex flex-wrap justify-center gap-2.5"
              role="tablist"
              aria-label="Your browser"
            >
              {PLATFORMS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  role="tab"
                  aria-selected={platform === p.id}
                  onClick={() => setPlatform(p.id)}
                  className="font-[family-name:var(--font-archivo)] px-4 py-2.5 text-[13px] font-bold tracking-[0.02em] transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--cobalt)]"
                  style={{
                    borderRadius: 'var(--radius-pill)',
                    border: 'var(--border-width) solid var(--ink)',
                    background: platform === p.id ? 'var(--ink)' : 'var(--paper)',
                    color: platform === p.id ? 'var(--paper)' : 'var(--ink)',
                    boxShadow: platform === p.id ? 'var(--shadow-offset-sm)' : 'none',
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>

            <div
              className="mt-6 p-6 text-center md:p-8"
              style={{
                background: 'var(--paper)',
                border: 'var(--border-width) solid var(--ink)',
                borderRadius: 'var(--radius-card)',
              }}
            >
              {platform === 'chrome' &&
                (installEvent ? (
                  <div className="flex flex-col items-center">
                    <p className="max-w-[42ch] text-[15px] leading-relaxed">
                      Your browser&apos;s ready to install it directly.
                    </p>
                    <button
                      type="button"
                      onClick={handleInstall}
                      className="font-[family-name:var(--font-archivo)] mt-5 px-7 py-3.5 text-[13px] font-extrabold tracking-[0.05em] uppercase transition-transform hover:-translate-y-0.5"
                      style={{
                        borderRadius: 'var(--radius-pill)',
                        border: 'var(--border-width) solid var(--ink)',
                        background: 'var(--marigold)',
                        color: 'var(--ink)',
                        boxShadow: 'var(--shadow-offset-sm)',
                      }}
                    >
                      Install OffMap
                    </button>
                  </div>
                ) : (
                  <ol className="mx-auto flex max-w-[42ch] flex-col gap-3 text-left">
                    <Step n={1}>
                      Look for the install icon (a small monitor with an arrow) at the right edge of
                      the address bar.
                    </Step>
                    <Step n={2}>
                      Click it, then <strong>Install</strong>.
                    </Step>
                  </ol>
                ))}

              {platform === 'safari' && (
                <ol className="mx-auto flex max-w-[42ch] flex-col gap-3 text-left">
                  <Step n={1}>
                    Open the <strong>File</strong> menu.
                  </Step>
                  <Step n={2}>
                    Choose <strong>Add to Dock&hellip;</strong>
                  </Step>
                  <Step n={3}>Confirm the name, then click Add.</Step>
                </ol>
              )}

              {platform === 'other' && (
                <p
                  className="mx-auto max-w-[42ch] text-[14.5px] leading-relaxed"
                  style={{ color: 'var(--muted)' }}
                >
                  Not every browser supports installing a site as an app yet. Open this page in
                  Chrome, Edge, or Safari to add OffMap to your device — or just keep using it in
                  the browser. Nothing about OffMap requires installing it.
                </p>
              )}
            </div>
          </div>
        )}
      </Reveal>

      {/* Why — click-to-expand boxes, collapsed by default so the page reads at a glance */}
      <div className="mx-auto mt-14 max-w-3xl">
        <p
          className="font-[family-name:var(--font-archivo)] text-[11px] font-extrabold tracking-[0.14em] uppercase"
          style={{ color: 'var(--muted)' }}
        >
          Why bother
        </p>
        <div className="mt-4 grid gap-3.5 sm:grid-cols-2">
          {WHY.map((box, i) => {
            const open = openWhy === i;
            return (
              <Reveal key={box.title} style={{ transitionDelay: `${i * 50}ms` }}>
                <button
                  type="button"
                  onClick={() => setOpenWhy(open ? null : i)}
                  aria-expanded={open}
                  className="w-full px-5 py-4.5 text-left transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--cobalt)]"
                  style={cardStyle}
                >
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-[family-name:var(--font-fraunces)] text-[17px] font-bold">
                      {box.title}
                    </h3>
                    <span
                      aria-hidden="true"
                      className="shrink-0 text-[15px] font-bold transition-transform"
                      style={{
                        color: 'var(--cobalt)',
                        transform: open ? 'rotate(45deg)' : 'none',
                      }}
                    >
                      +
                    </span>
                  </div>
                  <p
                    className="mt-1.5 text-[13.5px] leading-snug"
                    style={{ color: 'var(--muted)' }}
                  >
                    {box.teaser}
                  </p>
                  {open && (
                    <p
                      className="mt-3 text-[13.5px] leading-relaxed"
                      style={{
                        color: 'var(--ink)',
                        borderTop: '1.5px solid var(--rule)',
                        paddingTop: '12px',
                      }}
                    >
                      {box.detail}
                    </p>
                  )}
                </button>
              </Reveal>
            );
          })}
        </div>
      </div>
    </main>
  );
}

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <span
        className="font-[family-name:var(--font-archivo)] flex h-6 w-6 shrink-0 items-center justify-center text-[12px] font-extrabold"
        style={{
          borderRadius: '9999px',
          border: '1.6px solid var(--ink)',
          background: 'var(--card)',
        }}
      >
        {n}
      </span>
      <span className="pt-0.5 text-[15px] leading-relaxed">{children}</span>
    </li>
  );
}
