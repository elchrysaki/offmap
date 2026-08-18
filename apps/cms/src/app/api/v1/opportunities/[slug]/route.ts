import { opportunityDetailSchema } from '@offmap/contracts';
import { NextResponse } from 'next/server';
import { getPayload } from 'payload';

import config from '@/payload.config';
import { apiError, PUBLIC_CORS_HEADERS, requestIdFrom } from '@/lib/api-response';
import { opportunityToDetail } from '@/lib/opportunity-dto';

export const dynamic = 'force-dynamic';

export async function GET(request: Request, context: { params: Promise<{ slug: string }> }) {
  const requestId = requestIdFrom(request);
  try {
    const { slug } = await context.params;
    const payload = await getPayload({ config });
    const [result, settings] = await Promise.all([
      payload.find({
        collection: 'opportunities',
        where: { and: [{ slug: { equals: slug } }, { _status: { equals: 'published' } }] },
        limit: 1,
        depth: 0,
        draft: false,
        overrideAccess: false,
      }),
      payload.findGlobal({ slug: 'site-settings', depth: 0, overrideAccess: false }),
    ]);
    const document = result.docs[0];
    if (!document) return apiError(404, 'NOT_FOUND', 'Opportunity not found.', requestId);

    const response = opportunityDetailSchema.parse(
      opportunityToDetail(document, { closingSoonDays: settings.closingSoonDays }),
    );
    return NextResponse.json(response, {
      headers: {
        ...PUBLIC_CORS_HEADERS,
        'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
        'X-Request-Id': requestId,
      },
    });
  } catch (error) {
    return apiError(500, 'DETAIL_FAILED', 'This opportunity could not be loaded.', requestId, error);
  }
}
