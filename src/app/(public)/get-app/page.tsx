'use client';

import { useEffect, useState } from 'react';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

const buttonStyle: React.CSSProperties = {
  borderRadius: 'var(--radius-pill)',
  border: 'var(--border-width) solid var(--ink)',
  background: 'var(--ink)',
  color: 'var(--card)',
  boxShadow: 'var(--shadow-offset-paper-sm)',
};

export default function GetAppPage() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setInstallEvent(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', onPrompt);

    const onInstalled = () => setInstalled(true);
    window.addEventListener('appinstalled', onInstalled);

    if (window.matchMedia('(display-mode: standalone)').matches) setInstalled(true);
    setIsIOS(/iphone|ipad|ipod/i.test(window.navigator.userAgent));

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
    <main className="mx-auto max-w-xl px-6 py-14 text-center">
      <h1 className="font-[family-name:var(--font-fraunces)] text-4xl font-extrabold">
        Get OffMap on your device
      </h1>
      <p className="mt-3 text-[15px]" style={{ color: 'var(--muted)' }}>
        Installs like an app — no store, no download size, still guest-first and free for students.
      </p>

      {installed && (
        <p className="mt-8 text-[14px] font-bold" style={{ color: 'var(--ink)' }}>
          Already installed on this device.
        </p>
      )}

      {!installed && installEvent && (
        <button
          type="button"
          onClick={handleInstall}
          className="font-[family-name:var(--font-archivo)] mt-8 px-6 py-3 text-[13px] font-extrabold tracking-[0.05em] uppercase transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5"
          style={buttonStyle}
        >
          Install OffMap
        </button>
      )}

      {!installed && !installEvent && isIOS && (
        <div
          className="mt-8 px-5 py-4 text-left text-[13px] leading-relaxed"
          style={{
            background: 'var(--card)',
            border: 'var(--border-width) solid var(--ink)',
            borderRadius: 'var(--radius-panel)',
            color: 'var(--ink)',
          }}
        >
          <p className="font-bold uppercase tracking-[0.05em]">On iPhone or iPad</p>
          <p className="mt-1.5">
            Tap the Share icon in Safari, then <strong>Add to Home Screen</strong>.
          </p>
        </div>
      )}

      {!installed && !installEvent && !isIOS && (
        <p className="mt-8 text-[13px]" style={{ color: 'var(--muted)' }}>
          Open this page in Chrome, Edge, or another installable browser to add OffMap to your device.
        </p>
      )}
    </main>
  );
}
