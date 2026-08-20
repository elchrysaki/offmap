import { CountryFilter } from '@/components/core/country-filter';
import { EffortLadder } from '@/components/core/effort-ladder';
import { OpportunityCard } from '@/components/core/opportunity-card';
import { OpportunityRow } from '@/components/core/opportunity-row';
import { SignInBanner } from '@/components/core/sign-in-banner';
import { TaxonomyFilter } from '@/components/core/taxonomy-filter';
import { TypeFilter } from '@/components/core/type-filter';
import { BrowseTour } from '@/components/shell/browse-tour';
import { CountryIntro } from '@/components/shell/country-intro';
import { EmptyState } from '@/components/shell/empty-state';
import { getCurrentUserEmail } from '@/lib/queries/current-user';
import {
  getAcademicLevels,
  getAudienceGroups,
  getFields,
  getFundingFeatures,
  getGeoScopes,
  getTypes,
} from '@/lib/queries/taxonomy';
import { getCurrentUserFieldIds, getCurrentUserOnboarding } from '@/lib/queries/profile';
import type { DeadlineRange, EffortRung } from '@/lib/queries/opportunities';
import { listBrowseOpportunities, listCountries } from '@/lib/queries/opportunities';

type SearchParams = Promise<{
  rung?: string;
  country?: string;
  type?: string;
  field?: string;
  level?: string;
  scope?: string;
  audience?: string;
  feature?: string;
  format?: string;
  deadline?: string;
}>;

const VALID_RUNGS: EffortRung[] = ['coffee_break', 'weekend_trip', 'aim_higher', 'off_path'];
const VALID_DEADLINES: DeadlineRange[] = ['week', 'month', 'longer'];

const FORMAT_OPTIONS = [
  { id: 'online', label_en: 'Remote' },
  { id: 'in_person', label_en: 'On-site' },
  { id: 'hybrid', label_en: 'Hybrid' },
];

const DEADLINE_OPTIONS = [
  { id: 'week', label_en: 'This week' },
  { id: 'month', label_en: 'This month' },
  { id: 'longer', label_en: 'Longer out' },
];

// Onboarding's experience_level enum doesn't share ids with the
// academic_level taxonomy (the latter has finer real-world distinctions
// like masters/doctoral/postdoctoral) — this is the closest single-value
// mapping for a *default filter*, not a fact about any listing, so it
// doesn't touch CLAUDE.md §6's never-publish-an-inference rule.
const EXPERIENCE_TO_ACADEMIC_LEVEL: Record<string, string> = {
  high_school: 'secondary_high_school',
  undergraduate: 'undergraduate',
  graduate: 'masters',
  professional: 'professionals',
};

