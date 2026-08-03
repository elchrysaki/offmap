import 'dotenv/config'

import { readFile, readdir, writeFile } from 'node:fs/promises'
import { dirname, extname, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

import { isValidCategoryPair } from '@offmap/taxonomy'
import type { Payload } from 'payload'
import YAML from 'yaml'

import type { Opportunity } from '../payload-types'

const here = dirname(fileURLToPath(import.meta.url))
const repositoryRoot = process.env.OFFMAP_REPOSITORY_ROOT || resolve(here, '../../../..')
const reportPath = resolve(repositoryRoot, 'apps/cms/migrations/legacy-report.json')

type LegacyText = string | null | undefined
type LegacyValueList = LegacyText[] | null | undefined

export type LegacyOpportunity = {
  slug: string
  title: string
  organizer: string
  main_category: string
  category: string
  edition?: LegacyText
  status: 'published' | 'archived'
  summary: string
  format?: LegacyText
  location?: {
    display?: LegacyText
    host_city?: LegacyText
    host_country?: LegacyText
    host_country_code?: LegacyText
  }
  dates?: {
    application_deadline?: { raw?: LegacyText; display?: LegacyText; normalized?: LegacyText }
    start_date?: { display?: LegacyText; normalized?: LegacyText }
    end_date?: { display?: LegacyText; normalized?: LegacyText }
  }
  eligibility?: {
    geographic_regions?: LegacyValueList
    eligible_countries?: LegacyValueList
    academic_levels?: LegacyValueList
    broad_fields?: LegacyValueList
    specific_majors?: LegacyValueList
    nationality_or_residency_rules?: LegacyText
    age_requirements?: LegacyText
    experience_requirements?: LegacyText
    language_requirements?: LegacyText
    display_points?: LegacyValueList
  }
  audience?: {
    classification_source?: LegacyText
    groups?: LegacyValueList
    display_points?: LegacyValueList
  }
  funding?: {
    application_fee?: LegacyText
    participation_fee?: LegacyText
    scholarship?: LegacyText
    travel_support?: LegacyText
    accommodation?: LegacyText
    meals?: LegacyText
    stipend_or_salary?: LegacyText
    prizes?: LegacyText
    visa_support?: LegacyText
    accessibility_support?: LegacyText
    other_support?: LegacyValueList
    display_points?: LegacyValueList
  }
  application?: {
    official_page?: LegacyText
    application_page?: LegacyText
    requirements?: LegacyValueList
    display_points?: LegacyValueList
  }
  program?: {
    activities?: LegacyValueList
    benefits?: LegacyValueList
    topics?: LegacyValueList
  }
  filters?: { funding_features?: LegacyValueList }
  verification?: Record<string, unknown> & { approved_by?: LegacyText }
  submission?: { issue_number?: number; issue_url?: LegacyText }
  provenance?: Record<string, unknown> & {
    researched_at?: LegacyText
    published_at?: LegacyText
    generated_at?: LegacyText
  }
  archival?: Record<string, unknown>
}

type MigrationReport = {
  expected: { published: 23; archived: 2 }
  discovered: { published: number; archived: number; total: number }
  duplicates: string[]
  missingApplicationLinks: string[]
  unnormalizedDeadlines: string[]
  missingFunding: string[]
  categoryMismatches: string[]
  representativeRecords: string[]
}

const compact = (items: LegacyValueList): string[] =>
  (items ?? []).filter(
    (value): value is string => typeof value === 'string' && value.trim().length > 0,
  )
const rows = (items: LegacyValueList) => compact(items).map((value) => ({ value }))
const nullable = (value: LegacyText): string | null => (value?.trim() ? value.trim() : null)

async function markdownFiles(root: string): Promise<string[]> {
  const entries = await readdir(root, { withFileTypes: true })
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const path = resolve(root, entry.name)
      if (entry.isDirectory()) return markdownFiles(path)
      return extname(entry.name) === '.md' ? [path] : []
    }),
  )
  return nested.flat().sort()
}

export function parseArchivedMetadata(markdown: string, sourcePath: string): LegacyOpportunity {
  const match = markdown.match(/<!-- OFFMAP-METADATA\n([\s\S]*?)\nOFFMAP-METADATA-END -->/)
  if (!match?.[1]) throw new Error(`No OFFMAP metadata block in ${sourcePath}`)
  return YAML.parse(match[1]) as LegacyOpportunity
}

