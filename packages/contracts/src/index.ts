import {
  ACADEMIC_LEVELS,
  AUDIENCE_GROUPS,
  AVAILABILITY_VALUES,
  BROAD_FIELDS,
  FORMATS,
  FUNDING_FILTERS,
  categoryPairSchema,
} from '@offmap/taxonomy';
import { z } from 'zod';

export const httpUrlSchema = z
  .url()
  .max(2_048)
  .refine((value) => ['http:', 'https:'].includes(new URL(value).protocol), {
    message: 'URL must use HTTP or HTTPS',
  });

export const isoDateSchema = z.iso.datetime({ offset: true });
export const nullableTextSchema = z.string().trim().min(1).nullable();

export const sourceSchema = z.object({
  url: httpUrlSchema,
  label: z.string().trim().min(1).max(160),
  checkedAt: isoDateSchema,
  supportedFields: z.array(z.string().trim().min(1).max(80)).max(50),
  reviewer: z.string().trim().min(1).max(120).nullable(),
});

export const fundingSchema = z.object({
  applicationFee: nullableTextSchema,
  participationFee: nullableTextSchema,
  scholarship: nullableTextSchema,
  travelSupport: nullableTextSchema,
  accommodation: nullableTextSchema,
  meals: nullableTextSchema,
  stipendOrSalary: nullableTextSchema,
  prizes: nullableTextSchema,
  visaSupport: nullableTextSchema,
  accessibilitySupport: nullableTextSchema,
  otherSupport: z.array(z.string().trim().min(1).max(240)).max(20),
});

export const locationSchema = z.object({
  display: z.string().trim().min(1).max(240),
  city: z.string().trim().min(1).max(120).nullable(),
  country: z.string().trim().min(1).max(120).nullable(),
  countryCode: z.string().trim().length(2).nullable(),
  region: z.string().trim().min(1).max(120).nullable(),
});

export const opportunityCardSchema = categoryPairSchema.extend({
  id: z.string().min(1),
  slug: z.string().trim().min(1).max(160),
  title: z.string().trim().min(1).max(180),
  organizer: z.string().trim().min(1).max(180),
  summary: z.string().trim().min(1).max(600),
  format: z.enum(FORMATS),
  location: locationSchema,
  availability: z.enum(AVAILABILITY_VALUES),
  applicationDeadline: isoDateSchema.nullable(),
  applicationDeadlineDisplay: nullableTextSchema,
  fundingLabels: z.array(z.enum(FUNDING_FILTERS)).max(FUNDING_FILTERS.length),
  audienceGroups: z.array(z.enum(AUDIENCE_GROUPS)).max(AUDIENCE_GROUPS.length),
  lastVerifiedAt: isoDateSchema.nullable(),
  featured: z.boolean(),
});

export const detailSectionSchema = z.object({
  heading: z.string().trim().min(1).max(100),
  body: z.string().trim().min(1).max(10_000),
});

export const opportunityDetailSchema = opportunityCardSchema.extend({
  edition: nullableTextSchema,
  details: z.array(detailSectionSchema).max(20),
  dates: z.object({
    timezone: nullableTextSchema,
    rolling: z.boolean(),
    startAt: isoDateSchema.nullable(),
    startDisplay: nullableTextSchema,
    endAt: isoDateSchema.nullable(),
    endDisplay: nullableTextSchema,
  }),
  eligibility: z.object({
    summary: nullableTextSchema,
    geographicRegions: z.array(z.string().trim().min(1).max(120)).max(100),
    eligibleCountries: z.array(z.string().trim().min(1).max(120)).max(250),
    academicLevels: z.array(z.enum(ACADEMIC_LEVELS)).max(ACADEMIC_LEVELS.length),
    fields: z.array(z.enum(BROAD_FIELDS)).max(BROAD_FIELDS.length),
    majors: z.array(z.string().trim().min(1).max(160)).max(100),
    requirements: z.array(z.string().trim().min(1).max(500)).max(50),
  }),
  funding: fundingSchema,
  officialUrl: httpUrlSchema,
  applicationUrl: httpUrlSchema.nullable(),
  activities: z.array(z.string().trim().min(1).max(200)).max(50),
  benefits: z.array(z.string().trim().min(1).max(300)).max(50),
  topics: z.array(z.string().trim().min(1).max(120)).max(50),
  sources: z.array(sourceSchema).min(1).max(30),
  provenance: z.object({
    summary: z.string().trim().min(1).max(500),
    legacySlug: nullableTextSchema,
    reviewedAt: isoDateSchema.nullable(),
  }),
});

