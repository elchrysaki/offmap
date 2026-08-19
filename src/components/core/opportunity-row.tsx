import Link from 'next/link';

import { categoryColorVar } from '@/lib/colors';
import { rowMeta } from '@/lib/format';

import { CountdownNumeral } from './countdown-numeral';
import { NotOnlineStamp } from './not-online-stamp';

type Row = {
  id: string;
  title: string | null;
  funding: string | null;
  eligibility: string | null;
  host_city: string | null;
  country: string | null;
  format: string | null;
  reach: string | null;
  days_remaining: number | null;
  status: string | null;
  opens_at?: string | null;
  type_id?: string | null;
};

// Row (browse), CLAUDE.md §7 component rules: numeral column 56px
// right-aligned · title Fraunces 16px · meta Archivo 13px muted · stamp
// right if local. 1.5px hairline separator. No card, no border, no shadow.
// Category tag (17 Aug reversal) is additive colour, doesn't touch the
// deadline-numeral or NOT ONLINE stamp logic.
export function OpportunityRow({
  opportunity,
  typeLabel,
}: {
  opportunity: Row;
  typeLabel?: string;
}) {
  return (
    <Link
      href={`/opportunities/${opportunity.id}`}
      className="flex items-start gap-4 py-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--cobalt)]"
      style={{ borderBottom: '1.5px solid var(--rule)' }}
    >
      <div className="w-14 shrink-0 text-right">
        <CountdownNumeral
          daysRemaining={opportunity.days_remaining}
          status={opportunity.status}
          opensAt={opportunity.opens_at ?? null}
        />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          {typeLabel && opportunity.type_id && (
            <span
              className="font-[family-name:var(--font-archivo)] shrink-0 px-1.5 py-0.5 text-[10px] font-bold tracking-[0.06em] uppercase"
              style={{
                background: categoryColorVar(opportunity.type_id),
                color: 'var(--ink)',
                borderRadius: 'var(--radius-stamp)',
              }}
            >
              {typeLabel}
            </span>
          )}
          <h3 className="font-[family-name:var(--font-fraunces)] truncate text-[16px] font-bold">
            {opportunity.title || 'Untitled opportunity'}
          </h3>
        </div>
        <p className="mt-0.5 truncate text-[13px]" style={{ color: 'var(--muted)' }}>
          {rowMeta(opportunity)}
        </p>
      </div>

      {opportunity.reach === 'local' && (
        <div className="shrink-0 self-center">
          <NotOnlineStamp />
        </div>
      )}
    </Link>
  );
}
