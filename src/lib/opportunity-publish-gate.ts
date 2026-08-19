import type { Tables } from '@/lib/supabase/types';

// The database publish_gate CHECK constraint (supabase/migrations/20260816234558_init_schema.sql)
// is the real enforcement — this is only a UI-side preview of the same rule,
// so a moderator can see what's missing before a publish attempt bounces off
// the constraint. official_url is NOT NULL at the schema level for every row
// regardless of state, so it's never "missing" here. last_verified_at is
// stamped automatically by the publish action itself, so it's informational,
// not something anyone fills in by hand.
type GateRow = Pick<
  Tables<'opportunity'>,
  'funding' | 'eligibility' | 'reach' | 'prep_time' | 'apply_url'
>;

const GATE_FIELDS: { key: keyof GateRow; label: string }[] = [
  { key: 'apply_url', label: 'Apply URL' },
  { key: 'funding', label: 'Funding' },
  { key: 'eligibility', label: 'Eligibility' },
  { key: 'reach', label: 'Reach' },
  { key: 'prep_time', label: 'Prep time' },
];

export function getMissingPublishFields(opportunity: GateRow): string[] {
  return GATE_FIELDS.filter(({ key }) => {
    const value = opportunity[key];
    return value === null || value === undefined || value === '';
  }).map(({ label }) => label);
}
