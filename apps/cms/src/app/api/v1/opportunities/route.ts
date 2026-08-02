import {
  opportunityListResponseSchema,
  opportunityQuerySchema,
} from '@offmap/contracts';
import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';

import config from '@/payload.config';
import { apiError, PUBLIC_CORS_HEADERS, requestIdFrom } from '@/lib/api-response';
import { buildFacets, filterOpportunities, sortOpportunities } from '@/lib/opportunity-search';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const requestId = requestIdFrom(request);
  try {
    const query = opportunityQuerySchema.parse(Object.fromEntries(request.nextUrl.searchParams));
    const payload = await getPayload({ config });
    const [result, settings] = await Promise.all([
      payload.find({
        collection: 'opportunities',
        where: { _status: { equals: 'published' } },
        limit: 2_000,
        pagination: false,
        depth: 0,
        draft: false,
        overrideAccess: false,
      }),
      payload.findGlobal({ slug: 'site-settings', depth: 0, overrideAccess: false }),
    ]);

    const filtered = filterOpportunities(result.docs, query, settings.closingSoonDays);
    const sorted = sortOpportunities(filtered, query.sort);
    const offset = (query.page - 1) * query.limit;
    const totalPages = Math.ceil(sorted.length / query.limit);
    const response = opportunityListResponseSchema.parse({
      items: sorted.slice(offset, offset + query.limit).map(({ card }) => card),
      pagination: {
        page: query.page,
        limit: query.limit,
        totalItems: sorted.length,
        totalPages,
        hasNextPage: query.page < totalPages,
      },
      facets: buildFacets(filtered),
    });

    return NextResponse.json(response, {
      headers: {
        ...PUBLIC_CORS_HEADERS,
        'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
        'X-Request-Id': requestId,
      },
    });
  } catch (error) {
    return apiError(400, 'INVALID_QUERY', 'The opportunity query is invalid.', requestId, error);
  }
}
