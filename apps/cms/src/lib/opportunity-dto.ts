import {
  opportunityCardSchema,
  opportunityDetailSchema,
  type OpportunityCard,
  type OpportunityDetail,
} from '@offmap/contracts'
import { computeAvailability } from '@offmap/taxonomy'

import type { Opportunity } from '../payload-types'

const values = (items: { value: string }[] | null | undefined): string[] =>
  items?.map((item) => item.value).filter(Boolean) ?? []

const nullable = (value: string | null | undefined): string | null => value?.trim() || null

export function opportunityToCard(
  opportunity: Opportunity,
  options: { closingSoonDays?: number; now?: Date } = {},
): OpportunityCard {
  return opportunityCardSchema.parse({
    id: String(opportunity.id),
    slug: opportunity.slug,
    title: opportunity.title,
    organizer: opportunity.organizer,
    summary: opportunity.summary,
    mainCategory: opportunity.mainCategory,
    category: opportunity.category,
    format: opportunity.format,
    location: {
      display: opportunity.location.display,
      city: nullable(opportunity.location.city),
      country: nullable(opportunity.location.country),
      countryCode: nullable(opportunity.location.countryCode)?.toUpperCase() ?? null,
      region: nullable(opportunity.location.region),
    },
    availability: computeAvailability({
      now: options.now,
      applicationDeadline: opportunity.dates?.applicationDeadlineAt,
      startDate: opportunity.dates?.startAt,
      endDate: opportunity.dates?.endAt,
      rolling: Boolean(opportunity.dates?.rolling),
      lastVerifiedAt: opportunity.lastVerifiedAt,
      closingSoonDays: options.closingSoonDays,
    }),
    applicationDeadline: opportunity.dates?.applicationDeadlineAt ?? null,
    applicationDeadlineDisplay: nullable(opportunity.dates?.applicationDeadlineDisplay),
    fundingLabels: opportunity.funding?.filterLabels ?? [],
    audienceGroups: opportunity.audienceGroups ?? [],
    lastVerifiedAt: opportunity.lastVerifiedAt ?? null,
    featured: Boolean(opportunity.featured),
  })
}

export function opportunityToDetail(
  opportunity: Opportunity,
  options: { closingSoonDays?: number; now?: Date } = {},
): OpportunityDetail {
  const card = opportunityToCard(opportunity, options)
  return opportunityDetailSchema.parse({
    ...card,
    edition: nullable(opportunity.edition),
    details: opportunity.details?.map(({ heading, body }) => ({ heading, body })) ?? [],
    dates: {
      timezone: nullable(opportunity.dates?.timezone),
      rolling: Boolean(opportunity.dates?.rolling),
      startAt: opportunity.dates?.startAt ?? null,
      startDisplay: nullable(opportunity.dates?.startDisplay),
      endAt: opportunity.dates?.endAt ?? null,
      endDisplay: nullable(opportunity.dates?.endDisplay),
    },
    eligibility: {
      summary: nullable(opportunity.eligibility?.summary),
      geographicRegions: values(opportunity.eligibility?.geographicRegions),
      eligibleCountries: values(opportunity.eligibility?.eligibleCountries),
      academicLevels: opportunity.eligibility?.academicLevels ?? [],
      fields: opportunity.eligibility?.fields ?? [],
      majors: values(opportunity.eligibility?.majors),
      requirements: values(opportunity.eligibility?.requirements),
    },
    funding: {
      applicationFee: nullable(opportunity.funding?.applicationFee),
      participationFee: nullable(opportunity.funding?.participationFee),
      scholarship: nullable(opportunity.funding?.scholarship),
      travelSupport: nullable(opportunity.funding?.travelSupport),
      accommodation: nullable(opportunity.funding?.accommodation),
      meals: nullable(opportunity.funding?.meals),
      stipendOrSalary: nullable(opportunity.funding?.stipendOrSalary),
      prizes: nullable(opportunity.funding?.prizes),
      visaSupport: nullable(opportunity.funding?.visaSupport),
      accessibilitySupport: nullable(opportunity.funding?.accessibilitySupport),
      otherSupport: values(opportunity.funding?.otherSupport),
    },
    officialUrl: opportunity.officialUrl,
    applicationUrl: nullable(opportunity.applicationUrl),
    activities: values(opportunity.activities),
    benefits: values(opportunity.benefits),
    topics: values(opportunity.topics),
    sources: opportunity.sources.map((source) => ({
      url: source.url,
      label: source.label,
      checkedAt: source.checkedAt,
      supportedFields: values(source.supportedFields),
      reviewer: nullable(source.reviewer),
    })),
    provenance: {
      summary: opportunity.legacy?.slug
        ? `Migrated from the reviewed OffMap record “${opportunity.legacy.slug}”.`
        : 'Prepared and reviewed by OffMap editors.',
      legacySlug: nullable(opportunity.legacy?.slug),
      reviewedAt: opportunity.lastVerifiedAt ?? null,
    },
  })
}
