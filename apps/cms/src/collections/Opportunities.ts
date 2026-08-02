import {
  ACADEMIC_LEVELS,
  AUDIENCE_GROUPS,
  BROAD_FIELDS,
  CATEGORY_CATALOG,
  FORMATS,
  FUNDING_FILTERS,
  isValidCategoryPair,
} from '@offmap/taxonomy'
import type { CollectionBeforeChangeHook, CollectionConfig, Field } from 'payload'

import { isAdmin, isStaff, roleOf } from '../access/roles'

const textList = (name: string, label: string, maxRows = 50): Field => ({
  name,
  label,
  type: 'array',
  maxRows,
  fields: [{ name: 'value', type: 'text', required: true, maxLength: 500 }],
})

const nullableFundingField = (name: string, label: string): Field => ({
  name,
  label,
  type: 'textarea',
  maxLength: 1_000,
})

const enforceEditorialBoundary: CollectionBeforeChangeHook = ({ data, originalDoc, req }) => {
  const role = roleOf(req.user)
  const trustedMigration = req.context?.legacyMigration === true
  const trustedDraftAction = req.context?.adminMaterialize === true
  const trustedLifecycle = req.context?.systemLifecycle === true
  if (!role && !trustedMigration && !trustedDraftAction && !trustedLifecycle) {
    throw new Error('Authentication required.')
  }

  const mainCategory = String(data.mainCategory ?? originalDoc?.mainCategory ?? '')
  const category = String(data.category ?? originalDoc?.category ?? '')
  if (!isValidCategoryPair(mainCategory, category)) {
    throw new Error(`Invalid OffMap category pair: ${mainCategory}/${category}`)
  }

  const nextStatus = data._status ?? originalDoc?._status ?? 'draft'
  if (nextStatus === 'published' && role !== 'admin' && !trustedMigration && !trustedLifecycle) {
    throw new Error('Only an admin can publish an opportunity.')
  }
  if (
    originalDoc?._status === 'published' &&
    role !== 'admin' &&
    !trustedMigration &&
    !trustedLifecycle &&
    data._status !== 'draft'
  ) {
    throw new Error('Editors must create a draft instead of changing published content directly.')
  }

  if (data.legacy?.rawRecord && !originalDoc?.legacy?.rawRecord) {
    data.legacy.rawRecord = structuredClone(data.legacy.rawRecord)
  }
  return data
}

const mainCategoryOptions = Object.entries(CATEGORY_CATALOG).map(([value, definition]) => ({
  label: `${definition.emoji} ${definition.title}`,
  value,
}))
const categoryOptions = Object.entries(CATEGORY_CATALOG).flatMap(([mainCategory, definition]) =>
  Object.entries(definition.categories).map(([value, category]) => ({
    label: `${category.emoji} ${category.title} (${definition.title})`,
    value,
    mainCategory,
  })),
)

