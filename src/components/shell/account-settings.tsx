'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { createClient } from '@/lib/supabase/client';

const inputStyle: React.CSSProperties = {
  borderRadius: '10px',
  border: 'var(--border-width) solid var(--ink)',
  background: 'var(--paper)',
  color: 'var(--ink)',
};

const buttonStyle: React.CSSProperties = {
  borderRadius: 'var(--radius-pill)',
  border: 'var(--border-width) solid var(--ink)',
  background: 'var(--ink)',
  color: 'var(--card)',
};

// Change email: supabase.auth.updateUser({ email }) sends a confirmation
// link to the new address (Auth > Email Templates > Change Email Address —
// {{ .NewEmail }} is only available in that one template). It lands back
// on /callback with ?type=email_change, which that route already handles
// generically alongside signup/recovery — no route changes needed here.
//
// Change password: deliberately does NOT put a "new password" field on
// this page. It re-triggers the exact same resetPasswordForEmail email
// /forgot-password sends (Elena's call, 20 Aug) — a signed-in session
// being able to silently set a new password with no email step at all
// would mean anyone who hijacks a session for a minute can lock the real
// owner out permanently. Requiring the email hop here is the same
// protection /forgot-password already has, just reachable from account
// settings too instead of only from the signed-out sign-in page.
export function AccountSettings({
  email,
  firstName,
  lastName,
  emailJustChanged,
}: {
  email: string;
  firstName: string;
  lastName: string;
  emailJustChanged: boolean;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [signingOut, setSigningOut] = useState(false);

  const [nameFirst, setNameFirst] = useState(firstName);
  const [nameLast, setNameLast] = useState(lastName);
  const [namePending, setNamePending] = useState(false);
  const [nameSaved, setNameSaved] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);

  const [newEmail, setNewEmail] = useState('');
  const [emailPending, setEmailPending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);

  const [passwordPending, setPasswordPending] = useState(false);
  const [passwordSent, setPasswordSent] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Writes straight to `profiles` via the browser client — the "update own
  // profile" RLS policy (auth.uid() = id) already allows this, same
  // accepted-exception pattern as SaveButton/OnboardingFlow (CLAUDE.md §4).
  async function handleChangeName(e: React.FormEvent) {
    e.preventDefault();
    setNamePending(true);
    setNameError(null);
    setNameSaved(false);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setNamePending(false);
      setNameError('Your session expired — sign in again.');
      return;
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        first_name: nameFirst.trim() || null,
        last_name: nameLast.trim() || null,
      })
      .eq('id', user.id);

    setNamePending(false);

    if (error) {
      setNameError(error.message);
      return;
    }

    setNameSaved(true);
    router.refresh();
  }

  async function handleChangeEmail(e: React.FormEvent) {
    e.preventDefault();
    setEmailPending(true);
    setEmailError(null);

    const { error } = await supabase.auth.updateUser(
      { email: newEmail },
      {
        emailRedirectTo: `${window.location.origin}/callback?next=${encodeURIComponent('/profile?email_changed=1')}`,
      },
    );

    setEmailPending(false);

    if (error) {
      setEmailError(error.message);
      return;
    }

    setEmailSent(true);
  }

  async function handleChangePassword() {
    setPasswordPending(true);
    setPasswordError(null);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/callback?next=${encodeURIComponent('/reset-password')}`,
    });

    setPasswordPending(false);

    if (error) {
      setPasswordError(error.message);
      return;
    }

    setPasswordSent(true);
  }

  async function handleSignOut() {
    setSigningOut(true);
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  }

  return (
    <div
      className="mt-8 flex flex-col gap-6 p-6"
      style={{
        background: 'var(--card)',
        border: 'var(--border-width) solid var(--ink)',
        borderRadius: 'var(--radius-card)',
      }}
    >
      <p
        className="font-[family-name:var(--font-archivo)] text-[11px] font-extrabold tracking-[0.13em] uppercase"
        style={{ color: 'var(--muted)' }}
      >
        Account
      </p>

      {emailJustChanged && (
        <p
          className="px-3 py-2.5 text-[13px] font-semibold"
          style={{
            background: 'rgba(15,179,161,0.12)',
            border: 'var(--border-width) solid var(--teal)',
            borderRadius: '8px',
            color: 'var(--ink)',
          }}
        >
          Email updated.
        </p>
      )}

      <div>
        <p
          className="text-[11px] font-bold tracking-[0.06em] uppercase"
          style={{ color: 'var(--muted)' }}
        >
          Name
        </p>
        <form onSubmit={handleChangeName} className="mt-2.5 flex flex-wrap items-start gap-2">
          <input
            type="text"
            placeholder="First name"
            value={nameFirst}
            onChange={(e) => setNameFirst(e.target.value)}
            className="min-w-0 flex-1 px-3 py-2 text-[14px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--cobalt)]"
            style={inputStyle}
          />
          <input
            type="text"
            placeholder="Last name"
            value={nameLast}
            onChange={(e) => setNameLast(e.target.value)}
            className="min-w-0 flex-1 px-3 py-2 text-[14px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--cobalt)]"
            style={inputStyle}
          />
          <button
            type="submit"
            disabled={namePending}
            className="font-[family-name:var(--font-archivo)] px-4 py-2 text-[12px] font-extrabold tracking-[0.05em] uppercase disabled:opacity-60"
            style={buttonStyle}
          >
            {namePending ? 'Saving…' : 'Save'}
          </button>
        </form>
        {nameSaved && (
          <p className="mt-2 text-[13px]" style={{ color: 'var(--muted)' }}>
            Saved.
          </p>
        )}
        {nameError && (
          <p className="mt-2 text-[13px] font-semibold" style={{ color: 'var(--vermilion)' }}>
            {nameError}
          </p>
        )}
      </div>

      <div>
        <p
          className="text-[11px] font-bold tracking-[0.06em] uppercase"
          style={{ color: 'var(--muted)' }}
        >
          Email
        </p>
        <p className="mt-1 text-[15px] font-semibold">{email}</p>

        {emailSent ? (
          <p className="mt-2.5 text-[13px]" style={{ color: 'var(--muted)' }}>
            Check {newEmail} for a link to confirm the change.
          </p>
        ) : (
          <form onSubmit={handleChangeEmail} className="mt-2.5 flex flex-wrap items-start gap-2">
            <input
              type="email"
              required
              placeholder="New email address"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="min-w-0 flex-1 px-3 py-2 text-[14px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--cobalt)]"
              style={inputStyle}
            />
            <button
              type="submit"
              disabled={emailPending}
              className="font-[family-name:var(--font-archivo)] px-4 py-2 text-[12px] font-extrabold tracking-[0.05em] uppercase disabled:opacity-60"
              style={buttonStyle}
            >
              {emailPending ? 'Sending…' : 'Change email'}
            </button>
          </form>
        )}
        {emailError && (
          <p className="mt-2 text-[13px] font-semibold" style={{ color: 'var(--vermilion)' }}>
            {emailError}
          </p>
        )}
      </div>

      <div>
        <p
          className="text-[11px] font-bold tracking-[0.06em] uppercase"
          style={{ color: 'var(--muted)' }}
        >
          Password
        </p>

        {passwordSent ? (
          <p className="mt-2.5 text-[13px]" style={{ color: 'var(--muted)' }}>
            Check {email} for a link to set a new password.
          </p>
        ) : (
          <button
            type="button"
            onClick={handleChangePassword}
            disabled={passwordPending}
            className="font-[family-name:var(--font-archivo)] mt-2.5 px-4 py-2 text-[12px] font-extrabold tracking-[0.05em] uppercase disabled:opacity-60"
            style={buttonStyle}
          >
            {passwordPending ? 'Sending…' : 'Change password'}
          </button>
        )}
        {passwordError && (
          <p className="mt-2 text-[13px] font-semibold" style={{ color: 'var(--vermilion)' }}>
            {passwordError}
          </p>
        )}
      </div>

      <div style={{ borderTop: '1.5px solid var(--rule)', paddingTop: '20px' }}>
        <button
          type="button"
          onClick={handleSignOut}
          disabled={signingOut}
          className="font-[family-name:var(--font-archivo)] text-[13px] font-bold underline disabled:opacity-60"
          style={{ color: 'var(--muted)' }}
        >
          {signingOut ? 'Signing out…' : 'Sign out'}
        </button>
      </div>
    </div>
  );
}
