import { CountryFilter } from '@/components/core/country-filter';
import { EffortLadder } from '@/components/core/effort-ladder';
import { OpportunityRow } from '@/components/core/opportunity-row';
import { SignInBanner } from '@/components/core/sign-in-banner';
import { TypeFilter } from '@/components/core/type-filter';
import { EmptyState } from '@/components/shell/empty-state';
import { getCurrentUserEmail } from '@/lib/queries/current-user';
import { getTypes } from '@/lib/queries/taxonomy';
import type { EffortRung } from '@/lib/queries/opportunities';
import { listBrowseOpportunities, listCountries } from '@/lib/queries/opportunities';

type SearchParams = Promise<{ rung?: string; country?: string; type?: string }>;

const VALID_RUNGS: EffortRung[] = ['coffee_break', 'weekend_trip', 'aim_higher', 'off_path'];

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

  const [opportunities, types, countries, email] = await Promise.all([
    listBrowseOpportunities({ rung, country: params.country, typeId: params.type }),
    getTypes(),
    listCountries(),
    getCurrentUserEmail(),
  ]);

  const typeLabels = new Map((types ?? []).map((t) => [t.id, t.label_en]));
  const rows = opportunities.filter((o): o is typeof o & { id: string } => o.id !== null);
  const newest = [...rows].slice(0, 3);
  const hasFilters = Boolean(rung || params.country || params.type);
  const activeTypeLabel = params.type ? typeLabels.get(params.type) : undefined;

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
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

      {!email && (
        <div className="mt-6">
          <SignInBanner />
        </div>
      )}

      <div className="mt-7">
        <CountryFilter
          countries={countries}
          active={params.country}
          otherParams={{ rung: params.rung, type: params.type }}
        />
      </div>

      <div className="mt-3">
        <TypeFilter
          types={types ?? []}
          active={params.type}
          otherParams={{ rung: params.rung, country: params.country }}
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
          <ul className="mt-3">
            {newest.map((opportunity) => (
              <li key={opportunity.id}>
                <OpportunityRow
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
        <ul className="mt-6">
          {rows.map((opportunity) => (
            <li key={opportunity.id}>
              <OpportunityRow
                opportunity={opportunity}
                typeLabel={typeLabels.get(opportunity.type_id ?? '')}
              />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
