import Link from 'next/link';

import { getCurrentUserEmail } from '@/lib/queries/current-user';

// Placeholder shell only — real profile management (saved opportunities,
// preferences, account deletion) is separate work. This just reflects
// sign-in status so the nav's Profile/Sign in link goes somewhere real.
export default async function ProfilePage() {
  const email = await getCurrentUserEmail();

  if (!email) {
    return (
      <main className="mx-auto max-w-xl px-6 py-14 text-center">
        <h1 className="font-[family-name:var(--font-fraunces)] text-4xl font-extrabold">Profile</h1>
        <p className="mt-3 text-[15px]" style={{ color: 'var(--muted)' }}>
          An account is optional — it only exists to sync your saved opportunities across devices.
        </p>
        <Link
          href="/sign-in"
          className="font-[family-name:var(--font-archivo)] mt-6 inline-block px-6 py-3 text-[14px] font-bold uppercase"
          style={{
            borderRadius: 'var(--radius-pill)',
            border: 'var(--border-width) solid var(--ink)',
            background: 'var(--ink)',
            color: 'var(--card)',
            letterSpacing: '0.06em',
          }}
        >
          Sign in
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-xl px-6 py-14">
      <h1 className="font-[family-name:var(--font-fraunces)] text-4xl font-extrabold">Profile</h1>
      <p className="mt-3 text-[15px]" style={{ color: 'var(--muted)' }}>
        Signed in as {email}. Placeholder — saved opportunities and preferences land here.
      </p>
    </main>
  );
}
