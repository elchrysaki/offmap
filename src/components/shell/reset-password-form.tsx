'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import type { EmailOtpType } from '@supabase/supabase-js';

import { createClient } from '@/lib/supabase/client';

const inputStyle: React.CSSProperties = {
  borderRadius: '10px',
  border: 'var(--border-width) solid var(--ink)',
  background: 'var(--card)',
  color: 'var(--ink)',
};

// The emailed link points here with ?token_hash=...&type=recovery (see
// docs/legal — no, see the Reset Password template in the Supabase
// dashboard: Authentication > Email Templates > Reset Password, link href
// changed from {{ .ConfirmationURL }} to
// {{ .SiteURL }}/reset-password?token_hash={{ .TokenHash }}&type=recovery).
// This isn't cosmetic — Supabase's default {{ .ConfirmationURL }} points at
// their own hosted /verify endpoint, which consumes the one-time token on
// the first GET it receives. Email clients and corporate link-scanners
// routinely prefetch links to check them for safety before a human ever
// clicks, silently burning the token — the real click then hits an
// already-used link and fails with no useful error. Verifying the token
// ourselves, client-side, on a page a scanner's plain HTTP fetch won't
// execute JS on, is Supabase's own documented fix for this. Old links
// without these params still fall back to checking for a session
// established via /callback's code-exchange, so this isn't a breaking
// change for anyone with a link already in their inbox.
function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const [checkingSession, setCheckingSession] = useState(true);
  const [hasSession, setHasSession] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const tokenHash = searchParams.get('token_hash');
    const type = searchParams.get('type');

    if (tokenHash && type) {
      supabase.auth
        .verifyOtp({ token_hash: tokenHash, type: type as EmailOtpType })
        .then(({ error }) => {
          setHasSession(!error);
          setCheckingSession(false);
        });
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setHasSession(Boolean(session));
      setCheckingSession(false);
    });
  }, [supabase, searchParams]);

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

export { ResetPasswordForm };
