'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { createClient } from '@/lib/supabase/client';

const inputStyle: React.CSSProperties = {
  borderRadius: '10px',
  border: 'var(--border-width) solid var(--ink)',
  background: 'var(--card)',
  color: 'var(--ink)',
};

// Only reachable with a valid recovery session — /callback exchanges the
// emailed link's code for a session before ever redirecting here (see its
// `next` handling). No session means the link was missing, expired, or
// already used, not that this page can recover it.
export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = createClient();
  const [checkingSession, setCheckingSession] = useState(true);
  const [hasSession, setHasSession] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setHasSession(Boolean(session));
      setCheckingSession(false);
    });
  }, [supabase]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.updateUser({ password });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    setDone(true);
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
          {checkingSession ? (
            <p className="text-[13px]" style={{ color: 'var(--muted)' }}>
              Checking your link…
            </p>
          ) : done ? (
            <>
              <h1 className="font-[family-name:var(--font-fraunces)] text-[1.7rem] font-extrabold">
                Password updated
              </h1>
              <p className="mt-2 text-[13px] leading-relaxed" style={{ color: 'var(--muted)' }}>
                Signed in with your new password.
              </p>
              <button
                type="button"
                onClick={() => {
                  router.push('/browse');
                  router.refresh();
                }}
                className="font-[family-name:var(--font-archivo)] mt-5 w-full px-4 py-3 text-[13px] font-extrabold tracking-[0.05em] uppercase"
                style={{
                  borderRadius: 'var(--radius-pill)',
                  border: 'var(--border-width) solid var(--ink)',
                  background: 'var(--ink)',
                  color: 'var(--card)',
                  boxShadow: 'var(--shadow-offset-paper-sm)',
                }}
              >
                Continue
              </button>
            </>
          ) : !hasSession ? (
            <>
              <h1 className="font-[family-name:var(--font-fraunces)] text-[1.7rem] font-extrabold">
                Link expired
              </h1>
              <p className="mt-2 text-[13px] leading-relaxed" style={{ color: 'var(--muted)' }}>
                This reset link is invalid or already used. Request a new one.
              </p>
              <Link
                href="/forgot-password"
                className="font-[family-name:var(--font-archivo)] mt-5 block w-full px-4 py-3 text-center text-[13px] font-extrabold tracking-[0.05em] uppercase"
                style={{
                  borderRadius: 'var(--radius-pill)',
                  border: 'var(--border-width) solid var(--ink)',
                  background: 'var(--ink)',
                  color: 'var(--card)',
                }}
              >
                Request new link
              </Link>
            </>
          ) : (
            <>
              <h1 className="font-[family-name:var(--font-fraunces)] text-[1.7rem] font-extrabold">
                Set a new password
              </h1>

              <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
                <div>
                  <label
                    htmlFor="password"
                    className="font-[family-name:var(--font-archivo)] block text-[11px] font-extrabold tracking-[0.08em] uppercase"
                    style={{ color: 'var(--muted)' }}
                  >
                    New password
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
                  {loading ? 'Saving…' : 'Save password'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
