import { redirect } from 'next/navigation';

import { createClient } from '@/lib/supabase/server';

// Every /admin/* route is gated here. Two checks, both required: signed in,
// and a role (ambassador or moderator) on their own profile row. role can
// only be set by direct SQL (see the migration) — there's no signup path
// that grants it, so a compromised signup flow can't self-elevate.
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/sign-in?next=/admin');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile?.role) {
    return (
      <main className="mx-auto max-w-lg px-6 py-16">
        <p>You&apos;re signed in, but this account isn&apos;t authorized for dashboard access.</p>
      </main>
    );
  }

  return children;
}
