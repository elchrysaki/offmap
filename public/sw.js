// OffMap service worker — installability + a minimal app shell cache.
// Deliberately not caching listing data or any Supabase response: an
// expired listing served from a stale cache would violate CLAUDE.md §2/§6
// (never publish an inference, never serve a stale gate-checked fact).
// This only makes the static shell load instantly and work offline;
// everything data-backed still always goes to the network.

const CACHE_VERSION = 'offmap-shell-v1';
const APP_SHELL = ['/', '/manifest.webmanifest', '/icons/icon-192.png', '/icons/icon-512.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_VERSION)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_VERSION).map((key) => caches.delete(key))),
      )
      .then(() => self.clients.claim()),
  );
});

// Network-first for navigations (so listings/deadlines are always fresh),
// falling back to the cached shell only when there's no connection at all.
self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  const isNavigation = request.mode === 'navigate';
  const isStaticAsset =
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/icons/') ||
    url.pathname === '/manifest.webmanifest';

  if (isNavigation) {
    event.respondWith(
      fetch(request).catch(() =>
        caches.match(request).then((cached) => cached ?? caches.match('/')),
      ),
    );
    return;
  }

  if (isStaticAsset) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ??
          fetch(request).then((response) => {
            const copy = response.clone();
            caches.open(CACHE_VERSION).then((cache) => cache.put(request, copy));
            return response;
          }),
      ),
    );
  }
});
