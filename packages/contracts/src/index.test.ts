import { describe, expect, it } from 'vitest';

import { httpUrlSchema, opportunityCardSchema, submissionInputSchema } from './index';

describe('public boundary schemas', () => {
  it('rejects non-http source URLs', () => {
    expect(() => httpUrlSchema.parse('javascript:alert(1)')).toThrow();
    expect(() => httpUrlSchema.parse('file:///etc/passwd')).toThrow();
    expect(httpUrlSchema.parse('https://example.edu/opportunity')).toBe(
      'https://example.edu/opportunity',
    );
  });

  it('requires explicit submission consent and an empty honeypot', () => {
    const base = {
      sourceUrl: 'https://example.edu/opportunity',
      title: 'Student opportunity',
      mainCategory: 'events',
      note: '',
      contactEmail: '',
      consent: true as const,
      website: '',
    };

    expect(submissionInputSchema.parse(base)).toEqual(base);
    expect(() => submissionInputSchema.parse({ ...base, consent: false })).toThrow();
    expect(() => submissionInputSchema.parse({ ...base, website: 'spam.example' })).toThrow();
  });

  it('does not permit a mismatched category pair in a card', () => {
    expect(() =>
      opportunityCardSchema.parse({
        id: '1',
        slug: 'example',
        title: 'Example',
        organizer: 'Example Org',
        summary: 'A concrete opportunity for students.',
        mainCategory: 'events',
        category: 'internship',
        format: 'online',
        location: {
          display: 'Online',
          city: null,
          country: null,
          countryCode: null,
          region: null,
        },
        availability: 'open',
        applicationDeadline: null,
        applicationDeadlineDisplay: null,
        fundingLabels: [],
        audienceGroups: [],
        lastVerifiedAt: null,
        featured: false,
      }),
    ).toThrow();
  });
});
