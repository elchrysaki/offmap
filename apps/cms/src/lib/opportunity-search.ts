import type { OpportunityQuery } from '@offmap/contracts'

import type { Opportunity } from '../payload-types'
import { opportunityToCard } from './opportunity-dto'

export function filterOpportunities(
  documents: Opportunity[],
  query: OpportunityQuery,
  closingSoonDays: number,
) {
  const needle = query.query?.toLocaleLowerCase()
  return documents
    .map((document) => ({ document, card: opportunityToCard(document, { closingSoonDays }) }))
    .filter(({ document, card }) => {
      if (
        needle &&
        ![document.title, document.organizer, document.summary].some((value) =>
          value.toLocaleLowerCase().includes(needle),
        )
      )
        return false
      if (query.mainCategory && document.mainCategory !== query.mainCategory) return false
      if (query.category && document.category !== query.category) return false
      if (query.format && document.format !== query.format) return false
      if (query.country && document.location.country !== query.country) return false
      if (query.region && document.location.region !== query.region) return false
      if (
        query.academicLevel &&
        !document.eligibility?.academicLevels?.includes(query.academicLevel)
      )
        return false
      if (query.field && !document.eligibility?.fields?.includes(query.field)) return false
      if (query.funding && !document.funding?.filterLabels?.includes(query.funding)) return false
      if (query.availability && card.availability !== query.availability) return false
      return true
    })
}

export function sortOpportunities<T extends ReturnType<typeof filterOpportunities>[number]>(
  items: T[],
  sort: OpportunityQuery['sort'],
): T[] {
  const time = (value: string | null) => (value ? new Date(value).valueOf() : Number.MAX_VALUE)
  return [...items].sort((a, b) => {
    if (sort === 'deadline')
      return time(a.card.applicationDeadline) - time(b.card.applicationDeadline)
    if (sort === 'newest')
      return new Date(b.document.createdAt).valueOf() - new Date(a.document.createdAt).valueOf()
    if (sort === 'verified') return time(b.card.lastVerifiedAt) - time(a.card.lastVerifiedAt)
    return (
      Number(b.card.featured) - Number(a.card.featured) ||
      time(a.card.applicationDeadline) - time(b.card.applicationDeadline)
    )
  })
}

type Facets = {
  mainCategories: Record<string, number>
  categories: Record<string, number>
  formats: Record<string, number>
  countries: Record<string, number>
  academicLevels: Record<string, number>
  fields: Record<string, number>
  funding: Record<string, number>
  availability: Record<string, number>
}

const add = (target: Record<string, number>, value: string | null | undefined) => {
  if (value) target[value] = (target[value] ?? 0) + 1
}

export function buildFacets(items: ReturnType<typeof filterOpportunities>): Facets {
  const facets: Facets = {
    mainCategories: {},
    categories: {},
    formats: {},
    countries: {},
    academicLevels: {},
    fields: {},
    funding: {},
    availability: {},
  }
  for (const { card, document } of items) {
    add(facets.mainCategories, card.mainCategory)
    add(facets.categories, card.category)
    add(facets.formats, card.format)
    add(facets.countries, card.location.country)
    add(facets.availability, card.availability)
    document.eligibility?.academicLevels?.forEach((value) => add(facets.academicLevels, value))
    document.eligibility?.fields?.forEach((value) => add(facets.fields, value))
    card.fundingLabels.forEach((value) => add(facets.funding, value))
  }
  return facets
}