export async function readLegacySources(): Promise<LegacyOpportunity[]> {
  const index = JSON.parse(
    await readFile(resolve(repositoryRoot, 'data/opportunities.json'), 'utf8'),
  ) as { opportunities?: LegacyOpportunity[] }
  if (!index.opportunities) throw new Error('data/opportunities.json is missing opportunities.')
  const archivePaths = await markdownFiles(resolve(repositoryRoot, 'opportunities/archive'))
  const archived = await Promise.all(
    archivePaths.map(async (path) => parseArchivedMetadata(await readFile(path, 'utf8'), path)),
  )
  return [...index.opportunities, ...archived]
}

function normalizedDate(value: LegacyText, endOfDay = false): string | null {
  if (!value) return null
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return `${value}T${endOfDay ? '23:59:59.999' : '00:00:00.000'}Z`
  }
  const parsed = new Date(value)
  return Number.isNaN(parsed.valueOf()) ? null : parsed.toISOString()
}

function academicLevels(
  values: LegacyValueList,
): NonNullable<Opportunity['eligibility']>['academicLevels'] {
  type AcademicLevel = NonNullable<
    NonNullable<Opportunity['eligibility']>['academicLevels']
  >[number]
  const aliases: Record<string, AcademicLevel> = {
    bachelor: 'undergraduate',
    undergraduate: 'undergraduate',
    master: 'graduate',
    graduate: 'graduate',
    phd: 'doctoral',
    doctoral: 'doctoral',
    postdoctoral: 'postdoctoral',
    'early-career': 'early-career',
  }
  return compact(values)
    .map((value) => aliases[value])
    .filter((value) => value !== undefined)
}

function fundingLabels(
  record: LegacyOpportunity,
): NonNullable<Opportunity['funding']>['filterLabels'] {
  type FundingLabel = NonNullable<NonNullable<Opportunity['funding']>['filterLabels']>[number]
  const result = new Set<FundingLabel>()
  for (const feature of compact(record.filters?.funding_features)) {
    if (['no-application-fee', 'no-participation-fee'].includes(feature)) result.add('free')
    if (feature === 'grant-prize') result.add('prizes')
    if (feature === 'subsidized-accommodation') result.add('accommodation')
    if (feature === 'subsidized-meals') result.add('meals')
  }
  return [...result]
}

function verificationTimestamp(record: LegacyOpportunity): string {
  const value =
    record.provenance?.researched_at ||
    record.provenance?.published_at ||
    record.provenance?.generated_at
  return normalizedDate(value) || '2026-07-01T00:00:00.000Z'
}

function moderationFlags(record: LegacyOpportunity): Opportunity['moderationFlags'] {
  const flags = new Set<NonNullable<Opportunity['moderationFlags']>[number]>()
  if (!record.application?.application_page) flags.add('missing-application-link')
  const deadline = record.dates?.application_deadline
  if ((deadline?.raw || deadline?.display) && !deadline?.normalized)
    flags.add('unnormalized-deadline')
  const funding = record.funding
  const fundingFacts = [
    funding?.application_fee,
    funding?.participation_fee,
    funding?.scholarship,
    funding?.travel_support,
    funding?.accommodation,
    funding?.meals,
    funding?.stipend_or_salary,
    funding?.prizes,
    funding?.visa_support,
    funding?.accessibility_support,
    ...compact(funding?.other_support),
  ]
  if (fundingFacts.every((value) => !value)) flags.add('missing-funding')
  if (!isValidCategoryPair(record.main_category, record.category)) flags.add('category-mismatch')
  if (record.status === 'archived') flags.add('expired')
  return [...flags]
}

function details(record: LegacyOpportunity): NonNullable<Opportunity['details']> {
  const sections = [
    ['Eligibility', compact(record.eligibility?.display_points)],
    ['Funding and support', compact(record.funding?.display_points)],
    ['Application', compact(record.application?.display_points)],
  ] as const
  return sections
    .filter(([, points]) => points.length > 0)
    .map(([heading, points]) => ({ heading, body: points.join('\n\n') }))
}

