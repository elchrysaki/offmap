import Link from 'next/link';

type Option = { id: string; label_en: string };

// Generic single-select pill bar for the field/academic_level/geo_scope/
// audience_group/funding_feature taxonomies (CLAUDE.md §5 — each is a
// lookup table, multi-select at the schema level via a junction table, but
// browse filters one value at a time here, same pattern as
// country-filter.tsx/type-filter.tsx). Server-rendered, no client JS.
export function TaxonomyFilter({
  ariaLabel,
  allLabel,
  paramName,
  options,
  active,
  otherParams,
  clearParamValue,
}: {
  ariaLabel: string;
  allLabel: string;
  paramName: string;
  options: Option[];
  active?: string;
  otherParams: Record<string, string | undefined>;
  // Normally the "all" link just omits the param. When a default (e.g. an
  // onboarding-derived pick) is silently applying whenever the param is
  // absent, the "all" link needs to set the param to this value instead —
  // usually '' — so it reads as an explicit override rather than nothing.
  clearParamValue?: string;
}) {
  if (options.length === 0) return null;

  const buildHref = (id?: string) => {
    const params = new URLSearchParams();
    Object.entries(otherParams).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    if (id) {
      params.set(paramName, id);
    } else if (clearParamValue !== undefined) {
      params.set(paramName, clearParamValue);
    }
    const qs = params.toString();
    return qs ? `/browse?${qs}` : '/browse';
  };

  return (
    <nav
      aria-label={ariaLabel}
      className="no-scrollbar -mx-6 flex gap-2 overflow-x-auto px-6 pb-1"
      style={{ overflowAnchor: 'none' }}
    >
      <Link
        href={buildHref(undefined)}
        className="font-[family-name:var(--font-archivo)] shrink-0 px-3.5 py-1.5 text-[12px] font-bold whitespace-nowrap uppercase focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--cobalt)]"
        style={{
          borderRadius: 'var(--radius-pill)',
          border: 'var(--border-width) solid var(--ink)',
          background: !active ? 'var(--ink)' : 'var(--card)',
          color: !active ? 'var(--card)' : 'var(--ink)',
        }}
      >
        {allLabel}
      </Link>
      {options.map((option) => {
        const isActive = active === option.id;
        return (
          <Link
            key={option.id}
            href={buildHref(option.id)}
            aria-current={isActive ? 'true' : undefined}
            className="font-[family-name:var(--font-archivo)] shrink-0 px-3.5 py-1.5 text-[12px] font-bold whitespace-nowrap uppercase focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--cobalt)]"
            style={{
              borderRadius: 'var(--radius-pill)',
              border: 'var(--border-width) solid var(--ink)',
              background: isActive ? 'var(--ink)' : 'var(--card)',
              color: isActive ? 'var(--card)' : 'var(--ink)',
            }}
          >
            {option.label_en}
          </Link>
        );
      })}
    </nav>
  );
}
