'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { createClient } from '@/lib/supabase/client';
import { rowMeta } from '@/lib/format';
import { EXPERIENCE_OPTIONS } from '@/lib/profile-labels';
import type { Database } from '@/lib/supabase/types';
import { CountdownNumeral } from '@/components/core/countdown-numeral';
import { SaveButton } from '@/components/core/save-button';

type Lookup = { id: string; label_en: string };

type RecommendedOpportunity = {
  id: string;
  title: string | null;
  funding: string | null;
  eligibility: string | null;
  host_city: string | null;
  country: string | null;
  format: string | null;
  days_remaining: number | null;
  status: string | null;
  opens_at?: string | null;
};

function chipStyle(active: boolean): React.CSSProperties {
  return {
    borderRadius: 'var(--radius-pill)',
    border: 'var(--border-width) solid var(--ink)',
    background: active ? 'var(--lime)' : 'var(--card)',
    color: 'var(--ink)',
  };
}

// One-time walkthrough after email confirmation (Elena's call, 20 Aug):
// study fields -> goals -> experience level -> a live "recommended for
// you" sweep that demonstrates Save and the per-save notify toggles
// before handing off to `next`. Writes land in profile_field/profile_goal
// (supabase/migrations/20260819172931_profile_personalization.sql) plus
// profiles.experience_level and onboarding_completed_at. Uses the browser
// client directly rather than a server action — every table here already
// has RLS scoped to auth.uid(), same trust boundary as SaveButton.
export function OnboardingFlow({
  fields,
  goals,
  next,
}: {
  fields: Lookup[];
  goals: Lookup[];
  next: string;
}) {
  const router = useRouter();
  const supabase = createClient();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [experienceLevel, setExperienceLevel] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recommended, setRecommended] = useState<RecommendedOpportunity[] | null>(null);

  function toggle(list: string[], setList: (v: string[]) => void, id: string) {
    setList(list.includes(id) ? list.filter((v) => v !== id) : [...list, id]);
  }

  async function finishOnboarding() {
    setSaving(true);
    setError(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError('Your session expired. Please sign in again.');
      setSaving(false);
      return;
    }

    const [fieldResult, goalResult, profileResult] = await Promise.all([
      selectedFields.length
        ? supabase
            .from('profile_field')
            .insert(selectedFields.map((field_id) => ({ profile_id: user.id, field_id })))
        : Promise.resolve({ error: null }),
      selectedGoals.length
        ? supabase
            .from('profile_goal')
            .insert(selectedGoals.map((goal_id) => ({ profile_id: user.id, goal_id })))
        : Promise.resolve({ error: null }),
      supabase
        .from('profiles')
        .update({
          // Only ever set via setExperienceLevel(option.value), so this is
          // always one of EXPERIENCE_OPTIONS' values — the button that
          // calls finishOnboarding is disabled until it's non-empty.
          experience_level: (experienceLevel || null) as
            Database['public']['Enums']['experience_level'] | null,
          onboarding_completed_at: new Date().toISOString(),
        })
        .eq('id', user.id),
    ]);

    const writeError = fieldResult.error || goalResult.error || profileResult.error;
    if (writeError) {
      setError(writeError.message);
      setSaving(false);
      return;
    }

    // Same two-query shape as listRecommendedOpportunities
    // (src/lib/queries/opportunities.ts) but via the browser client, since
    // it depends on this step's just-made selection rather than data a
    // server render could have prefetched.
    if (selectedFields.length > 0) {
      const { data: matches } = await supabase
        .from('opportunity_field')
        .select('opportunity_id')
        .in('field_id', selectedFields);

      const opportunityIds = Array.from(new Set((matches ?? []).map((row) => row.opportunity_id)));

      if (opportunityIds.length > 0) {
        const { data } = await supabase
          .from('opportunity_public')
          .select(
            'id, title, organiser, funding, eligibility, host_city, country, format, reach, prep_time, deadline_precision, days_remaining, status, type_id',
          )
          .in('id', opportunityIds)
          .order('days_remaining', { ascending: true, nullsFirst: false })
          .limit(6);
        // opportunity_public's id column is typed nullable (view-inferred),
        // but it's the opportunity table's primary key underneath — never
        // actually null. Guard rather than assert, same reasoning as
        // getSavedOpportunitiesWithDetails (src/lib/queries/saved-opportunities.ts).
        setRecommended((data ?? []).filter((o): o is typeof o & { id: string } => o.id !== null));
      } else {
        setRecommended([]);
      }
    } else {
      setRecommended([]);
    }

    setSaving(false);
    setStep(4);
  }

  return (
    <main
      className="flex min-h-screen items-center justify-center px-6 py-16"
      style={{
        background: 'var(--paper)',
        backgroundImage: 'radial-gradient(var(--rule) 1.4px, transparent 1.4px)',
        backgroundSize: '18px 18px',
      }}
    >
      <div className="w-full max-w-[480px]">
        <div
          className="p-7"
          style={{
            background: 'var(--card)',
            border: 'var(--border-width) solid var(--ink)',
            borderRadius: 'var(--radius-panel)',
            boxShadow: 'var(--shadow-offset)',
          }}
        >
          <p
            className="font-[family-name:var(--font-archivo)] text-[11px] font-extrabold tracking-[0.12em] uppercase"
            style={{ color: 'var(--muted)' }}
          >
            Step {step} of 4
          </p>

          {step === 1 && (
            <>
              <h1 className="font-[family-name:var(--font-fraunces)] mt-2 text-2xl font-extrabold">
                What are you into?
              </h1>
              <p className="mt-1.5 text-[13px]" style={{ color: 'var(--muted)' }}>
                Pick as many as fit — this shapes what we show you first.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {fields.map((field) => (
                  <button
                    key={field.id}
                    type="button"
                    onClick={() => toggle(selectedFields, setSelectedFields, field.id)}
                    className="font-[family-name:var(--font-archivo)] px-3.5 py-2 text-[13px] font-bold"
                    style={chipStyle(selectedFields.includes(field.id))}
                  >
                    {field.label_en}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={selectedFields.length === 0}
                className="font-[family-name:var(--font-archivo)] mt-7 w-full px-4 py-3 text-[13px] font-extrabold tracking-[0.05em] uppercase disabled:opacity-50"
                style={{
                  borderRadius: 'var(--radius-pill)',
                  border: 'var(--border-width) solid var(--ink)',
                  background: 'var(--ink)',
                  color: 'var(--card)',
                }}
              >
                Next
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <h1 className="font-[family-name:var(--font-fraunces)] mt-2 text-2xl font-extrabold">
                What are you hoping to get out of it?
              </h1>
              <p className="mt-1.5 text-[13px]" style={{ color: 'var(--muted)' }}>
                Pick as many as apply.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {goals.map((goal) => (
                  <button
                    key={goal.id}
                    type="button"
                    onClick={() => toggle(selectedGoals, setSelectedGoals, goal.id)}
                    className="font-[family-name:var(--font-archivo)] px-3.5 py-2 text-[13px] font-bold"
                    style={chipStyle(selectedGoals.includes(goal.id))}
                  >
                    {goal.label_en}
                  </button>
                ))}
              </div>
              <div className="mt-7 flex gap-2.5">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="font-[family-name:var(--font-archivo)] px-4 py-3 text-[13px] font-extrabold tracking-[0.05em] uppercase"
                  style={{
                    borderRadius: 'var(--radius-pill)',
                    border: 'var(--border-width) solid var(--ink)',
                    background: 'var(--card)',
                    color: 'var(--ink)',
                  }}
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  disabled={selectedGoals.length === 0}
                  className="font-[family-name:var(--font-archivo)] flex-1 px-4 py-3 text-[13px] font-extrabold tracking-[0.05em] uppercase disabled:opacity-50"
                  style={{
                    borderRadius: 'var(--radius-pill)',
                    border: 'var(--border-width) solid var(--ink)',
                    background: 'var(--ink)',
                    color: 'var(--card)',
                  }}
                >
                  Next
                </button>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <h1 className="font-[family-name:var(--font-fraunces)] mt-2 text-2xl font-extrabold">
                Where are you right now?
              </h1>
              <p className="mt-1.5 text-[13px]" style={{ color: 'var(--muted)' }}>
                So we can filter out things you&apos;re not eligible for.
              </p>
              <div className="mt-5 flex flex-col gap-2">
                {EXPERIENCE_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setExperienceLevel(option.value)}
                    className="font-[family-name:var(--font-archivo)] px-3.5 py-2.5 text-left text-[14px] font-bold"
                    style={chipStyle(experienceLevel === option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              {error && (
                <p className="mt-4 text-[13px] font-semibold" style={{ color: 'var(--vermilion)' }}>
                  {error}
                </p>
              )}

              <div className="mt-7 flex gap-2.5">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="font-[family-name:var(--font-archivo)] px-4 py-3 text-[13px] font-extrabold tracking-[0.05em] uppercase"
                  style={{
                    borderRadius: 'var(--radius-pill)',
                    border: 'var(--border-width) solid var(--ink)',
                    background: 'var(--card)',
                    color: 'var(--ink)',
                  }}
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={finishOnboarding}
                  disabled={!experienceLevel || saving}
                  className="font-[family-name:var(--font-archivo)] flex-1 px-4 py-3 text-[13px] font-extrabold tracking-[0.05em] uppercase disabled:opacity-50"
                  style={{
                    borderRadius: 'var(--radius-pill)',
                    border: 'var(--border-width) solid var(--ink)',
                    background: 'var(--ink)',
                    color: 'var(--card)',
                  }}
                >
                  {saving ? 'Saving…' : 'See what fits'}
                </button>
              </div>
            </>
          )}

          {step === 4 && (
            <>
              <h1 className="font-[family-name:var(--font-fraunces)] mt-2 text-2xl font-extrabold">
                Here&apos;s what&apos;s open for you
              </h1>
              <p className="mt-1.5 text-[13px]" style={{ color: 'var(--muted)' }}>
                Save the ones worth a second look, and turn on a bell to get told before a deadline
                sneaks up on you.
              </p>

              {recommended && recommended.length === 0 && (
                <p className="mt-6 text-[14px]" style={{ color: 'var(--muted)' }}>
                  Nothing open in your fields right now — browse everything instead.
                </p>
              )}

              <ul className="mt-5 flex flex-col gap-4">
                {recommended?.map((opportunity) => (
                  <li
                    key={opportunity.id}
                    className="flex items-start gap-3 px-4 py-3.5"
                    style={{
                      border: '1.5px solid var(--rule)',
                      borderRadius: 'var(--radius-card)',
                    }}
                  >
                    <div className="w-11 shrink-0 pt-0.5 text-right">
                      <CountdownNumeral
                        daysRemaining={opportunity.days_remaining}
                        status={opportunity.status}
                        opensAt={opportunity.opens_at ?? null}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-[family-name:var(--font-fraunces)] truncate text-[15px] font-bold">
                        {opportunity.title || 'Untitled opportunity'}
                      </h3>
                      <p className="mt-0.5 truncate text-[12px]" style={{ color: 'var(--muted)' }}>
                        {rowMeta(opportunity)}
                      </p>
                      <div className="mt-2.5">
                        <SaveButton opportunityId={opportunity.id} />
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              <button
                type="button"
                onClick={() => {
                  router.push(next);
                  router.refresh();
                }}
                className="font-[family-name:var(--font-archivo)] mt-7 w-full px-4 py-3 text-[13px] font-extrabold tracking-[0.05em] uppercase"
                style={{
                  borderRadius: 'var(--radius-pill)',
                  border: 'var(--border-width) solid var(--ink)',
                  background: 'var(--ink)',
                  color: 'var(--card)',
                }}
              >
                Continue to OffMap
              </button>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