export function mapLegacyOpportunity(
  record: LegacyOpportunity,
): Omit<Opportunity, 'id' | 'createdAt' | 'updatedAt'> {
  const checkedAt = verificationTimestamp(record)
  const officialUrl = nullable(record.application?.official_page)
  if (!officialUrl || !['http:', 'https:'].includes(new URL(officialUrl).protocol)) {
    throw new Error(`${record.slug}: safe official URL is required`)
  }
  const hasDateOnly = [
    record.dates?.application_deadline?.normalized,
    record.dates?.start_date?.normalized,
    record.dates?.end_date?.normalized,
  ].some((value) => value && /^\d{4}-\d{2}-\d{2}$/.test(value))
  const eligibilityNotes = [
    record.eligibility?.nationality_or_residency_rules,
    record.eligibility?.age_requirements,
    record.eligibility?.experience_requirements,
    record.eligibility?.language_requirements,
  ]
    .filter((value): value is string => Boolean(value))
    .join('\n\n')

  return {
    slug: record.slug,
    title: record.title,
    organizer: record.organizer,
    edition: nullable(record.edition),
    summary: record.summary,
    details: details(record),
    featured: false,
    mainCategory: record.main_category as Opportunity['mainCategory'],
    category: record.category as Opportunity['category'],
    format: (record.format || 'not-confirmed') as Opportunity['format'],
    audienceGroups: compact(record.audience?.groups) as Opportunity['audienceGroups'],
    audienceClassificationSource:
      record.audience?.classification_source === 'legacy-explicit'
        ? 'legacy-explicit'
        : 'submitted-dropdown-only',
    dates: {
      timezone: hasDateOnly ? 'Date only; exact timezone not confirmed' : null,
      rolling: false,
      applicationDeadlineAt: normalizedDate(record.dates?.application_deadline?.normalized, true),
      applicationDeadlineDisplay: nullable(record.dates?.application_deadline?.display),
      applicationDeadlineRaw: nullable(record.dates?.application_deadline?.raw),
      startAt: normalizedDate(record.dates?.start_date?.normalized),
      startDisplay: nullable(record.dates?.start_date?.display),
      endAt: normalizedDate(record.dates?.end_date?.normalized, true),
      endDisplay: nullable(record.dates?.end_date?.display),
    },
    location: {
      display: nullable(record.location?.display) || 'Not confirmed',
      city: nullable(record.location?.host_city),
      country: nullable(record.location?.host_country),
      countryCode: nullable(record.location?.host_country_code),
      region: null,
    },
    eligibility: {
      summary: eligibilityNotes || null,
      geographicRegions: rows(record.eligibility?.geographic_regions),
      eligibleCountries: rows(record.eligibility?.eligible_countries),
      academicLevels: academicLevels(record.eligibility?.academic_levels),
      fields: [],
      majors: rows(record.eligibility?.specific_majors),
      requirements: rows(record.application?.requirements),
    },
    funding: {
      applicationFee: nullable(record.funding?.application_fee),
      participationFee: nullable(record.funding?.participation_fee),
      scholarship: nullable(record.funding?.scholarship),
      travelSupport: nullable(record.funding?.travel_support),
      accommodation: nullable(record.funding?.accommodation),
      meals: nullable(record.funding?.meals),
      stipendOrSalary: nullable(record.funding?.stipend_or_salary),
      prizes: nullable(record.funding?.prizes),
      visaSupport: nullable(record.funding?.visa_support),
      accessibilitySupport: nullable(record.funding?.accessibility_support),
      otherSupport: rows(record.funding?.other_support),
      filterLabels: fundingLabels(record),
    },
    officialUrl,
    applicationUrl: nullable(record.application?.application_page),
    activities: rows(record.program?.activities),
    benefits: rows(record.program?.benefits),
    topics: rows(record.program?.topics),
    sources: [
      {
        url: officialUrl,
        label: 'Legacy reviewed official page',
        checkedAt,
        supportedFields: [{ value: 'legacyRecord' }],
        reviewer: nullable(record.verification?.approved_by),
      },
    ],
    lastVerifiedAt: checkedAt,
    legacy: {
      slug: record.slug,
      sourceIssue: record.submission?.issue_number ? String(record.submission.issue_number) : null,
      publicationReview: record.verification ?? null,
      verificationNotes: {
        provenance: record.provenance ?? null,
        archival: record.archival ?? null,
        sourceIssueUrl: record.submission?.issue_url ?? null,
      },
      importedAt: '2026-08-02T00:00:00.000Z',
      archived: record.status === 'archived',
      rawRecord: record,
    },
    moderationFlags: moderationFlags(record),
    _status: record.status === 'published' ? 'published' : 'draft',
  }
}