// The "dashboard" entry point (CLAUDE.md §15, 17 Aug site-IA expansion) —
// app-friendly, not the marketing hero. Core register throughout: cream/ink,
// no collage, category colour as the only decoration (CLAUDE.md §7).
// "New in your sector" is a placeholder: real eligibility/sector matching
// needs student preferences that aren't built yet (roadmap Phase 4).
// Showing the newest opportunities here instead of inventing fake
// personalization.
export default async function BrowsePage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const rung = VALID_RUNGS.includes(params.rung as EffortRung)
    ? (params.rung as EffortRung)
    : undefined;
  const deadline = VALID_DEADLINES.includes(params.deadline as DeadlineRange)
    ? (params.deadline as DeadlineRange)
    : undefined;

  const [types, fields, academicLevels, geoScopes, audienceGroups, fundingFeatures, countries, email, onboarding, userFieldIds] =
    await Promise.all([
      getTypes(),
      getFields(),
      getAcademicLevels(),
      getGeoScopes(),
      getAudienceGroups(),
      getFundingFeatures(),
      listCountries(),
      getCurrentUserEmail(),
      getCurrentUserOnboarding(),
      getCurrentUserFieldIds(),
    ]);

  // A signed-in student's onboarding picks pre-select the field/academic
  // level filters (per Elena's brief: "always have picked in filtering the
  // info they have provided"). Only applies when the URL doesn't already
  // say anything — an explicit "field=" (cleared via the All fields pill)
  // or a real value both take priority, so this is a one-page-load default,
  // never persisted back to the profile.
  const defaultFieldId = params.field === undefined ? userFieldIds[0] : undefined;
  const defaultAcademicLevelId =
    params.level === undefined && onboarding?.experience_level
      ? EXPERIENCE_TO_ACADEMIC_LEVEL[onboarding.experience_level]
      : undefined;

  const effectiveFieldId = params.field ? params.field : defaultFieldId;
  const effectiveAcademicLevelId = params.level ? params.level : defaultAcademicLevelId;

  const opportunities = await listBrowseOpportunities({
    rung,
    country: params.country,
    typeId: params.type,
    fieldId: effectiveFieldId,
    academicLevelId: effectiveAcademicLevelId,
    geoScopeId: params.scope || undefined,
    audienceGroupId: params.audience || undefined,
    fundingFeatureId: params.feature || undefined,
    format: params.format || undefined,
    deadline,
  });

  const typeLabels = new Map((types ?? []).map((t) => [t.id, t.label_en]));
  const rows = opportunities.filter((o): o is typeof o & { id: string } => o.id !== null);
  const newest = [...rows].slice(0, 3);
  const hasFilters = Boolean(
    rung ||
      params.country ||
      params.type ||
      effectiveFieldId ||
      effectiveAcademicLevelId ||
      params.scope ||
      params.audience ||
      params.feature ||
      params.format ||
      deadline,
  );
  const activeTypeLabel = params.type ? typeLabels.get(params.type) : undefined;

  // Every filter's pill bar needs every *other* active param preserved in
  // its links — build the shared set once, each bar below omits its own key.
  const allParams = {
    rung: params.rung,
    country: params.country,
    type: params.type,
    field: params.field,
    level: params.level,
    scope: params.scope,
    audience: params.audience,
    feature: params.feature,
    format: params.format,
    deadline: params.deadline,
  };
  const without = (...keys: (keyof typeof allParams)[]) => {
    const copy = { ...allParams };
    keys.forEach((key) => delete copy[key]);
    return copy;
  };

  return (
    <main className="mx-auto max-w-2xl px-6 py-10 lg:max-w-6xl">
      <CountryIntro initialCountry={params.country} />
      <BrowseTour />

      <p
        className="font-[family-name:var(--font-archivo)] text-[11px] font-extrabold tracking-[0.16em] uppercase"
        style={{ color: 'var(--muted)' }}
      >
        {rows.length} open right now
      </p>
      <h1 className="font-[family-name:var(--font-fraunces)] mt-1 text-3xl font-extrabold">
        Browse
      </h1>
      <p className="mt-1 text-[14px]" style={{ color: 'var(--muted)' }}>
        The opportunities students actually get into.
      </p>
      <p className="mt-1 text-[12px]" style={{ color: 'var(--muted)' }}>
        Every listing here is checked by a real ambassador or moderator before it goes live —
        never scraped, never guessed.
      </p>

      {!email && (
        <div className="mt-6">
          <SignInBanner />
        </div>
      )}

      <div className="mt-7 flex flex-col gap-3">
        <CountryFilter countries={countries} active={params.country} otherParams={without('country')} />

        <TypeFilter types={types ?? []} active={params.type} otherParams={without('type')} />

        <TaxonomyFilter
          ariaLabel="Subject field"
          allLabel="All subjects"
          paramName="field"
          options={fields ?? []}
          active={effectiveFieldId}
          otherParams={without('field')}
          clearParamValue={defaultFieldId ? '' : undefined}
        />

        <TaxonomyFilter
          ariaLabel="Academic level"
          allLabel="All levels"
          paramName="level"
          options={academicLevels ?? []}
          active={effectiveAcademicLevelId}
          otherParams={without('level')}
          clearParamValue={defaultAcademicLevelId ? '' : undefined}
        />

        <TaxonomyFilter
          ariaLabel="Eligibility"
          allLabel="Anyone"
          paramName="audience"
          options={audienceGroups ?? []}
          active={params.audience}
          otherParams={without('audience')}
        />

        <TaxonomyFilter
          ariaLabel="Reach"
          allLabel="Any reach"
          paramName="scope"
          options={geoScopes ?? []}
          active={params.scope}
          otherParams={without('scope')}
        />

        <TaxonomyFilter
          ariaLabel="Funding feature"
          allLabel="Any funding"
          paramName="feature"
          options={fundingFeatures ?? []}
          active={params.feature}
          otherParams={without('feature')}
        />

        <TaxonomyFilter
          ariaLabel="Format"
          allLabel="Any format"
          paramName="format"
          options={FORMAT_OPTIONS}
          active={params.format}
          otherParams={without('format')}
        />

        <TaxonomyFilter
          ariaLabel="Deadline"
          allLabel="Any deadline"
          paramName="deadline"
          options={DEADLINE_OPTIONS}
          active={deadline}
          otherParams={without('deadline')}
        />
      </div>

      {newest.length > 0 && !hasFilters && (
        <section className="mt-8">
          <p
            className="font-[family-name:var(--font-archivo)] text-[12px] font-bold tracking-[0.13em] uppercase"
            style={{ color: 'var(--muted)' }}
          >
            New in your sector
          </p>
          <p className="mt-0.5 text-[11px]" style={{ color: 'var(--muted)' }}>
            Placeholder — shows newest listings until sector matching is built.
          </p>
          <ul className="mt-3 lg:hidden">
            {newest.map((opportunity) => (
              <li key={opportunity.id}>
                <OpportunityRow
                  opportunity={opportunity}
                  typeLabel={typeLabels.get(opportunity.type_id ?? '')}
                />
              </li>
            ))}
          </ul>
          <ul className="mt-3 hidden gap-4 lg:grid lg:grid-cols-3">
            {newest.map((opportunity) => (
              <li key={opportunity.id}>
                <OpportunityCard
                  opportunity={opportunity}
                  typeLabel={typeLabels.get(opportunity.type_id ?? '')}
                />
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="mt-8">
        <EffortLadder />
      </div>

      {(params.country || activeTypeLabel) && (
        <p className="mt-5 text-[12px]" style={{ color: 'var(--muted)' }}>
          Showing{' '}
          {activeTypeLabel && (
            <span className="font-bold" style={{ color: 'var(--ink)' }}>
              {activeTypeLabel}
            </span>
          )}
          {activeTypeLabel && params.country && ' in '}
          {params.country && (
            <span className="font-bold" style={{ color: 'var(--ink)' }}>
              {params.country}
            </span>
          )}
        </p>
      )}

      {rows.length === 0 ? (
        <div className="mt-6">
          <EmptyState />
        </div>
      ) : (
        <>
          <ul className="mt-6 lg:hidden">
            {rows.map((opportunity) => (
              <li key={opportunity.id}>
                <OpportunityRow
                  opportunity={opportunity}
                  typeLabel={typeLabels.get(opportunity.type_id ?? '')}
                />
              </li>
            ))}
          </ul>
          <ul className="mt-6 hidden gap-5 lg:grid lg:grid-cols-2 xl:grid-cols-3">
            {rows.map((opportunity) => (
              <li key={opportunity.id}>
                <OpportunityCard
                  opportunity={opportunity}
                  typeLabel={typeLabels.get(opportunity.type_id ?? '')}
                />
              </li>
            ))}
          </ul>
        </>
      )}
    </main>
  );
}
