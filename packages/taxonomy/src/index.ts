import { z } from 'zod';

import catalogJson from './catalog.generated.json';

export type CategoryDefinition = {
  title: string;
  emoji: string;
  route: string;
  description: string;
};

export type MainCategoryDefinition = {
  title: string;
  emoji: string;
  description: string;
  categories: Record<string, CategoryDefinition>;
};

export const CATEGORY_CATALOG = catalogJson as Record<string, MainCategoryDefinition>;
export const MAIN_CATEGORIES = Object.freeze(Object.keys(CATEGORY_CATALOG));
export const CATEGORY_PAIRS = Object.freeze(
  MAIN_CATEGORIES.flatMap((mainCategory) =>
    Object.keys(CATEGORY_CATALOG[mainCategory]?.categories ?? {}).map((category) => ({
      mainCategory,
      category,
    })),
  ),
);

export const FORMATS = ['in-person', 'online', 'hybrid', 'not-confirmed'] as const;
export const ACADEMIC_LEVELS = [
  'secondary-school',
  'undergraduate',
  'graduate',
  'doctoral',
  'postdoctoral',
  'early-career',
  'any',
] as const;
export const BROAD_FIELDS = [
  'arts-humanities',
  'business-economics',
  'computing-ai-data',
  'education',
  'engineering-technology',
  'environment-sustainability',
  'health-life-sciences',
  'law-policy',
  'natural-sciences',
  'social-sciences',
  'multidisciplinary',
] as const;
export const FUNDING_FILTERS = [
  'free',
  'scholarship',
  'travel-support',
  'accommodation',
  'meals',
  'stipend-or-salary',
  'prizes',
  'not-confirmed',
] as const;
export const AUDIENCE_GROUPS = [
  'secondary-students',
  'university-students',
  'graduate-students',
  'researchers',
  'early-career',
  'all-students',
] as const;
export const AVAILABILITY_VALUES = [
  'upcoming',
  'open',
  'closing-soon',
  'rolling',
  'expired',
  'needs-verification',
] as const;
export const SUBMISSION_STATUSES = [
  'received',
  'researching',
  'draft-ready',
  'in-review',
  'approved',
  'rejected',
] as const;

export type Availability = (typeof AVAILABILITY_VALUES)[number];

export function isValidCategoryPair(mainCategory: string, category: string): boolean {
  return Boolean(CATEGORY_CATALOG[mainCategory]?.categories[category]);
}

export function getCategoryLabel(mainCategory: string, category: string): string {
  return CATEGORY_CATALOG[mainCategory]?.categories[category]?.title ?? category;
}

export function getMainCategoryLabel(mainCategory: string): string {
  return CATEGORY_CATALOG[mainCategory]?.title ?? mainCategory;
}

export const categoryPairSchema = z
  .object({
    mainCategory: z.string().min(1),
    category: z.string().min(1),
  })
  .superRefine(({ mainCategory, category }, context) => {
    if (!isValidCategoryPair(mainCategory, category)) {
      context.addIssue({
        code: 'custom',
        path: ['category'],
        message: `${category} is not valid under ${mainCategory}`,
      });
    }
  });

export type AvailabilityInput = {
  now?: Date;
  applicationDeadline?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  rolling?: boolean;
  lastVerifiedAt?: string | null;
  closingSoonDays?: number;
  staleAfterDays?: number;
};

const DAY_MS = 86_400_000;

export function computeAvailability(input: AvailabilityInput): Availability {
  const now = input.now ?? new Date();
  const staleAfterDays = input.staleAfterDays ?? 120;
  const closingSoonDays = input.closingSoonDays ?? 14;
  const verifiedAt = input.lastVerifiedAt ? new Date(input.lastVerifiedAt) : null;

  if (!verifiedAt || Number.isNaN(verifiedAt.valueOf())) return 'needs-verification';
  if (now.valueOf() - verifiedAt.valueOf() > staleAfterDays * DAY_MS) return 'needs-verification';
  if (input.rolling) return 'rolling';

  const deadline = input.applicationDeadline ? new Date(input.applicationDeadline) : null;
  const start = input.startDate ? new Date(input.startDate) : null;
  const end = input.endDate ? new Date(input.endDate) : null;

  if (end && !Number.isNaN(end.valueOf()) && end < now) return 'expired';
  if (deadline && !Number.isNaN(deadline.valueOf())) {
    if (deadline < now) return start && start > now ? 'upcoming' : 'expired';
    if (deadline.valueOf() - now.valueOf() <= closingSoonDays * DAY_MS) return 'closing-soon';
    return 'open';
  }
  if (start && !Number.isNaN(start.valueOf()) && start > now) return 'upcoming';
  return 'needs-verification';
}

export function taxonomyPayload() {
  return {
    mainCategories: MAIN_CATEGORIES.map((value) => ({
      value,
      label: getMainCategoryLabel(value),
      emoji: CATEGORY_CATALOG[value]?.emoji ?? '',
      description: CATEGORY_CATALOG[value]?.description ?? '',
      categories: Object.entries(CATEGORY_CATALOG[value]?.categories ?? {}).map(
        ([category, definition]) => ({
          value: category,
          label: definition.title,
          emoji: definition.emoji,
          description: definition.description,
        }),
      ),
    })),
    formats: [...FORMATS],
    academicLevels: [...ACADEMIC_LEVELS],
    fields: [...BROAD_FIELDS],
    funding: [...FUNDING_FILTERS],
    availability: [...AVAILABILITY_VALUES],
  };
}