export const opportunityQuerySchema = z.object({
  query: z.string().trim().max(120).optional(),
  mainCategory: z.string().trim().max(80).optional(),
  category: z.string().trim().max(80).optional(),
  format: z.enum(FORMATS).optional(),
  country: z.string().trim().max(120).optional(),
  region: z.string().trim().max(120).optional(),
  academicLevel: z.enum(ACADEMIC_LEVELS).optional(),
  field: z.enum(BROAD_FIELDS).optional(),
  funding: z.enum(FUNDING_FILTERS).optional(),
  availability: z.enum(AVAILABILITY_VALUES).optional(),
  sort: z.enum(['recommended', 'deadline', 'newest', 'verified']).default('recommended'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export const opportunityListResponseSchema = z.object({
  items: z.array(opportunityCardSchema),
  pagination: z.object({
    page: z.number().int().min(1),
    limit: z.number().int().min(1),
    totalItems: z.number().int().nonnegative(),
    totalPages: z.number().int().nonnegative(),
    hasNextPage: z.boolean(),
  }),
  facets: z.object({
    mainCategories: z.record(z.string(), z.number().int().positive()),
    categories: z.record(z.string(), z.number().int().positive()),
    formats: z.record(z.string(), z.number().int().positive()),
    countries: z.record(z.string(), z.number().int().positive()),
    academicLevels: z.record(z.string(), z.number().int().positive()),
    fields: z.record(z.string(), z.number().int().positive()),
    funding: z.record(z.string(), z.number().int().positive()),
    availability: z.record(z.string(), z.number().int().positive()),
  }),
});

export const submissionInputSchema = z.object({
  sourceUrl: httpUrlSchema,
  title: z.string().trim().min(3).max(180),
  mainCategory: z.string().trim().min(1).max(80),
  note: z.string().trim().max(1_000).default(''),
  contactEmail: z.email().max(254).optional().or(z.literal('')),
  consent: z.literal(true),
  website: z.string().max(0).default(''),
});

export const submissionAcceptedSchema = z.object({
  accepted: z.literal(true),
  reference: z.string().min(8),
  message: z.string().min(1),
});

export const researchProposalSchema = z.object({
  title: z.string().trim().min(1).max(180),
  organizer: z.string().trim().min(1).max(180).nullable(),
  edition: nullableTextSchema,
  summary: z.string().trim().min(1).max(600),
  mainCategory: z.string().trim().min(1),
  category: z.string().trim().min(1),
  audienceGroupsObserved: z.array(z.string().trim().min(1).max(80)),
  dates: z.object({
    applicationDeadline: isoDateSchema.nullable(),
    startAt: isoDateSchema.nullable(),
    endAt: isoDateSchema.nullable(),
    timezone: nullableTextSchema,
    rolling: z.boolean().nullable(),
  }),
  location: locationSchema.nullable(),
  format: z.enum(FORMATS).nullable(),
  eligibilitySummary: nullableTextSchema,
  funding: fundingSchema,
  officialUrl: httpUrlSchema,
  applicationUrl: httpUrlSchema.nullable(),
  citations: z.array(sourceSchema).min(1).max(30),
  warnings: z.array(z.string().trim().min(1).max(500)).max(50),
  unsupportedFields: z.array(z.string().trim().min(1).max(120)).max(100),
});

export const apiErrorSchema = z.object({
  error: z.object({
    code: z.string().min(1),
    message: z.string().min(1),
    requestId: z.string().optional(),
    issues: z.array(z.object({ path: z.string(), message: z.string() })).optional(),
  }),
});

export type OpportunityCard = z.infer<typeof opportunityCardSchema>;
export type OpportunityDetail = z.infer<typeof opportunityDetailSchema>;
export type OpportunityListResponse = z.infer<typeof opportunityListResponseSchema>;
export type OpportunityQuery = z.infer<typeof opportunityQuerySchema>;
export type SubmissionInput = z.infer<typeof submissionInputSchema>;
export type SubmissionAccepted = z.infer<typeof submissionAcceptedSchema>;
export type ResearchProposal = z.infer<typeof researchProposalSchema>;
