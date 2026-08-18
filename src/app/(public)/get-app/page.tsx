// PWA install isn't wired up yet (CLAUDE.md §12 build order step 11, not
// started — no manifest.json / service worker in the repo). Saying so
// rather than showing an install button that silently does nothing.
export default function GetAppPage() {
  return (
    <main className="mx-auto max-w-xl px-6 py-14 text-center">
      <h1 className="font-[family-name:var(--font-fraunces)] text-4xl font-extrabold">
        Get OffMap on your device
      </h1>
      <p className="mt-3 text-[15px]" style={{ color: 'var(--muted)' }}>
        Installable app support isn&apos;t live yet — OffMap works in any browser today. Placeholder for
        install instructions (Add to Home Screen) once the PWA build lands.
      </p>
    </main>
  );
}
