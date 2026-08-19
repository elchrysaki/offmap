import Link from 'next/link';
import { notFound } from 'next/navigation';

import { CountdownNumeral } from '@/components/core/countdown-numeral';
import { NotOnlineStamp } from '@/components/core/not-online-stamp';
import { SaveButton } from '@/components/core/save-button';
import { categoryColorVar } from '@/lib/colors';
import {
  formatDate,
  formatLabel,
  fundingLabel,
  locationLabel,
  prepTimeLabel,
} from '@/lib/format';
import { getOpportunityById, getOpportunityTaxonomyIds } from '@/lib/queries/opportunities';
import {
  getAcademicLevels,
  getAudienceGroups,
  getFields,
  getFundingFeatures,
  getGeoScopes,
  getTypes,
} from '@/lib/queries/taxonomy';

type Params = Promise<{ id: string }>;

function TaxonomyTags({ label, ids, labelMap }: { label: string; ids: string[]; labelMap: Map<string, string> }) {
  if (ids.length === 0) return null;
  return (
    <div>
      <p
        className="font-[family-name:var(--font-archivo)] text-[11px] font-bold tracking-[0.13em] uppercase"
        style={{ color: 'var(--muted)' }}
      >
        {label}
      </p>
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        {ids.map((id) => (
          <span
            key={id}
            className="font-[family-name:var(--font-archivo)] px-2 py-0.5 text-[11px] font-bold uppercase"
            style={{
              borderRadius: 'var(--radius-stamp)',
              border: 'var(--border-width) solid var(--ink)',
              background: 'var(--card)',
            }}
          >
            {labelMap.get(id) ?? id}
          </span>
        ))}
      </div>
    </div>
  );
}

function DetailSection({ title, body }: { title: string; body: string | null }) {
  if (!body) return null;
  return (
    <details className="group" style={{ borderTop: '1.5px solid var(--rule)' }}>
      <summary
        className="font-[family-name:var(--font-archivo)] flex cursor-pointer list-none items-center justify-between py-3 text-[12px] font-bold tracking-[0.1em] uppercase focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--cobalt)]"
        style={{ color: 'var(--muted)' }}
      >
        {title}
        <span aria-hidden="true" className="transition-transform group-open:rotate-45">
          +
        </span>
      </summary>
      <p className="pb-4 text-[14px] whitespace-pre-line">{body}</p>
    </details>
  );
}