export function buildMigrationReport(records: LegacyOpportunity[]): MigrationReport {
  const slugs = records.map((record) => record.slug)
  const duplicates = [
    ...new Set(slugs.filter((slug, index) => slugs.indexOf(slug) !== index)),
  ].sort()
  return {
    expected: { published: 23, archived: 2 },
    discovered: {
      published: records.filter((record) => record.status === 'published').length,
      archived: records.filter((record) => record.status === 'archived').length,
      total: records.length,
    },
    duplicates,
    missingApplicationLinks: records
      .filter((record) => !record.application?.application_page)
      .map((record) => record.slug)
      .sort(),
    unnormalizedDeadlines: records
      .filter((record) => {
        const deadline = record.dates?.application_deadline
        return Boolean((deadline?.raw || deadline?.display) && !deadline?.normalized)
      })
      .map((record) => record.slug)
      .sort(),
    missingFunding: records
      .filter((record) => moderationFlags(record)?.includes('missing-funding'))
      .map((record) => record.slug)
      .sort(),
    categoryMismatches: records
      .filter((record) => !isValidCategoryPair(record.main_category, record.category))
      .map((record) => `${record.slug}: ${record.main_category}/${record.category}`)
      .sort(),
    representativeRecords: [records[0]?.slug, records.at(-1)?.slug].filter(
      (value): value is string => Boolean(value),
    ),
  }
}

function assertReport(report: MigrationReport): void {
  if (
    report.discovered.published !== report.expected.published ||
    report.discovered.archived !== report.expected.archived
  ) {
    throw new Error(
      `Legacy count mismatch: ${report.discovered.published} published and ${report.discovered.archived} archived.`,
    )
  }
  if (report.duplicates.length)
    throw new Error(`Duplicate legacy slugs: ${report.duplicates.join(', ')}`)
  if (report.categoryMismatches.length)
    throw new Error(`Category mismatches: ${report.categoryMismatches.join(', ')}`)
}

export async function writeLegacyRecords(payload: Payload, records: LegacyOpportunity[]) {
  let created = 0
  let skipped = 0
  for (const record of records) {
    const existing = await payload.find({
      collection: 'opportunities',
      where: { slug: { equals: record.slug } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })
    if (existing.docs.length) {
      skipped += 1
      continue
    }
    await payload.create({
      collection: 'opportunities',
      overrideAccess: true,
      context: { legacyMigration: true },
      draft: record.status !== 'published',
      data: mapLegacyOpportunity(record),
    })
    created += 1
  }
  return { created, skipped }
}

export async function runLegacyMigration(mode: 'check' | 'report' | 'write') {
  const records = await readLegacySources()
  records.forEach(mapLegacyOpportunity)
  const report = buildMigrationReport(records)
  assertReport(report)
  if (mode === 'report') {
    await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8')
  }
  let writeResult: Awaited<ReturnType<typeof writeLegacyRecords>> | undefined
  if (mode === 'write') {
    const [{ getPayload }, { default: config }] = await Promise.all([
      import('payload'),
      import('../payload.config'),
    ])
    writeResult = await writeLegacyRecords(await getPayload({ config }), records)
  }
  return { report, writeResult }
}

export async function importLegacyOpportunities(payload: Payload) {
  const records = await readLegacySources()
  records.forEach(mapLegacyOpportunity)
  const report = buildMigrationReport(records)
  assertReport(report)
  return { report, writeResult: await writeLegacyRecords(payload, records) }
}

const isEntrypoint = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href
if (isEntrypoint) {
  const mode = process.argv.includes('--write')
    ? 'write'
    : process.argv.includes('--report')
      ? 'report'
      : 'check'
  const result = await runLegacyMigration(mode)
  console.log(JSON.stringify(result, null, 2))
  process.exit(0)
}
