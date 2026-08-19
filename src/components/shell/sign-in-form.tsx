'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

import { createClient } from '@/lib/supabase/client';

// Google sign-in stays off until docs/legal/ is confirmed reviewed and live
// (AGENTS.md) — the code path exists but this flag keeps it hidden until then.
const GOOGLE_AUTH_ENABLED = process.env.NEXT_PUBLIC_GOOGLE_AUTH_ENABLED === 'true';

const inputStyle: React.CSSProperties = {
  borderRadius: '10px',
  border: 'var(--border-width) solid var(--ink)',
  background: 'var(--card)',
  color: 'var(--ink)',
};

const oauthButtonStyle: React.CSSProperties = {
  borderRadius: 'var(--radius-card)',
  border: 'var(--border-width) solid var(--ink)',
  background: 'var(--card)',
  color: 'var(--ink)',
};

function MicrosoftIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <rect x="0" y="0" width="7" height="7" fill="var(--cobalt)" />
      <rect x="9" y="0" width="7" height="7" fill="var(--vermilion)" />
      <rect x="0" y="9" width="7" height="7" fill="var(--teal)" />
      <rect x="9" y="9" width="7" height="7" fill="var(--marigold)" />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg width="15" height="17" viewBox="0 0 15 17" fill="var(--ink)" aria-hidden="true">
      <path d="M12.3 8.9c0-2.1 1.7-3.2 1.8-3.2-1-1.4-2.5-1.6-3-1.6-1.3-.1-2.5.8-3.1.8-.6 0-1.6-.7-2.7-.7-1.4 0-2.6.8-3.3 2C.6 8 1.6 11.4 3 13.3c.7 1 1.5 2 2.5 2 1 0 1.4-.6 2.6-.6s1.6.6 2.7.6c1.1 0 1.8-1 2.5-2 .8-1.1 1.1-2.2 1.1-2.3-.1 0-2.1-.8-2.1-3.1ZM9.9 2.7c.6-.7 1-1.7.9-2.7-.9 0-1.9.6-2.5 1.3-.5.6-1 1.6-.9 2.6 1 .1 1.9-.5 2.5-1.2Z" />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 18 18" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.6 9.2c0-.6-.1-1.2-.2-1.8H9v3.5h4.8c-.2 1.1-.9 2.1-1.8 2.7v2.3h3C16.9 14.3 17.6 12 17.6 9.2Z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.4 0 4.5-.8 6-2.2l-3-2.3c-.8.6-1.9.9-3 .9-2.3 0-4.3-1.6-5-3.7H1v2.3C2.4 15.9 5.5 18 9 18Z"
      />
      <path
        fill="#FBBC05"
        d="M4 10.7c-.2-.6-.3-1.1-.3-1.7s.1-1.1.3-1.7V5H1C.4 6.2 0 7.5 0 9s.4 2.8 1 4l3-2.3Z"
      />
      <path
        fill="#EA4335"
        d="M9 3.6c1.3 0 2.5.5 3.4 1.3l2.6-2.6C13.5.8 11.4 0 9 0 5.5 0 2.4 2.1 1 5l3 2.3c.7-2.1 2.7-3.7 5-3.7Z"
      />
    </svg>
  );
}

