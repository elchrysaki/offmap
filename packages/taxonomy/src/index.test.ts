import { describe, expect, it } from 'vitest';

import { categoryPairSchema, computeAvailability, isValidCategoryPair } from './index';

describe('category pairs', () => {
  it('accepts pairs that exist in the canonical taxonomy', () => {
    expect(isValidCategoryPair('events', 'conference')).toBe(true);
    expect(
      categoryPairSchema.parse({ mainCategory: 'internships', category: 'internship' }),
    ).toEqual({ mainCategory: 'internships', category: 'internship' });
  });

  it('rejects cross-category pairs', () => {
    expect(isValidCategoryPair('events', 'internship')).toBe(false);
    expect(() =>
      categoryPairSchema.parse({ mainCategory: 'events', category: 'internship' }),
    ).toThrow();
  });
});

describe('availability', () => {
  const now = new Date('2026-08-02T12:00:00.000Z');
  const verified = '2026-07-30T12:00:00.000Z';

  it('keeps rolling distinct from missing deadlines', () => {
    expect(computeAvailability({ now, rolling: true, lastVerifiedAt: verified })).toBe('rolling');
    expect(computeAvailability({ now, lastVerifiedAt: verified })).toBe('needs-verification');
  });

  it('computes closing-soon and expired without editorial duplication', () => {
    expect(
      computeAvailability({
        now,
        applicationDeadline: '2026-08-09T12:00:00.000Z',
        lastVerifiedAt: verified,
      }),
    ).toBe('closing-soon');
    expect(
      computeAvailability({
        now,
        endDate: '2026-07-01T12:00:00.000Z',
        lastVerifiedAt: verified,
      }),
    ).toBe('expired');
  });

  it('makes stale evidence take precedence', () => {
    expect(
      computeAvailability({ now, rolling: true, lastVerifiedAt: '2025-01-01T00:00:00.000Z' }),
    ).toBe('needs-verification');
  });
});
