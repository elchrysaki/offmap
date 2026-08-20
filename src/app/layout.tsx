import type { Metadata, Viewport } from 'next';
import { Archivo, Bungee, Fraunces } from 'next/font/google';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from '@vercel/analytics/next';

import { AuthSaveSync } from '@/components/core/auth-save-sync';
import { ServiceWorkerRegister } from '@/components/core/service-worker-register';

import './globals.css';

// Display and countdown numerals. Variable, SOFT 70 / WONK 1, weight 800–900 — see CLAUDE.md §7.
const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  axes: ['SOFT', 'WONK'],
  display: 'swap',
});

// Body, UI, buttons, forms.
const archivo = Archivo({
  subsets: ['latin'],
  variable: '--font-archivo',
  display: 'swap',
});

// Stamps and stickers only. Loads last (CLAUDE.md §7).
const bungee = Bungee({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-bungee',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'OffMap',
  description:
    'The opportunities students actually get into — including the ones that never make it online.',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'OffMap',
  },
};

export const viewport: Viewport = {
  themeColor: '#141210',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${archivo.variable} ${bungee.variable}`}>
      <body>
        <AuthSaveSync />
        <ServiceWorkerRegister />
        {children}
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
