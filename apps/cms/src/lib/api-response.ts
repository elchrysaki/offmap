import { NextResponse } from 'next/server'
import { ZodError } from 'zod'

export const PUBLIC_CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, X-Request-Id',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
} as const

export function apiError(
  status: number,
  code: string,
  message: string,
  requestId?: string,
  error?: unknown,
) {
  const issues =
    error instanceof ZodError
      ? error.issues.map((issue) => ({ path: issue.path.join('.'), message: issue.message }))
      : undefined
  return NextResponse.json(
    { error: { code, message, requestId, ...(issues ? { issues } : {}) } },
    { status, headers: PUBLIC_CORS_HEADERS },
  )
}

export function requestIdFrom(request: Request): string {
  return request.headers.get('x-request-id')?.slice(0, 100) || crypto.randomUUID()
}