export const Opportunities: CollectionConfig = {
  slug: 'opportunities',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'organizer', 'mainCategory', '_status', 'lastVerifiedAt'],
    group: 'Editorial',
  },
  access: {
    create: isStaff,
    read: ({ req }) => (req.user ? true : { _status: { equals: 'published' } }),
    update: isStaff,
    delete: isAdmin,
  },
  hooks: {
    beforeChange: [enforceEditorialBoundary],
  },
  versions: {
    drafts: {
      autosave: { interval: 30_000 },
    },
    maxPerDoc: 100,
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Overview',
          fields: [
            {
              name: 'slug',
              type: 'text',
              required: true,
              unique: true,
              index: true,
              maxLength: 160,
            },
            { name: 'title', type: 'text', required: true, maxLength: 180 },
            { name: 'organizer', type: 'text', required: true, maxLength: 180 },
            { name: 'edition', type: 'text', maxLength: 100 },
            { name: 'summary', type: 'textarea', required: true, maxLength: 600 },
            {
              name: 'details',
              type: 'array',
              maxRows: 20,
              fields: [
                { name: 'heading', type: 'text', required: true, maxLength: 100 },
                { name: 'body', type: 'textarea', required: true, maxLength: 10_000 },
              ],
            },
            { name: 'featured', type: 'checkbox', defaultValue: false, index: true },
          ],
        },
        {
          label: 'Classification',
          fields: [
            {
              name: 'mainCategory',
              type: 'select',
              required: true,
              index: true,
              options: mainCategoryOptions,
            },
            {
              name: 'category',
              type: 'select',
              required: true,
              index: true,
              options: categoryOptions.map(({ label, value }) => ({ label, value })),
              validate: (
                value: unknown,
                { siblingData }: { siblingData?: Record<string, unknown> },
              ) => {
                if (!value || !siblingData?.mainCategory) return true
                return (
                  isValidCategoryPair(String(siblingData.mainCategory), String(value)) ||
                  'Category must belong to the selected main category.'
                )
              },
            },
            {
              name: 'format',
              type: 'select',
              required: true,
              index: true,
              options: FORMATS.map((value) => ({ label: value, value })),
            },
            {
              name: 'audienceGroups',
              type: 'select',
              hasMany: true,
              options: AUDIENCE_GROUPS.map((value) => ({ label: value, value })),
              admin: {
                description:
                  'Locked to explicit contributor selection. AI can warn but never alter it.',
              },
            },
            {
              name: 'audienceClassificationSource',
              type: 'select',
              required: true,
              defaultValue: 'submitted-dropdown-only',
              options: [
                { label: 'Submitted dropdown only', value: 'submitted-dropdown-only' },
                { label: 'Legacy explicit value', value: 'legacy-explicit' },
              ],
            },
          ],
        },
        {
          label: 'Dates & place',
          fields: [
            {
              name: 'dates',
              type: 'group',
              fields: [
                { name: 'timezone', type: 'text', maxLength: 100 },
                { name: 'rolling', type: 'checkbox', defaultValue: false },
                { name: 'applicationDeadlineAt', type: 'date', index: true },
                { name: 'applicationDeadlineDisplay', type: 'text', maxLength: 160 },
                { name: 'applicationDeadlineRaw', type: 'text', maxLength: 160 },
                { name: 'startAt', type: 'date', index: true },
                { name: 'startDisplay', type: 'text', maxLength: 160 },
                { name: 'endAt', type: 'date', index: true },
                { name: 'endDisplay', type: 'text', maxLength: 160 },
              ],
            },
            {
              name: 'location',
              type: 'group',
              fields: [
                { name: 'display', type: 'text', required: true, maxLength: 240 },
                { name: 'city', type: 'text', maxLength: 120 },
                { name: 'country', type: 'text', index: true, maxLength: 120 },
                { name: 'countryCode', type: 'text', minLength: 2, maxLength: 2 },
                { name: 'region', type: 'text', index: true, maxLength: 120 },
              ],
            },
          ],
        },
        {
          label: 'Eligibility & support',
          fields: [
            {
              name: 'eligibility',
              type: 'group',
              fields: [
                { name: 'summary', type: 'textarea', maxLength: 2_000 },
                textList('geographicRegions', 'Geographic regions', 100),
                textList('eligibleCountries', 'Eligible countries', 250),
                {
                  name: 'academicLevels',
                  type: 'select',
                  hasMany: true,
                  options: ACADEMIC_LEVELS.map((value) => ({ label: value, value })),
                },
                {
                  name: 'fields',
                  type: 'select',
                  hasMany: true,
                  options: BROAD_FIELDS.map((value) => ({ label: value, value })),
                },
                textList('majors', 'Specific majors', 100),
                textList('requirements', 'Requirements', 50),
              ],
            },
            {
              name: 'funding',
              type: 'group',
              fields: [
                nullableFundingField('applicationFee', 'Application fee'),
                nullableFundingField('participationFee', 'Participation fee'),
                nullableFundingField('scholarship', 'Scholarship'),
                nullableFundingField('travelSupport', 'Travel support'),
                nullableFundingField('accommodation', 'Accommodation'),
                nullableFundingField('meals', 'Meals'),
                nullableFundingField('stipendOrSalary', 'Stipend or salary'),
                nullableFundingField('prizes', 'Prizes'),
                nullableFundingField('visaSupport', 'Visa support'),
                nullableFundingField('accessibilitySupport', 'Accessibility support'),
                textList('otherSupport', 'Other support', 20),
                {
                  name: 'filterLabels',
                  type: 'select',
                  hasMany: true,
                  options: FUNDING_FILTERS.map((value) => ({ label: value, value })),
                },
              ],
            },
          ],
        },
        {
          label: 'Application & program',
          fields: [
            { name: 'officialUrl', type: 'text', required: true, maxLength: 2_048 },
            { name: 'applicationUrl', type: 'text', maxLength: 2_048 },
            textList('activities', 'Activities'),
            textList('benefits', 'Benefits'),
            textList('topics', 'Topics'),
          ],
        },
        {
          label: 'Sources & provenance',
          fields: [
            {
              name: 'sources',
              type: 'array',
              required: true,
              minRows: 1,
              maxRows: 30,
              fields: [
                { name: 'url', type: 'text', required: true, maxLength: 2_048 },
                { name: 'label', type: 'text', required: true, maxLength: 160 },
                { name: 'checkedAt', type: 'date', required: true },
                textList('supportedFields', 'Supported fields', 50),
                { name: 'reviewer', type: 'text', maxLength: 120 },
              ],
            },
            { name: 'lastVerifiedAt', type: 'date', index: true },
            {
              name: 'legacy',
              type: 'group',
              fields: [
                { name: 'slug', type: 'text', index: true, maxLength: 160 },
                { name: 'sourceIssue', type: 'text', maxLength: 120 },
                { name: 'publicationReview', type: 'json' },
                { name: 'verificationNotes', type: 'json' },
                { name: 'importedAt', type: 'date' },
                { name: 'archived', type: 'checkbox', defaultValue: false, index: true },
                { name: 'rawRecord', type: 'json', admin: { readOnly: true } },
              ],
            },
            {
              name: 'moderationFlags',
              type: 'select',
              hasMany: true,
              options: [
                { label: 'Missing application link', value: 'missing-application-link' },
                { label: 'Unnormalized deadline', value: 'unnormalized-deadline' },
                { label: 'Missing funding', value: 'missing-funding' },
                { label: 'Category mismatch', value: 'category-mismatch' },
                { label: 'Stale', value: 'stale' },
                { label: 'Expired', value: 'expired' },
                { label: 'Needs verification', value: 'needs-verification' },
              ],
            },
          ],
        },
      ],
    },
  ],
  timestamps: true,
}
