import Link from 'next/link';

// Server-rendered pill bar — plain links, no client JS. Keeps other active
// params (rung, type) when switching country, per CLAUDE.md §7 filter rules.
export function CountryFilter({
  countries,
  active,
  otherParams,
}: {
  countries: string[];
  active?: string;
  otherParams: Record<string, string | undefined>;
}) {
  if (countries.length === 0) return null;

  const buildHref = (country?: string) => {
    const params = new URLSearchParams();
    Object.entries(otherParams).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    if (country) params.set('country', country);
    const qs = params.toString();
    return qs ? `/browse?${qs}` : '/browse';
  };

  return (
    <nav aria-label="Country" className="-mx-6 flex gap-2 overflow-x-auto px-6 pb-1">
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
        All countries
      </Link>
      {countries.map((country) => {
        const isActive = active === country;
        return (
          <Link
            key={country}
            href={buildHref(country)}
            aria-current={isActive ? 'true' : undefined}
            className="font-[family-name:var(--font-archivo)] shrink-0 px-3.5 py-1.5 text-[12px] font-bold whitespace-nowrap uppercase focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--cobalt)]"
            style={{
              borderRadius: 'var(--radius-pill)',
              border: 'var(--border-width) solid var(--ink)',
              background: isActive ? 'var(--ink)' : 'var(--card)',
              color: isActive ? 'var(--card)' : 'var(--ink)',
            }}
          >
            {country}
          </Link>
        );
      })}
    </nav>
  );
}
