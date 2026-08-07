import { researchProposalSchema } from '@offmap/contracts'
import { isValidCategoryPair } from '@offmap/taxonomy'
import { NextResponse } from 'next/server'
import { getPayload } from 'payload'

import { roleOf } from '@/access/roles'
import { apiError, requestIdFrom } from '@/lib/api-response'
import config from '@/payload.config'
import type { Opportunity } from '@/payload-types'

const values = (items: string[]) => items.map((value) => ({ value }))
const slugify = (value: string) =>
  value
    .normalize('NFKD')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 120)

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const requestId = requestIdFrom(request)
  try {
    const payload = await getPayload({ config })
    const { user } = await payload.auth({ headers: request.headers })
    if (roleOf(user) !== 'admin')
      return apiError(
        403,
        'ADMIN_REQUIRED',
        'Only an admin can create a draft from AI research.',
        requestId,
      )

    const { id } = await context.params
    const run = await payload.findByID({
      collection: 'research-runs',
      id,
      overrideAccess: true,
      depth: 0,
    })
    if (run.status !== 'succeeded')
      return apiError(
        409,
        'RESEARCH_FAILED',
        'Only successful research can become a draft.',
        requestId,
      )
    if (run.opportunity)
      return apiError(
        409,
        'ALREADY_MATERIALIZED',
        'This research run already has a draft.',
        requestId,
      )

    const proposal = researchProposalSchema.parse(run.proposal)
    if (!isValidCategoryPair(proposal.mainCategory, proposal.category)) {
      return apiError(
        409,
        'CATEGORY_REVIEW_REQUIRED',
        'Review the proposed category pair first.',
        requestId,
      )
    }
    const submissionId = typeof run.submission === 'number' ? run.submission : run.submission.id
    const submission = await payload.findByID({
      collection: 'submissions',
      id: submissionId,
      overrideAccess: true,
      depth: 0,
    })
    if (submission.linkedOpportunity) {
      return apiError(
        409,
        'ALREADY_MATERIALIZED',
        'This submission already has a linked draft.',
        requestId,
      )
    }
    const slug = `${slugify(proposal.title)}-${submission.id}`
    const draft = await payload.create({
      collection: 'opportunities',
      overrideAccess: true,
      context: { adminMaterialize: true },
      draft: true,
      data: {
        slug,
        title: proposal.title,
        organizer: proposal.organizer || 'Not confirmed',
        edition: proposal.edition,
        summary: proposal.summary,
        details: [],
        featured: false,
        mainCategory: proposal.mainCategory as Opportunity['mainCategory'],
        category: proposal.category as Opportunity['category'],
        format: proposal.format || 'not-confirmed',
        audienceGroups: [],
        audienceClassificationSource: 'submitted-dropdown-only',
        dates: {
          timezone: proposal.dates.timezone,
          rolling: Boolean(proposal.dates.rolling),
          applicationDeadlineAt: proposal.dates.applicationDeadline,
          startAt: proposal.dates.startAt,
          endAt: proposal.dates.endAt,
        },
        location: proposal.location || {
          display: 'Not confirmed',
          city: null,
          country: null,
          countryCode: null,
          region: null,
        },
        eligibility: {
          summary: proposal.eligibilitySummary,
          geographicRegions: [],
          eligibleCountries: [],
          academicLevels: [],
          fields: [],
          majors: [],
          requirements: [],
        },
        funding: { ...proposal.funding, otherSupport: values(proposal.funding.otherSupport) },
        officialUrl: proposal.officialUrl,
        applicationUrl: proposal.applicationUrl,
        activities: [],
        benefits: [],
        topics: [],
        sources: proposal.citations.map((source) => ({
          ...source,
          supportedFields: values(source.supportedFields),
        })),
        lastVerifiedAt: new Date().toISOString(),
        moderationFlags: proposal.unsupportedFields.length ? ['needs-verification'] : [],
        _status: 'draft',
      },
    })
    await payload.update({
      collection: 'submissions',
      id: submission.id,
      overrideAccess: true,
      data: { status: 'in-review', linkedOpportunity: draft.id },
    })
    // Research runs are immutable. The relationship is recorded on the submission and opportunity draft.
    return NextResponse.json(
      { created: true, opportunityId: draft.id, slug: draft.slug },
      { status: 201 },
    )
  } catch (error) {
    return apiError(
      400,
      'DRAFT_NOT_CREATED',
      'The research proposal needs review.',
      requestId,
      error,
    )
  }
}
