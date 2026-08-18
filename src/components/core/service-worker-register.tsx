'use client';

import { useEffect } from 'react';

// Registers the app-shell service worker for installability (CLAUDE.md §12
// step 12). Skipped in dev — Turbopack's own HMR/caching conflicts with a
// service worker intercepting fetches, so this only runs in a production
// build. Mounted once in the root layout, renders nothing.
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return;
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Installability is a progressive enhancement — a failed registration
      // shouldn't be user-visible or block anything.
    });
  }, []);

  return null;
}
