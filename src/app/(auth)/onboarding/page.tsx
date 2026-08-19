import { redirect } from 'next/navigation';

import { OnboardingFlow } from '@/components/shell/onboarding-flow';
import { getCurrentUserOnboarding } from '@/lib/queries/profile';
import { getFields, getGoals } from '@/lib/queries/taxonomy';

// Reached from /callback (fresh accounts and returning-but-unfinished ones)
// and from /sign-in's own onboarding check. Requires a session — this isn't
// a guest flow, there's nowhere to save preferences without an account.
export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const profile = await getCurrentUserOnboarding();

  if (!profile) {
    redirect(`/sign-in?next=${encodeURIComponent(`/onboarding${next ? `?next=${next}` : ''}`)}`);
  }

  if (profile.onboarding_completed_at) {
    redirect(next || '/browse');
  }

  const [fields, goals] = await Promise.all([getFields(), getGoals()]);

  return <OnboardingFlow fields={fields} goals={goals} next={next || '/browse'} />;
}
