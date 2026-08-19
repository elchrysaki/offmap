import 'server-only';

import { createClient } from '@/lib/supabase/server';

export async function getCurrentUserRole() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase.from('profiles').select('role').eq('id', user.id).single();

  return data?.role ?? null;
}

export type OnboardingProfile = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  status: 'student' | 'professor' | 'organiser' | 'other' | null;
  country: string | null;
  experience_level: 'high_school' | 'undergraduate' | 'graduate' | 'professional' | null;
  onboarding_completed_at: string | null;
};

// Whether the signed-in student still needs the onboarding walkthrough —
// used by /callback (fresh accounts) and /sign-in (returning accounts that
// started but never finished it) to decide where to send them next.
export async function getCurrentUserOnboarding(): Promise<OnboardingProfile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase
    .from('profiles')
    .select('id, first_name, last_name, status, country, experience_level, onboarding_completed_at')
    .eq('id', user.id)
    .maybeSingle();

  return data;
}
