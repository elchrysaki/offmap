'use client';

import { useEffect, useState } from 'react';

import Globe from './globe';

// Athens is the hub — Elena's own founding city — everything else is a
// spoke. This is a real map of where ambassadors/contributors are, not a
// coverage claim; it draws the network the "network" section talks about.
const ATHENS = { lat: 37.98, lng: 23.73 };
const CITIES = [
  ATHENS, // Athens
  { lat: 40.64, lng: 22.94 }, // Thessaloniki
  { lat: 50.78, lng: 6.08 }, // Aachen
  { lat: 44.49, lng: 11.34 }, // Bologna
  { lat: 40.85, lng: 14.27 }, // Napoli
  { lat: 41.01, lng: 28.98 }, // Istanbul
  { lat: 6.93, lng: 79.85 }, // Colombo
  { lat: 7.49, lng: 80.36 }, // Kurunegala
  { lat: 26.85, lng: 80.95 }, // Lucknow
  { lat: 38.25, lng: 21.73 }, // Patras
];

// Vermilion is reserved for deadline urgency only (CLAUDE.md §7) — cobalt
// stands in here instead, arcs aren't a status colour.
const ARC_COLOR = '#2B57E0';
const ARCS = CITIES.filter((c) => c !== ATHENS).map((city) => ({
  from: ATHENS,
  to: city,
  color: ARC_COLOR,
  width: 1.1,
  elevate: 0.28,
}));

// Hoisted to module scope, not inline in JSX — an inline object literal
// there would get a new identity every render, and Globe's setup effect
// depends on this reference (would rebuild the whole scene each time).
const DOTS = { color: '#8A7F6B', size: 3.5, density: 5, allDots: false };
const MARKER_CONFIG = { markers: CITIES, color: '#FFC01E', size: 55 };

// Bottom-right accent for the "network" section — bigger, anchored low
// (no cards left to share the space with, per the reference), and left
// interactive — drag to rotate. Desktop only via CSS (`hidden md:block`,
// no JS gating, so it's never a tick behind). Rotation stops under
// prefers-reduced-motion; the globe still renders, just static.
export function NetworkGlobe() {
  const [speed, setSpeed] = useState(1);

  useEffect(() => {
    try {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) setSpeed(0);
    } catch {
      // motion preference check is best-effort only
    }
  }, []);

  return (
    <div
      aria-hidden="true"
      className="absolute -right-28 -bottom-28 hidden h-[560px] w-[560px] lg:block"
    >
      <Globe
        speed={speed}
        scale={9.5}
        // stopOnHover was raycasting the ocean sphere on every mousemove —
        // the actual source of the reported lag, not the rotation itself.
        // This is a decorative background element; it doesn't need hover
        // detection.
        stopOnHover={false}
        dots={DOTS}
        markerConfig={MARKER_CONFIG}
        arcs={ARCS}
      />
    </div>
  );
}
