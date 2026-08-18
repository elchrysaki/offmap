// The countdown numeral (CLAUDE.md §7, signature element 1). The slot is
// never empty — the rhythm never breaks. Vermilion 1–13 days, ink 14–60,
// muted 61+. `rolling` renders ROLLING, `opens_soon` renders OPENS <month>.
type Props = {
  daysRemaining: number | null;
  status: string | null;
  opensAt: string | null;
};

function colorFor(daysRemaining: number | null) {
  if (daysRemaining === null) return 'var(--muted)';
  if (daysRemaining <= 13) return 'var(--vermilion)';
  if (daysRemaining <= 60) return 'var(--ink)';
  return 'var(--muted)';
}

export function CountdownNumeral({ daysRemaining, status, opensAt }: Props) {
  if (status === 'rolling') {
    return (
      <span
        className="font-[family-name:var(--font-fraunces)] text-[15px] leading-none font-extrabold"
        style={{ color: 'var(--muted)' }}
        aria-label="Rolling deadline"
      >
        ROLLING
      </span>
    );
  }

  if (status === 'opens_soon' && opensAt) {
    const month = new Date(opensAt).toLocaleDateString('en-GB', { month: 'short', timeZone: 'UTC' });
    return (
      <span
        className="font-[family-name:var(--font-fraunces)] text-[15px] leading-none font-extrabold uppercase"
        style={{ color: 'var(--muted)' }}
        aria-label={`Opens ${month}`}
      >
        OPENS {month.toUpperCase()}
      </span>
    );
  }

  return (
    <span
      className="font-[family-name:var(--font-fraunces)] text-[32px] leading-none font-extrabold tabular-nums"
      style={{ color: colorFor(daysRemaining) }}
      aria-label={daysRemaining !== null ? `${daysRemaining} days remaining` : 'Deadline unknown'}
    >
      {daysRemaining ?? '—'}
    </span>
  );
}
