'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

import { createClient } from '@/lib/supabase/client';

// Google sign-in stays off until docs/legal/ is confirmed reviewed and live
// (AGENTS.md) — the code path exists but this flag keeps it hidden until then.
const GOOGLE_AUTH_ENABLED = process.env.NEXT_PUBLIC_GOOGLE_AUTH_ENABLED === 'true';

const inputClasses =
  'mt-1 w-full rounded-[3px] border-2 border-[color:var(--ink)] bg-[color:var(--card)] px-3 py-2';
const oauthButtonClasses =
  'w-full rounded-[3px] border-2 border-[color:var(--ink)] bg-[color:var(--card)] px-4 py-2 font-medium disabled:opacity-50';

// One sign-in surface for both staff and students — what an account can do
// afterward is entirely determined by profiles.role (null = ordinary student).
// ?next=/admin lets the admin layout send signed-out staff back where they
// came from instead of always landing on the homepage.
function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // '/' is the marketing/shell landing page (site IA, 17 Aug) — a signed-in
  // student wants the actual listing dashboard, not the hero page.
  const next = searchParams.get('next') || '/browse';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push(next);
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
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-6">
      <h1 className="font-[family-name:var(--font-fraunces)] text-2xl font-extrabold">
        Sign in
      </h1>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClasses}
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClasses}
          />
        </div>

        {error && <p className="text-sm text-[color:var(--vermilion)]">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-[3px] border-2 border-[color:var(--ink)] bg-[color:var(--ink)] px-4 py-2 font-medium text-[color:var(--paper)] disabled:opacity-50"
        >
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <div className="mt-6 space-y-2">
        <button type="button" onClick={() => handleOAuth('azure')} className={oauthButtonClasses}>
          Continue with Microsoft
        </button>
        <button type="button" onClick={() => handleOAuth('apple')} className={oauthButtonClasses}>
          Continue with Apple
        </button>
        {GOOGLE_AUTH_ENABLED && (
          <button
            type="button"
            onClick={() => handleOAuth('google')}
            className={oauthButtonClasses}
          >
            Continue with Google
          </button>
        )}
      </div>

      <p className="mt-6 text-sm text-[color:var(--muted)]">
        No account?{' '}
        <Link href="/sign-up" className="underline">
          Create one
        </Link>{' '}
        — or skip it, saving works fine without one.
      </p>
    </main>
  );
}

export default function SignInPage() {
  return (
    <Suspense>
      <SignInForm />
    </Suspense>
  );
}
