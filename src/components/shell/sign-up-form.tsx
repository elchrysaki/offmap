'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { createClient } from '@/lib/supabase/client';
import { STATUS_OPTIONS } from '@/lib/profile-labels';

const inputStyle: React.CSSProperties = {
  borderRadius: '10px',
  border: 'var(--border-width) solid var(--ink)',
  background: 'var(--card)',
  color: 'var(--ink)',
};

// Email/password signup only. Account creation itself happens in
// /callback after the email is confirmed — this just starts that flow and
// carries every field along as auth metadata for the callback to read, the
// same pattern the existing age_confirmed_16_plus flag already used. The
// callback route is the only place a profiles row actually gets written.
//
// Just the form/card — /sign-up/page.tsx (a Server Component, since
// SiteHeader does a server-only DB read) wraps this in the normal site
// chrome, same split as SignInForm. Restyled 20 Aug (Elena's call) to
// match the sign-in card instead of the older plainer layout.
export function SignUpForm() {
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

  return (
    <main
      className="flex flex-col items-center px-6 py-16 md:py-24"
      style={{
        background: 'var(--paper)',
        backgroundImage: 'radial-gradient(var(--rule) 1.4px, transparent 1.4px)',
        backgroundSize: '18px 18px',
      }}
    >
      <div className="w-full max-w-[420px]">
        <div
          className="p-7"
          style={{
            background: 'var(--card)',
            border: 'var(--border-width) solid var(--ink)',
            borderRadius: 'var(--radius-panel)',
            boxShadow: 'var(--shadow-offset)',
          }}
        >
          {sent ? (
            <>
              <h1 className="font-[family-name:var(--font-fraunces)] text-[1.7rem] font-extrabold">
                Check your email
              </h1>
              <p className="mt-2 text-[13px] leading-relaxed" style={{ color: 'var(--muted)' }}>
                We sent a confirmation link to {email}. Follow it to finish creating your account —
                then we&apos;ll ask a couple of quick questions to personalise what you see.
              </p>
            </>
          ) : (
            <>
              <h1 className="font-[family-name:var(--font-fraunces)] text-[1.7rem] font-extrabold">
                Create an account
              </h1>
              <p className="mt-1.5 text-[13px] leading-relaxed" style={{ color: 'var(--muted)' }}>
                Optional — saving works fine without one. An account syncs your saves across devices
                and lets us personalise what you see. Already have one?{' '}
                <Link
                  href="/sign-in"
                  className="font-bold underline"
                  style={{ color: 'var(--ink)' }}
                >
                  Sign in
                </Link>
                .
              </p>

              <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label
                      htmlFor="first_name"
                      className="font-[family-name:var(--font-archivo)] block text-[11px] font-extrabold tracking-[0.08em] uppercase"
                      style={{ color: 'var(--muted)' }}
                    >
                      First name
                    </label>
                    <input
                      id="first_name"
                      type="text"
                      required
                      autoComplete="given-name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="mt-1.5 w-full px-3.5 py-2.5 text-[14px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--cobalt)]"
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="last_name"
                      className="font-[family-name:var(--font-archivo)] block text-[11px] font-extrabold tracking-[0.08em] uppercase"
                      style={{ color: 'var(--muted)' }}
                    >
                      Last name
                    </label>
                    <input
                      id="last_name"
                      type="text"
                      required
                      autoComplete="family-name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="mt-1.5 w-full px-3.5 py-2.5 text-[14px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--cobalt)]"
                      style={inputStyle}
                    />
                  </div>
                </div>

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
                  <label
                    htmlFor="password"
                    className="font-[family-name:var(--font-archivo)] block text-[11px] font-extrabold tracking-[0.08em] uppercase"
                    style={{ color: 'var(--muted)' }}
                  >
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
                    className="mt-1.5 w-full px-3.5 py-2.5 text-[14px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--cobalt)]"
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label
                    htmlFor="status"
                    className="font-[family-name:var(--font-archivo)] block text-[11px] font-extrabold tracking-[0.08em] uppercase"
                    style={{ color: 'var(--muted)' }}
                  >
                    You are a
                  </label>
                  <select
                    id="status"
                    required
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="mt-1.5 w-full px-3.5 py-2.5 text-[14px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--cobalt)]"
                    style={inputStyle}
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
                  <label
                    htmlFor="country"
                    className="font-[family-name:var(--font-archivo)] block text-[11px] font-extrabold tracking-[0.08em] uppercase"
                    style={{ color: 'var(--muted)' }}
                  >
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
                    className="mt-1.5 w-full px-3.5 py-2.5 text-[14px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--cobalt)]"
                    style={inputStyle}
                  />
                </div>

                <label className="flex items-start gap-2 text-[13px]">
                  <input
                    type="checkbox"
                    required
                    checked={ageConfirmed}
                    onChange={(e) => setAgeConfirmed(e.target.checked)}
                    className="mt-0.5"
                  />
                  I confirm I am 16 years old or older.
                </label>

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
                  {loading ? 'Creating…' : 'Create account'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
