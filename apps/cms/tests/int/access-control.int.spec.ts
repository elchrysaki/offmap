import type { Opportunity, User } from '@/payload-types'
import config from '@/payload.config'
import { getPayload, type Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

let payload: Payload
let admin: User
let editor: User
const createdOpportunityIds: Array<string | number> = []
const suffix = `${Date.now()}-${Math.random().toString(16).slice(2)}`

function opportunityData(
  slug: string,
  title: string,
): Omit<Opportunity, 'id' | 'createdAt' | 'updatedAt'> {
  return {
    slug,
    title,
    organizer: 'OffMap test organizer',
    edition: null,
    summary: 'A deterministic record used to verify OffMap editorial access boundaries.',
    details: [],
    featured: false,
    mainCategory: 'events',
    category: 'conference',
    format: 'online',
    audienceGroups: [],
    audienceClassificationSource: 'submitted-dropdown-only',
    dates: {
      timezone: null,
      rolling: false,
      applicationDeadlineAt: null,
      applicationDeadlineDisplay: 'Not confirmed',
      applicationDeadlineRaw: 'Not confirmed',
      startAt: null,
      startDisplay: null,
      endAt: null,
      endDisplay: null,
    },
    location: {
      display: 'Online',
      city: null,
      country: null,
      countryCode: null,
      region: null,
    },
    eligibility: {
      summary: null,
      geographicRegions: [],
      eligibleCountries: [],
      academicLevels: [],
      fields: [],
      majors: [],
      requirements: [],
    },
    funding: {
      applicationFee: null,
      participationFee: null,
      scholarship: null,
      travelSupport: null,
      accommodation: null,
      meals: null,
      stipendOrSalary: null,
      prizes: null,
      visaSupport: null,
      accessibilitySupport: null,
      otherSupport: [],
      filterLabels: [],
    },
    officialUrl: 'https://example.org/opportunity',
    applicationUrl: null,
    activities: [],
    benefits: [],
    topics: [],
    sources: [
      {
        url: 'https://example.org/opportunity',
        label: 'Test official source',
        checkedAt: new Date().toISOString(),
        supportedFields: [{ value: 'title' }],
        reviewer: 'Automated test',
      },
    ],
    lastVerifiedAt: new Date().toISOString(),
    moderationFlags: [],
    _status: 'draft',
  }
}

describe.sequential('Payload editorial access control', () => {
  beforeAll(async () => {
    payload = await getPayload({ config })
    admin = await payload.create({
      collection: 'users',
      overrideAccess: true,
      context: { adminSeed: true },
      data: {
        email: `admin-${suffix}@example.org`,
        password: 'test-admin-password-12345',
        name: 'Test Admin',
        role: 'admin',
      },
    })
    editor = await payload.create({
      collection: 'users',
      overrideAccess: true,
      context: { adminSeed: true },
      data: {
        email: `editor-${suffix}@example.org`,
        password: 'test-editor-password-12345',
        name: 'Test Editor',
        role: 'editor',
      },
    })
  })

  afterAll(async () => {
    for (const id of createdOpportunityIds) {
      await payload.delete({ collection: 'opportunities', id, overrideAccess: true })
    }
    if (editor?.id)
      await payload.delete({ collection: 'users', id: editor.id, overrideAccess: true })
    if (admin?.id) await payload.delete({ collection: 'users', id: admin.id, overrideAccess: true })
  })

  it('lets an editor create a draft but not publish or delete it', async () => {
    const draft = await payload.create({
      collection: 'opportunities',
      data: opportunityData(`editor-draft-${suffix}`, 'Editor draft'),
      draft: true,
      overrideAccess: false,
      user: editor,
    })
    createdOpportunityIds.push(draft.id)
    expect(draft._status).toBe('draft')

    await expect(
      payload.update({
        collection: 'opportunities',
        id: draft.id,
        data: { _status: 'published' },
        draft: false,
        overrideAccess: false,
        user: editor,
      }),
    ).rejects.toThrow(/Only an admin can publish/i)

    await expect(
      payload.delete({
        collection: 'opportunities',
        id: draft.id,
        overrideAccess: false,
        user: editor,
      }),
    ).rejects.toThrow()
  })

  it('excludes drafts from anonymous reads and lets an admin publish explicitly', async () => {
    const draft = await payload.create({
      collection: 'opportunities',
      data: opportunityData(`admin-draft-${suffix}`, 'Admin draft'),
      draft: true,
      overrideAccess: false,
      user: admin,
    })
    createdOpportunityIds.push(draft.id)

    const hidden = await payload.find({
      collection: 'opportunities',
      where: { id: { equals: draft.id } },
      draft: false,
      overrideAccess: false,
    })
    expect(hidden.totalDocs).toBe(0)

    const published = await payload.update({
      collection: 'opportunities',
      id: draft.id,
      data: { _status: 'published' },
      draft: false,
      overrideAccess: false,
      user: admin,
    })
    expect(published._status).toBe('published')

    const visible = await payload.find({
      collection: 'opportunities',
      where: { id: { equals: draft.id } },
      draft: false,
      overrideAccess: false,
    })
    expect(visible.totalDocs).toBe(1)
  })

  it('prevents an editor from escalating their own role', async () => {
    const updated = await payload.update({
      collection: 'users',
      id: editor.id,
      data: { role: 'admin' },
      overrideAccess: false,
      user: editor,
    })
    expect(updated.role).toBe('editor')
  })
})
