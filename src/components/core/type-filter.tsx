import Link from 'next/link';

import { categoryColorVar } from '@/lib/colors';

type TypeOption = { id: string; label_en: string };

// Fields/types listed sideways (scrollable pill row), server-rendered.
// Category colour matches the same token used on rows/cards for that
// type_id (CLAUDE.md §7).
export function TypeFilter({
  types,
  active,
  otherParams,
}: {
  types: TypeOption[];
  active?: string;
  otherParams: Record<string, string | undefined>;
}) {
  if (types.length === 0) return null;

  const buildHref = (typeId?: string) => {
    const params = new URLSearchParams();
    Object.entries(otherParams).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    if (typeId) params.set('type', typeId);
    const qs = params.toString();
    return qs ? `/browse?${qs}` : '/browse';
  };

  return (
    <nav aria-label="Field" className="-mx-6 flex gap-2 overflow-x-auto px-6 pb-1">
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
        All fields
      </Link>
      {types.map((type) => {
        const isActive = active === type.id;
        return (
          <Link
            key={type.id}
            href={buildHref(type.id)}
            aria-current={isActive ? 'true' : undefined}
            className="font-[family-name:var(--font-archivo)] inline-flex shrink-0 items-center gap-1.5 px-3.5 py-1.5 text-[12px] font-bold whitespace-nowrap uppercase focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--cobalt)]"
            style={{
              borderRadius: 'var(--radius-pill)',
              border: 'var(--border-width) solid var(--ink)',
              background: isActive ? 'var(--ink)' : 'var(--card)',
              color: isActive ? 'var(--card)' : 'var(--ink)',
            }}
          >
            <span
              aria-hidden="true"
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ background: categoryColorVar(type.id) }}
            />
            {type.label_en}
          </Link>
        );
      })}
    </nav>
  );
}
