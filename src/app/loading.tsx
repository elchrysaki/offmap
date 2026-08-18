import KineticTextGrid from '@/components/shell/kinetic-text-grid';

// App-wide loading/welcome screen (CLAUDE.md §15, 17 Aug site-IA
// expansion) — Next's Suspense fallback during server-rendered navigation.
// Kinetic wordmark grid; falls back to a static wordmark under
// prefers-reduced-motion (handled inside KineticTextGrid).
export default function Loading() {
  return (
    <div role="status" aria-label="Loading OffMap" style={{ height: '100vh' }}>
      <KineticTextGrid text="OFFMAP" />
    </div>
  );
}
