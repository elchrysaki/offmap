import {
  opportunityDetailSchema,
  opportunityListResponseSchema,
  submissionAcceptedSchema,
  submissionInputSchema,
  type OpportunityQuery,
  type SubmissionInput,
} from '@offmap/contracts';
import { fetch } from 'expo/fetch';
import type { ZodType } from 'zod';

import { readPublicCache, writePublicCache } from '@/storage/public-cache';

const API_URL = (process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001').replace(/\/$/, '');
const REQUEST_TIMEOUT_MS = 12_000;

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status?: number,
    readonly code?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function responseError(response: Response): Promise<ApiError> {
  try {
    const body = (await response.json()) as { error?: { message?: string; code?: string } };
    return new ApiError(
      body.error?.message || 'OffMap could not complete that request.',
      response.status,
      body.error?.code,
    );
  } catch {
    return new ApiError('OffMap could not complete that request.', response.status);
  }
}

async function publicGet<T>(path: string, schema: ZodType<T>, cacheKey: string): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(`${API_URL}${path}`, {
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });
    if (!response.ok) throw await responseError(response);
    const parsed = schema.parse(await response.json());
    await writePublicCache(cacheKey, parsed);
    return parsed;
  } catch (error) {
    const cached = await readPublicCache<T>(cacheKey);
    if (cached) return schema.parse(cached);
    if (error instanceof ApiError) throw error;
    throw new ApiError('You appear to be offline. Reconnect and try again.');
  } finally {
    clearTimeout(timeout);
  }
}

export async function getOpportunities(query: Partial<OpportunityQuery> = {}) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== '') params.set(key, String(value));
  }
  const suffix = params.size ? `?${params.toString()}` : '';
  return publicGet(
    `/api/v1/opportunities${suffix}`,
    opportunityListResponseSchema,
    `opportunities:${suffix}`,
  );
}

export async function getOpportunity(slug: string) {
  return publicGet(
    `/api/v1/opportunities/${encodeURIComponent(slug)}`,
    opportunityDetailSchema,
    `opportunity:${slug}`,
  );
}

export async function submitOpportunity(input: SubmissionInput) {
  const parsed = submissionInputSchema.parse(input);
  const response = await fetch(`${API_URL}/api/v1/submissions`, {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify(parsed),
  });
  if (!response.ok) throw await responseError(response);
  return submissionAcceptedSchema.parse(await response.json());
}
