'use client';

import { useState } from 'react';

import { createClient } from '@/lib/supabase/client';

// Email/password signup only. Account creation itself happens in
// /callback after the email is confirmed — this just starts that flow and
// carries age confirmation along as auth metadata for the callback to use.
export default function SignUpPage() {
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/callback`,
        data: { age_confirmed_16_plus: ageConfirmed },
      },
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    setSent(true);
  }

  if (sent) {
    return (
      <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-6">
        <h1 className="font-[family-name:var(--font-fraunces)] text-2xl font-extrabold">
          Check your email
        </h1>
        <p className="mt-2 text-[color:var(--muted)]">
          We sent a confirmation link to {email}. Follow it to finish creating your account.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-6">
      <h1 className="font-[family-name:var(--font-fraunces)] text-2xl font-extrabold">
        Create an account
      </h1>
      <p className="mt-2 text-sm text-[color:var(--muted)]">
        Optional — you can keep saving opportunities without one. An account just syncs your saves
        across devices.
      </p>

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
            className="mt-1 w-full rounded-[3px] border-2 border-[color:var(--ink)] bg-[color:var(--card)] px-3 py-2"
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
            minLength={8}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-[3px] border-2 border-[color:var(--ink)] bg-[color:var(--card)] px-3 py-2"
          />
        </div>

        <label className="flex items-start gap-2 text-sm">
          <input
            type="checkbox"
            required
            checked={ageConfirmed}
            onChange={(e) => setAgeConfirmed(e.target.checked)}
            className="mt-1"
          />
          I confirm I am 16 years old or older.
        </label>

        {error && <p className="text-sm text-[color:var(--vermilion)]">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-[3px] border-2 border-[color:var(--ink)] bg-[color:var(--ink)] px-4 py-2 font-medium text-[color:var(--paper)] disabled:opacity-50"
        >
          {loading ? 'Creating…' : 'Create account'}
        </button>
      </form>
    </main>
  );
}
