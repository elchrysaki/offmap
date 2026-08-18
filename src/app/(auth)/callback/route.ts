import { NextResponse, type NextRequest } from 'next/server';

import { createClient } from '@/lib/supabase/server';

// Single landing spot for both email-confirmation links and OAuth redirects.
// A profile row is only ever created here, once a real session exists — never
// speculatively, so a confirmed session with no accompanying profile row
// simply means the account isn't finished setting up yet.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') || '/';

  if (!code) {
    return NextResponse.redirect(`${origin}/sign-in`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

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
    .select('id')
    .eq('id', user.id)
    .maybeSingle();

  if (profile) {
    return NextResponse.redirect(`${origin}${next}`);
  }

  // Email/password signups carry age confirmation from the sign-up form as
  // auth metadata; OAuth signups have no such form, so send them to confirm
  // it before a profile (and thus an active account) exists.
  const ageConfirmed = user.user_metadata?.age_confirmed_16_plus === true;

  if (!ageConfirmed) {
    return NextResponse.redirect(`${origin}/confirm-age?next=${encodeURIComponent(next)}`);
  }

  const { error: insertError } = await supabase
    .from('profiles')
    .insert({ id: user.id, age_confirmed_16_plus: true });

  if (insertError) {
    return NextResponse.redirect(
      `${origin}/sign-in?error=${encodeURIComponent(insertError.message)}`,
    );
  }

  return NextResponse.redirect(`${origin}${next}`);
}