// Card rule, non-negotiable (CLAUDE.md §7): answers when it closes, what
// it costs, who can apply — without a click. Everything below the first
// hairline is additional context beyond that minimum, not a substitute
// for it — the header alone already answers the three questions.
export default async function OpportunityDetailPage({ params }: { params: Params }) {
  const { id } = await params;
  const opportunity = await getOpportunityById(id);

  if (!opportunity) notFound();

  // opportunity_public is a view, so every column (including id) is
  // typed nullable — but a row we just fetched by this exact id obviously
  // has one. Fall back to the route param rather than widen types elsewhere.
  const opportunityId = opportunity.id ?? id;

  const [taxonomyIds, types, fields, academicLevels, geoScopes, audienceGroups, fundingFeatures] =
    await Promise.all([
      getOpportunityTaxonomyIds(opportunityId),
      getTypes(),
      getFields(),
      getAcademicLevels(),
      getGeoScopes(),
      getAudienceGroups(),
      getFundingFeatures(),
    ]);

  const typeLabels = new Map((types ?? []).map((t) => [t.id, t.label_en]));
  const fieldLabels = new Map((fields ?? []).map((t) => [t.id, t.label_en]));
  const academicLevelLabels = new Map((academicLevels ?? []).map((t) => [t.id, t.label_en]));
  const geoScopeLabels = new Map((geoScopes ?? []).map((t) => [t.id, t.label_en]));
  const audienceGroupLabels = new Map((audienceGroups ?? []).map((t) => [t.id, t.label_en]));
  const fundingFeatureLabels = new Map((fundingFeatures ?? []).map((t) => [t.id, t.label_en]));

  const location = locationLabel(opportunity.host_city, opportunity.country, opportunity.format);
  const fmt = formatLabel(opportunity.format);
  const typeLabel = opportunity.type_id ? typeLabels.get(opportunity.type_id) : undefined;

  const hasProvenance = Boolean(opportunity.submitted_by || (opportunity.verified_by && opportunity.last_verified_at));

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <Link
        href="/browse"
        className="font-[family-name:var(--font-archivo)] text-[12px] font-bold uppercase focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--cobalt)]"
        style={{ color: 'var(--muted)' }}
      >
        ← All opportunities
      </Link>

      <div className="mt-5 flex items-start gap-4">
        <div className="w-16 shrink-0 text-right">
          <CountdownNumeral
            daysRemaining={opportunity.days_remaining}
            status={opportunity.status}
            opensAt={opportunity.opens_at}
          />
        </div>
        <div className="min-w-0 flex-1">
          {typeLabel && opportunity.type_id && (
            <span
              className="font-[family-name:var(--font-archivo)] mb-1.5 inline-block px-2 py-0.5 text-[10px] font-bold tracking-[0.06em] uppercase"
              style={{
                background: categoryColorVar(opportunity.type_id),
                color: 'var(--ink)',
                borderRadius: 'var(--radius-stamp)',
              }}
            >
              {typeLabel}
            </span>
          )}
          <h1 className="font-[family-name:var(--font-fraunces)] text-[21px] font-bold">
            {opportunity.title || 'Untitled opportunity'}
          </h1>
          <p className="mt-1 text-[14px]" style={{ color: 'var(--muted)' }}>
            {[opportunity.organiser, location].filter(Boolean).join(' · ')}
            {fmt ? ` · ${fmt}` : ''}
          </p>
        </div>
        {opportunity.reach === 'local' && (
          <div className="shrink-0">
            <NotOnlineStamp />
          </div>
        )}
      </div>

      <div className="mt-4">
        <SaveButton opportunityId={opportunityId} />
      </div>

      <div className="mt-6" style={{ borderTop: '1.5px solid var(--rule)' }} />

      <div className="mt-6 grid grid-cols-2 gap-6">
        <div>
          <p className="font-[family-name:var(--font-archivo)] text-[12px] font-bold tracking-[0.13em] uppercase" style={{ color: 'var(--muted)' }}>
            Funding
          </p>
          <p className="mt-1 text-[15px]">{fundingLabel(opportunity.funding) ?? 'Not stated'}</p>
          {opportunity.funding_details && (
            <p className="mt-1 text-[13px]" style={{ color: 'var(--muted)' }}>
              {opportunity.funding_details}
            </p>
          )}
        </div>
        <div>
          <p className="font-[family-name:var(--font-archivo)] text-[12px] font-bold tracking-[0.13em] uppercase" style={{ color: 'var(--muted)' }}>
            Who can apply
          </p>
          <p className="mt-1 text-[15px]">{opportunity.eligibility ?? 'Not stated'}</p>
          {opportunity.eligible_countries && (
            <p className="mt-1 text-[13px]" style={{ color: 'var(--muted)' }}>
              {opportunity.eligible_countries}
            </p>
          )}
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-x-6 gap-y-3">
        {opportunity.prep_time && (
          <p className="text-[13px]" style={{ color: 'var(--muted)' }}>
            Prep time: <span style={{ color: 'var(--ink)' }}>{prepTimeLabel(opportunity.prep_time)}</span>
          </p>
        )}
        {opportunity.deadline_at && (
          <p className="text-[13px]" style={{ color: 'var(--muted)' }}>
            Deadline: <span style={{ color: 'var(--ink)' }}>{formatDate(opportunity.deadline_at)}</span>
          </p>
        )}
        {opportunity.opens_at && (
          <p className="text-[13px]" style={{ color: 'var(--muted)' }}>
            Opens: <span style={{ color: 'var(--ink)' }}>{formatDate(opportunity.opens_at)}</span>
          </p>
        )}
        {opportunity.specific_majors && (
          <p className="text-[13px]" style={{ color: 'var(--muted)' }}>
            Majors: <span style={{ color: 'var(--ink)' }}>{opportunity.specific_majors}</span>
          </p>
        )}
      </div>

      <div className="mt-6 flex flex-col gap-4">
        <TaxonomyTags label="Field" ids={taxonomyIds.field} labelMap={fieldLabels} />
        <TaxonomyTags label="Academic level" ids={taxonomyIds.academic_level} labelMap={academicLevelLabels} />
        <TaxonomyTags label="Who it's for" ids={taxonomyIds.audience_group} labelMap={audienceGroupLabels} />
        <TaxonomyTags label="Funding includes" ids={taxonomyIds.funding_feature} labelMap={fundingFeatureLabels} />
        <TaxonomyTags label="Reach" ids={taxonomyIds.geo_scope} labelMap={geoScopeLabels} />
      </div>

      <div className="mt-2">
        <DetailSection title="Application requirements" body={opportunity.application_requirements} />
        <DetailSection title="Who this is for" body={opportunity.audience_notes} />
        <DetailSection title="Additional information" body={opportunity.additional_information} />
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        {opportunity.apply_url && (
          <a
            href={opportunity.apply_url}
            target="_blank"
            rel="noreferrer noopener"
            className="font-[family-name:var(--font-archivo)] px-5 py-2.5 text-[13px] font-bold uppercase focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--cobalt)]"
            style={{
              borderRadius: 'var(--radius-pill)',
              border: 'var(--border-width) solid var(--ink)',
              background: 'var(--ink)',
              color: 'var(--card)',
              letterSpacing: '0.06em',
            }}
          >
            Apply
          </a>
        )}
      </div>

      {/* Credits the official source clearly and links out, per the product
          owner's explicit request — this is the organiser's own page, not
          OffMap's, so it's marked as leaving the site. */}
      {opportunity.official_url && (
        <a
          href={opportunity.official_url}
          target="_blank"
          rel="noreferrer noopener"
          className="mt-4 flex items-center gap-2 p-3 text-[13px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--cobalt)]"
          style={{
            borderRadius: 'var(--radius-card)',
            border: 'var(--border-width) solid var(--ink)',
            background: 'var(--card)',
          }}
        >
          <span aria-hidden="true">↗</span>
          <span>
            Official source:{' '}
            <span className="underline" style={{ color: 'var(--cobalt)' }}>
              {opportunity.organiser || 'Visit the organiser’s site'}
            </span>
          </span>
        </a>
      )}

      {/* Provenance line on every card and detail page (CLAUDE.md §7). Never
          claims something is verified if last_verified_at is null. */}
      {hasProvenance && (
        <p className="mt-6 text-[12px]" style={{ color: 'var(--muted)' }}>
          {opportunity.submitted_by ? `Submitted by ${opportunity.submitted_by}. ` : ''}
          {opportunity.verified_by && opportunity.last_verified_at
            ? `Verified ${formatDate(opportunity.last_verified_at)} by ${opportunity.verified_by}.`
            : ''}
        </p>
      )}
    </main>
  );
}
