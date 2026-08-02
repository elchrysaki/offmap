import { computeAvailability } from '@offmap/taxonomy'
import type { TaskConfig } from 'payload'

export type RefreshLifecycleTaskShape = {
  input: Record<string, never>
  output: { reviewed: number; flagged: number; contactsDeleted: number }
}

export const refreshLifecycleTask: TaskConfig<RefreshLifecycleTaskShape> = {
  slug: 'refresh-opportunity-lifecycle',
  label: 'Refresh opportunity lifecycle and privacy retention',
  inputSchema: [],
  outputSchema: [
    { name: 'reviewed', type: 'number', required: true },
    { name: 'flagged', type: 'number', required: true },
    { name: 'contactsDeleted', type: 'number', required: true },
  ],
  schedule: [{ cron: '0 10 2 * * *', queue: 'maintenance' }],
  retries: { attempts: 2, backoff: { type: 'exponential', delay: 30_000 } },
  handler: async ({ req }) => {
    const settings = await req.payload.findGlobal({
      slug: 'site-settings',
      depth: 0,
      overrideAccess: true,
    })
    const result = await req.payload.find({
      collection: 'opportunities',
      limit: 2_000,
      pagination: false,
      depth: 0,
      overrideAccess: true,
    })
    let flagged = 0
    for (const opportunity of result.docs) {
      const availability = computeAvailability({
        applicationDeadline: opportunity.dates?.applicationDeadlineAt,
        startDate: opportunity.dates?.startAt,
        endDate: opportunity.dates?.endAt,
        rolling: Boolean(opportunity.dates?.rolling),
        lastVerifiedAt: opportunity.lastVerifiedAt,
        closingSoonDays: settings.closingSoonDays,
      })
      const managed = new Set(['expired', 'stale', 'needs-verification'])
      const flags = new Set(opportunity.moderationFlags ?? [])
      for (const value of managed) flags.delete(value as 'expired')
      if (availability === 'expired') flags.add('expired')
      if (availability === 'needs-verification') flags.add('needs-verification')
      const next = [...flags]
      if (next.join('|') !== (opportunity.moderationFlags ?? []).join('|')) {
        flagged += 1
        await req.payload.update({
          collection: 'opportunities',
          id: opportunity.id,
          overrideAccess: true,
          context: { systemLifecycle: true },
          data: { moderationFlags: next },
        })
      }
    }

    const expiredContacts = await req.payload.find({
      collection: 'submissions',
      where: { contactDeleteAfter: { less_than_equal: new Date().toISOString() } },
      limit: 500,
      pagination: false,
      depth: 0,
      overrideAccess: true,
    })
    for (const submission of expiredContacts.docs) {
      await req.payload.update({
        collection: 'submissions',
        id: submission.id,
        overrideAccess: true,
        data: { contactEmail: null, contactDeleteAfter: null },
      })
    }

    return {
      output: {
        reviewed: result.docs.length,
        flagged,
        contactsDeleted: expiredContacts.docs.length,
      },
    }
  },
}
