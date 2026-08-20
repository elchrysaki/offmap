import { SiteFooter } from '@/components/shell/site-footer';
import { SiteHeader } from '@/components/shell/site-header';
import { SignUpForm } from '@/components/shell/sign-up-form';

// Server Component wrapper — same reason as /sign-in and /reset-password:
// SiteHeader does a server-only DB read, so it can't live inside the
// 'use client' form file.
export default function SignUpPage() {
  return (
    <>
      <SiteHeader />
      <SignUpForm />
      <SiteFooter />
    </>
  );
}
