import { NextResponse, type NextRequest } from 'next/server';
import type { EmailOtpType } from '@supabase/supabase-js';

import { createClient } from '@/lib/supabase/server';

// Single landing spot for OAuth redirects, email-confirmation links, and
// (as of 20 Aug) the token_hash-based confirm-signup links — same fix as
// /reset-password's, for the same reason: Supabase's default
// {{ .ConfirmationURL }} points at their own hosted /verify endpoint,
// which a mail client's or corporate scanner's link-safety prefetch
// consumes before the human ever clicks, leaving the real click to fail
// against an already-used token. Supabase's own docs recommend pointing
// the Confirm Signup (and Magic Link) email templates at
// {{ .SiteURL }}/callback?token_hash={{ .TokenHash }}&type=email instead —
// verifying it ourselves, server-side, here.
//
// A profile row is only ever created here, once a real session exists — never
// speculatively, so a confirmed session with no accompanying profile row
// simply means the account isn't finished setting up yet.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const tokenHash = searchParams.get('token_hash');
  const type = searchParams.get('type');
  const next = searchParams.get('next') || '/';

  if (!code && !(tokenHash && type)) {
    return NextResponse.redirect(`${origin}/sign-in`);
  }

  const supabase = await createClient();
  const { error } = code
    ? await supabase.auth.exchangeCodeForSession(code)
    : await supabase.auth.verifyOtp({ token_hash: tokenHash!, type: type as EmailOtpType });

  if (error) {
    return NextResponse.redirect(`${origin}/sign-in?error=${encodeURIComponent(error.message)}`);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(`${origin}/sign-in`);
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, onboarding_completed_at')
    .eq('id', user.id)
    .maybeSingle();

  if (profile) {
    // Covers both a fresh account continuing straight through and a
    // returning student who signed up, confirmed, but never finished
    // onboarding — either way, don't hand them `next` until it's done.
    if (!profile.onboarding_completed_at) {
      return NextResponse.redirect(`${origin}/onboarding?next=${encodeURIComponent(next)}`);
    }
    return NextResponse.redirect(`${origin}${next}`);
  }

  // Email/password signups carry age confirmation (and the rest of the
  // sign-up form) from auth metadata; OAuth signups have no such form, so
  // send them to confirm age before a profile (and thus an active account)
  // exists. OAuth providers don't give us status/country at all, and their
  // name field varies by provider, so those stay unset for OAuth accounts.
  const ageConfirmed = user.user_metadata?.age_confirmed_16_plus === true;

  if (!ageConfirmed) {
    return NextResponse.redirect(`${origin}/confirm-age?next=${encodeURIComponent(next)}`);
  }

  const fullName = (user.user_metadata?.full_name ?? user.user_metadata?.name) as
    string | undefined;
  const [oauthFirstName, ...oauthLastNameParts] = (fullName ?? '').trim().split(/\s+/);

  const { error: insertError } = await supabase.from('profiles').insert({
    id: user.id,
    age_confirmed_16_plus: true,
    first_name: user.user_metadata?.first_name || oauthFirstName || null,
    last_name: user.user_metadata?.last_name || oauthLastNameParts.join(' ') || null,
    status: user.user_metadata?.status || null,
    country: user.user_metadata?.country || null,
  });

  if (insertError) {
    return NextResponse.redirect(
      `${origin}/sign-in?error=${encodeURIComponent(insertError.message)}`,
    );
  }

  return NextResponse.redirect(`${origin}/onboarding?next=${encodeURIComponent(next)}`);
}