// One sign-in surface for both staff and students — what an account can do
// afterward is entirely determined by profiles.role (null = ordinary student).
// ?next=/admin lets the admin layout send signed-out staff back where they
// came from instead of always landing on the homepage.
//
// Just the form/card — /sign-in/page.tsx (a Server Component, since
// SiteHeader does a server-only DB read) wraps this in the normal site
// chrome. Elena's call, 20 Aug: this used to be a standalone centered card
// with its own wordmark; it's a page of the site like any other now, not a
// separate auth surface.
export function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const [email, setEmail] = useState(searchParams.get('email') ?? '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // '/' is the marketing/shell landing page (site IA, 17 Aug) — a signed-in
  // student wants the actual listing dashboard, not the hero page.
  const next = searchParams.get('next') || '/browse';
  // Set by /sign-up when a signup attempt matches an already-registered
  // email (see that page's comment on how it detects this via Supabase's
  // empty-identities response) — steers them here instead of leaving them
  // stuck waiting on a confirmation email that was never sent.
  const accountExists = searchParams.get('notice') === 'account-exists';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // OAuth always routes through /callback, which already applies this
    // same check — password sign-in skips straight here, so it needs its
    // own check for a student who confirmed their email but never finished
    // the onboarding walkthrough.
    const { data: profile } = await supabase
      .from('profiles')
      .select('onboarding_completed_at')
      .eq('id', data.user.id)
      .maybeSingle();

    router.push(
      profile && !profile.onboarding_completed_at
        ? `/onboarding?next=${encodeURIComponent(next)}`
        : next,
    );
    router.refresh();
  }

  async function handleOAuth(provider: 'azure' | 'apple' | 'google') {
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/callback?next=${encodeURIComponent(next)}`,
      },
    });

    if (error) setError(error.message);
  }

  return (
    <main
      className="flex flex-col items-center px-6 py-16 md:py-24"
      style={{
        background: 'var(--paper)',
        backgroundImage: 'radial-gradient(var(--rule) 1.4px, transparent 1.4px)',
        backgroundSize: '18px 18px',
      }}
    >
      <div className="w-full max-w-[400px]">
        <div
          className="p-7"
          style={{
            background: 'var(--card)',
            border: 'var(--border-width) solid var(--ink)',
            borderRadius: 'var(--radius-panel)',
            boxShadow: 'var(--shadow-offset)',
          }}
        >
          <h1 className="font-[family-name:var(--font-fraunces)] text-[1.7rem] font-extrabold">
            Sign in
          </h1>
          <p className="mt-1.5 text-[13px] leading-relaxed" style={{ color: 'var(--muted)' }}>
            Guest-first, always — signing in only syncs your saved opportunities across devices.
            Don&apos;t have an account?{' '}
            <Link href="/sign-up" className="font-bold underline" style={{ color: 'var(--ink)' }}>
              Sign up
            </Link>
            .
          </p>

          {accountExists && (
            <p
              className="mt-4 px-3 py-2.5 text-[13px] font-semibold"
              style={{
                background: 'rgba(15,179,161,0.12)',
                border: 'var(--border-width) solid var(--teal)',
                borderRadius: '8px',
                color: 'var(--ink)',
              }}
            >
              You already have an account with that email — sign in below.
            </p>
          )}

          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
            <div>
              <label
                htmlFor="email"
                className="font-[family-name:var(--font-archivo)] block text-[11px] font-extrabold tracking-[0.08em] uppercase"
                style={{ color: 'var(--muted)' }}
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1.5 w-full px-3.5 py-2.5 text-[14px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--cobalt)]"
                style={inputStyle}
              />
            </div>

            <div>
              <div className="flex items-baseline justify-between">
                <label
                  htmlFor="password"
                  className="font-[family-name:var(--font-archivo)] block text-[11px] font-extrabold tracking-[0.08em] uppercase"
                  style={{ color: 'var(--muted)' }}
                >
                  Password
                </label>
                <Link
                  href={
                    email
                      ? `/forgot-password?email=${encodeURIComponent(email)}`
                      : '/forgot-password'
                  }
                  className="font-[family-name:var(--font-archivo)] text-[12px] font-bold underline"
                  style={{ color: 'var(--cobalt)' }}
                >
                  Forgot password?
                </Link>
              </div>
              <input
                id="password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1.5 w-full px-3.5 py-2.5 text-[14px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--cobalt)]"
                style={inputStyle}
              />
            </div>

            {error && (
              <p
                className="px-3 py-2.5 text-[13px] font-semibold"
                style={{
                  background: 'var(--paper)',
                  border: 'var(--border-width) solid var(--ink)',
                  borderRadius: '8px',
                  color: 'var(--ink)',
                }}
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="font-[family-name:var(--font-archivo)] mt-1 px-4 py-3 text-[13px] font-extrabold tracking-[0.05em] uppercase transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--cobalt)] disabled:opacity-60 disabled:hover:translate-x-0 disabled:hover:translate-y-0"
              style={{
                borderRadius: 'var(--radius-pill)',
                border: 'var(--border-width) solid var(--ink)',
                background: 'var(--ink)',
                color: 'var(--card)',
                boxShadow: 'var(--shadow-offset-paper-sm)',
              }}
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <div className="mt-6 flex items-center gap-3" aria-hidden="true">
            <span className="h-px flex-1" style={{ background: 'var(--rule)' }} />
            <span
              className="font-[family-name:var(--font-archivo)] text-[10px] font-bold tracking-[0.1em] uppercase"
              style={{ color: 'var(--muted)' }}
            >
              Or
            </span>
            <span className="h-px flex-1" style={{ background: 'var(--rule)' }} />
          </div>

          <div className="mt-4 flex flex-col gap-2.5">
            <button
              type="button"
              onClick={() => handleOAuth('azure')}
              className="font-[family-name:var(--font-archivo)] flex items-center justify-center gap-2.5 px-4 py-2.5 text-[13px] font-bold transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--cobalt)]"
              style={oauthButtonStyle}
            >
              <MicrosoftIcon />
              Continue with Microsoft
            </button>
            <button
              type="button"
              onClick={() => handleOAuth('apple')}
              className="font-[family-name:var(--font-archivo)] flex items-center justify-center gap-2.5 px-4 py-2.5 text-[13px] font-bold transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--cobalt)]"
              style={oauthButtonStyle}
            >
              <AppleIcon />
              Continue with Apple
            </button>
            {GOOGLE_AUTH_ENABLED && (
              <button
                type="button"
                onClick={() => handleOAuth('google')}
                className="font-[family-name:var(--font-archivo)] flex items-center justify-center gap-2.5 px-4 py-2.5 text-[13px] font-bold transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--cobalt)]"
                style={oauthButtonStyle}
              >
                <GoogleIcon />
                Continue with Google
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
