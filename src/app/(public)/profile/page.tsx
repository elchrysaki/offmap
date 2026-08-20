import Link from 'next/link';

import { getCurrentUserEmail } from '@/lib/queries/current-user';
import { getCurrentUserOnboarding } from '@/lib/queries/profile';
import { getSavedOpportunitiesWithDetails } from '@/lib/queries/saved-opportunities';
import { statusLabel, experienceLabel } from '@/lib/profile-labels';
import { AccountSettings } from '@/components/shell/account-settings';
import { SavedBoard } from '@/components/shell/saved-board';

// Real profile page (Elena's call, 20 Aug) — replaces the earlier
// sign-in-status-only placeholder. Shows the onboarding-collected profile
// fields, account settings (change email/password), and the
// Goals/Apply/Applied/Archived saved-opportunity board
// (supabase/migrations/20260819172931_profile_personalization.sql).
export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ email_changed?: string }>;
}) {
  const { email_changed } = await searchParams;
  const profile = await getCurrentUserOnboarding();

  if (!profile) {
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

  const saves = await getSavedOpportunitiesWithDetails();
  const email = await getCurrentUserEmail();
  const fullName = [profile.first_name, profile.last_name].filter(Boolean).join(' ');

  return (
    <main className="mx-auto max-w-2xl px-6 py-14">
      <h1 className="font-[family-name:var(--font-fraunces)] text-4xl font-extrabold">
        {fullName || 'Profile'}
      </h1>
      <p className="mt-2 text-[13px]" style={{ color: 'var(--muted)' }}>
        {[statusLabel(profile.status), profile.country, experienceLabel(profile.experience_level)]
          .filter(Boolean)
          .join(' · ')}
      </p>

      <AccountSettings email={email ?? ''} emailJustChanged={email_changed === '1'} />

      <p
        className="font-[family-name:var(--font-archivo)] mt-8 text-[12px] font-bold tracking-[0.13em] uppercase"
        style={{ color: 'var(--muted)' }}
      >
        Saved opportunities
      </p>
      <SavedBoard initialSaves={saves} />
    </main>
  );
}
