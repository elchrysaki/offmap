import { notFound } from 'next/navigation';

import { CountdownNumeral } from '@/components/core/countdown-numeral';
import { NotOnlineStamp } from '@/components/core/not-online-stamp';
import { formatDate, formatLabel, fundingLabel, locationLabel, prepTimeLabel } from '@/lib/format';
import { getOpportunityById } from '@/lib/queries/opportunities';

type Params = Promise<{ id: string }>;

export default async function OpportunityDetailPage({ params }: { params: Params }) {
  const { id } = await params;
  const opportunity = await getOpportunityById(id);

  if (!opportunity) notFound();

  const location = locationLabel(opportunity.host_city, opportunity.country, opportunity.format);
  const fmt = formatLabel(opportunity.format);

  // Card rule, non-negotiable (CLAUDE.md §7): answers when it closes, what
  // it costs, who can apply — without a click.
  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <div className="flex items-start gap-4">
        <div className="w-16 shrink-0 text-right">
          <CountdownNumeral
            daysRemaining={opportunity.days_remaining}
            status={opportunity.status}
            opensAt={opportunity.opens_at}
          />
        </div>
        <div className="min-w-0 flex-1">
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

      <div className="mt-6" style={{ borderTop: '1.5px solid var(--rule)' }} />

      <div className="mt-6 grid grid-cols-2 gap-6">
        <div>
          <p className="font-[family-name:var(--font-archivo)] text-[12px] font-bold tracking-[0.13em] uppercase" style={{ color: 'var(--muted)' }}>
            Funding
          </p>
          <p className="mt-1 text-[15px]">{fundingLabel(opportunity.funding) ?? 'Not stated'}</p>
        </div>
        <div>
          <p className="font-[family-name:var(--font-archivo)] text-[12px] font-bold tracking-[0.13em] uppercase" style={{ color: 'var(--muted)' }}>
            Who can apply
          </p>
          <p className="mt-1 text-[15px]">{opportunity.eligibility ?? 'Not stated'}</p>
        </div>
      </div>

      {opportunity.prep_time && (
        <p className="mt-4 text-[13px]" style={{ color: 'var(--muted)' }}>
          Prep time: {prepTimeLabel(opportunity.prep_time)}
        </p>
      )}

      {opportunity.deadline_at && (
        <p className="mt-2 text-[13px]" style={{ color: 'var(--muted)' }}>
          Deadline: {formatDate(opportunity.deadline_at)}
        </p>
      )}

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
        <a
          href={opportunity.official_url ?? '#'}
          target="_blank"
          rel="noreferrer noopener"
          className="text-[13px] underline"
          style={{ color: 'var(--cobalt)' }}
        >
          Official source
        </a>
      </div>

      {/* Provenance line on every card and detail page (CLAUDE.md §7). */}
      <p className="mt-8 text-[12px]" style={{ color: 'var(--muted)' }}>
        {opportunity.submitted_by
          ? `Submitted by ${opportunity.submitted_by}.`
          : ''}{' '}
        {opportunity.verified_by && opportunity.last_verified_at
          ? `Verified ${formatDate(opportunity.last_verified_at)} by ${opportunity.verified_by}.`
          : ''}
      </p>
    </main>
  );
}
