'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { createClient } from '@/lib/supabase/client';
import { STATUS_OPTIONS } from '@/lib/profile-labels';

// Email/password signup only. Account creation itself happens in
// /callback after the email is confirmed — this just starts that flow and
// carries every field along as auth metadata for the callback to read, the
// same pattern the existing age_confirmed_16_plus flag already used. The
// callback route is the only place a profiles row actually gets written.
export default function SignUpPage() {
  const router = useRouter();
  const supabase = createClient();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('');
  const [country, setCountry] = useState('');
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/callback`,
        data: {
          age_confirmed_16_plus: ageConfirmed,
          first_name: firstName,
          last_name: lastName,
          status,
          country,
        },
      },
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    // Supabase's documented way to detect "this email already has an
    // account" without leaking that fact via a distinguishable error (which
    // would let an attacker enumerate registered emails): a genuinely new
    // signup returns a user with one identity; signUp'ing an email that's
    // already registered returns a user with an empty identities array and
    // no error at all — it deliberately looks identical to success
    // otherwise, including sending no new confirmation email.
    if (data.user && data.user.identities?.length === 0) {
      router.push(`/sign-in?next=/browse&notice=account-exists&email=${encodeURIComponent(email)}`);
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
          We sent a confirmation link to {email}. Follow it to finish creating your account — then
          we&apos;ll ask a couple of quick questions to personalise what you see.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-6 py-12">
      <h1 className="font-[family-name:var(--font-fraunces)] text-2xl font-extrabold">
        Create an account
      </h1>
      <p className="mt-2 text-sm text-[color:var(--muted)]">
        Optional — you can keep saving opportunities without one. An account syncs your saves across
        devices and lets us personalise what you see.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="first_name" className="block text-sm font-medium">
              First name
            </label>
            <input
              id="first_name"
              type="text"
              required
              autoComplete="given-name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="mt-1 w-full rounded-[3px] border-2 border-[color:var(--ink)] bg-[color:var(--card)] px-3 py-2"
            />
          </div>
          <div>
            <label htmlFor="last_name" className="block text-sm font-medium">
              Last name
            </label>
            <input
              id="last_name"
              type="text"
              required
              autoComplete="family-name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="mt-1 w-full rounded-[3px] border-2 border-[color:var(--ink)] bg-[color:var(--card)] px-3 py-2"
            />
          </div>
        </div>

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

        <div>
          <label htmlFor="status" className="block text-sm font-medium">
            You are a
          </label>
          <select
            id="status"
            required
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="mt-1 w-full rounded-[3px] border-2 border-[color:var(--ink)] bg-[color:var(--card)] px-3 py-2"
          >
            <option value="" disabled>
              Choose one…
            </option>
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="country" className="block text-sm font-medium">
            Country of residence
          </label>
          <input
            id="country"
            type="text"
            required
            autoComplete="country-name"
            placeholder="e.g. Greece"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
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
