import { Suspense } from 'react';

import { SiteFooter } from '@/components/shell/site-footer';
import { SiteHeader } from '@/components/shell/site-header';
import { SignInForm } from '@/components/shell/sign-in-form';

// A Server Component wrapper is required here, not just convenient:
// SiteHeader does a server-only DB read (getCurrentUserEmail), so it can't
// be imported into the 'use client' form component — see SignInForm's
// comment for the split.
export default function SignInPage() {
  return (
    <>
      <SiteHeader />
      <Suspense>
        <SignInForm />
      </Suspense>
      <SiteFooter />
    </>
  );
}
