import Link from 'next/link';

import { categoryColorVar } from '@/lib/colors';
import { fundingLabel } from '@/lib/format';

import { CountdownNumeral } from './countdown-numeral';
import { NotOnlineStamp } from './not-online-stamp';

type Card = {
  id: string;
  title: string | null;
  organiser: string | null;
  eligibility: string | null;
  host_city: string | null;
  country: string | null;
  funding: string | null;
  reach: string | null;
  days_remaining: number | null;
  status: string | null;
  opens_at?: string | null;
  type_id?: string | null;
};

// Card (featured modules only), CLAUDE.md §7: category pill top-left, quiet
// Save top-right, numeral column left, title Fraunces 21px, organiser and
// location beneath, hairline, FUNDING / WHO CAN APPLY grid, provenance +
// stamp bottom row. Card rule, non-negotiable: answers when it closes, what
// it costs, who can apply — without a click.
export function OpportunityCard({ opportunity, typeLabel }: { opportunity: Card; typeLabel?: string }) {
  const location = [opportunity.host_city, opportunity.country].filter(Boolean).join(', ');

  return (
    <div
      className="flex flex-col gap-3 p-5"
      style={{
        borderRadius: 'var(--radius-card)',
        border: 'var(--border-width) solid var(--ink)',
        boxShadow: 'var(--shadow-offset)',
        background: 'var(--card)',
      }}
    >
      <div className="flex items-start justify-between">
        {typeLabel && opportunity.type_id ? (
          <span
            className="font-[family-name:var(--font-archivo)] px-2 py-0.5 text-[10px] font-bold tracking-[0.06em] uppercase"
            style={{
              background: categoryColorVar(opportunity.type_id),
              color: 'var(--ink)',
              borderRadius: 'var(--radius-stamp)',
            }}
          >
            {typeLabel}
          </span>
        ) : (
          <span />
        )}
        <span
          aria-label="Sign in to save"
          title="Sign in to save"
          className="text-[11px]"
          style={{ color: 'var(--muted)' }}
        >
          ☆ Save
        </span>
      </div>

      <Link href={`/opportunities/${opportunity.id}`} className="flex items-start gap-3">
        <div className="w-12 shrink-0 text-right">
          <CountdownNumeral
            daysRemaining={opportunity.days_remaining}
            status={opportunity.status}
            opensAt={opportunity.opens_at ?? null}
          />
        </div>
        <div className="min-w-0">
          <h3 className="font-[family-name:var(--font-fraunces)] text-[21px] leading-tight font-bold">
            {opportunity.title || 'Untitled opportunity'}
          </h3>
          <p className="mt-1 text-[13px]" style={{ color: 'var(--muted)' }}>
            {[opportunity.organiser, location].filter(Boolean).join(' · ')}
          </p>
        </div>
      </Link>

      <div style={{ borderTop: '1.5px solid var(--rule)' }} />

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p
            className="font-[family-name:var(--font-archivo)] text-[10px] font-bold tracking-[0.13em] uppercase"
            style={{ color: 'var(--muted)' }}
          >
            Funding
          </p>
          <p className="text-[13px]">{fundingLabel(opportunity.funding) ?? 'Not stated'}</p>
        </div>
        <div>
          <p
            className="font-[family-name:var(--font-archivo)] text-[10px] font-bold tracking-[0.13em] uppercase"
            style={{ color: 'var(--muted)' }}
          >
            Who can apply
          </p>
          <p className="text-[13px]">{opportunity.eligibility ?? 'Not stated'}</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-[11px]" style={{ color: 'var(--muted)' }}>
          Verified listing
        </span>
        {opportunity.reach === 'local' && <NotOnlineStamp />}
      </div>
    </div>
  );
}
