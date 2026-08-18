// One date format everywhere (CLAUDE.md §8): `9 August 2026`.
export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

const FUNDING_LABEL: Record<string, string> = {
  fully_funded: 'Fully funded',
  partially_funded: 'Partially funded',
  unfunded: 'Unfunded',
};

const FORMAT_LABEL: Record<string, string> = {
  online: 'online',
  in_person: 'in person',
  hybrid: 'hybrid',
};

const PREP_TIME_LABEL: Record<string, string> = {
  under_an_hour: 'Under an hour',
  a_weekend: 'A weekend',
  longer: 'Longer prep',
};

export function fundingLabel(funding: string | null) {
  return funding ? (FUNDING_LABEL[funding] ?? funding) : null;
}

export function formatLabel(format: string | null) {
  return format ? (FORMAT_LABEL[format] ?? format) : null;
}

export function prepTimeLabel(prepTime: string | null) {
  return prepTime ? (PREP_TIME_LABEL[prepTime] ?? prepTime) : null;
}

export function locationLabel(hostCity: string | null, country: string | null, format: string | null) {
  if (format === 'online' && !hostCity) return 'Online';
  return [hostCity, country].filter(Boolean).join(', ') || null;
}

// Row meta line: "funding · eligibility · location, format" (CLAUDE.md §7 component rules).
export function rowMeta(o: {
  funding: string | null;
  eligibility: string | null;
  host_city: string | null;
  country: string | null;
  format: string | null;
}) {
  const parts = [fundingLabel(o.funding), o.eligibility].filter(Boolean) as string[];
  const location = locationLabel(o.host_city, o.country, o.format);
  const fmt = formatLabel(o.format);
  if (location) parts.push(fmt && fmt !== 'online' ? `${location}, ${fmt}` : location);
  return parts.join(' · ');
}
