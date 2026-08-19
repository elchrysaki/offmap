'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

import { createClient } from '@/lib/supabase/client';

const inputStyle: React.CSSProperties = {
  borderRadius: '10px',
  border: 'var(--border-width) solid var(--ink)',
  background: 'var(--card)',
  color: 'var(--ink)',
};

// Recovery link lands on /callback (same PKCE code-exchange as sign-in and
// email confirmation) and is forwarded to /reset-password once a session
// exists. Always shows the same "check your email" outcome regardless of
// whether the address has an account — same anti-enumeration reasoning as
// the signup flow, just the opposite direction (don't reveal absence here).
function ForgotPasswordForm() {
  const searchParams = useSearchParams();
  const supabase = createClient();
  const [email, setEmail] = useState(searchParams.get('email') ?? '');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/callback?next=/reset-password`,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    setSent(true);
  }

  return (
    <main
      className="flex min-h-screen items-center justify-center px-6 py-16"
      style={{
        background: 'var(--paper)',
        backgroundImage: 'radial-gradient(var(--rule) 1.4px, transparent 1.4px)',
        backgroundSize: '18px 18px',
      }}
    >
      <div className="w-full max-w-[400px]">
        <Link
          href="/"
          className="font-[family-name:var(--font-bungee)] inline-block text-lg tracking-tight uppercase"
          style={{ color: 'var(--ink)' }}
        >
          OffMap
        </Link>

        <div
          className="mt-6 p-7"
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
                If {email} has an OffMap account, we sent a link to reset the password. Follow it to
                choose a new one.
              </p>
            </>
          ) : (
            <>
              <h1 className="font-[family-name:var(--font-fraunces)] text-[1.7rem] font-extrabold">
                Reset password
              </h1>
              <p className="mt-1.5 text-[13px] leading-relaxed" style={{ color: 'var(--muted)' }}>
                Enter your email and we&apos;ll send a link to set a new password.
              </p>

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
                  {loading ? 'Sending…' : 'Send reset link'}
                </button>
              </form>
            </>
          )}
        </div>

        <p className="mt-5 text-center text-[13px]" style={{ color: 'var(--muted)' }}>
          <Link href="/sign-in" className="font-bold underline" style={{ color: 'var(--ink)' }}>
            Back to sign in
          </Link>
        </p>
      </div>
    </main>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense>
      <ForgotPasswordForm />
    </Suspense>
  );
}
