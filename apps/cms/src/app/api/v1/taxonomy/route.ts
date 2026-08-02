import { NextResponse } from 'next/server'

import { taxonomyPayload } from '@offmap/taxonomy'
import { PUBLIC_CORS_HEADERS } from '@/lib/api-response'

export function GET() {
  return NextResponse.json(taxonomyPayload(), {
    headers: {
      ...PUBLIC_CORS_HEADERS,
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
    },
  })
}
