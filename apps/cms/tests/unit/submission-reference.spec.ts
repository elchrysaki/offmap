import { submissionAcceptedSchema } from '@offmap/contracts'
import { describe, expect, it } from 'vitest'

import { submissionReference } from '@/lib/submission-reference'

describe('submissionReference', () => {
  it('produces a stable public reference that satisfies the response contract', () => {
    const reference = submissionReference(1)

    expect(reference).toBe('OF-000001')
    expect(
      submissionAcceptedSchema.parse({
        accepted: true,
        reference,
        message: 'Queued for human review.',
      }).reference,
    ).toBe(reference)
  })
})
