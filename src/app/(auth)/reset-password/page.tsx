import { Suspense } from 'react';

import { SiteFooter } from '@/components/shell/site-footer';
import { SiteHeader } from '@/components/shell/site-header';
import { ResetPasswordForm } from '@/components/shell/reset-password-form';

// Server Component wrapper — same reason as /sign-in: SiteHeader does a
// server-only DB read, so it can't live inside the 'use client' form file.
export default function ResetPasswordPage() {
  return (
    <>
      <SiteHeader />
      <Suspense>
        <ResetPasswordForm />
      </Suspense>
      <SiteFooter />
    </>
  );
}
