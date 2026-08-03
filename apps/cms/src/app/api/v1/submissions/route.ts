import { createHmac } from 'node:crypto'

import { submissionAcceptedSchema, submissionInputSchema } from '@offmap/contracts'
import { CATEGORY_CATALOG } from '@offmap/taxonomy'
import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import { ZodError } from 'zod'

import config from '@/payload.config'
import { apiError, PUBLIC_CORS_HEADERS, requestIdFrom } from '@/lib/api-response'
import { submissionReference } from '@/lib/submission-reference'
import type { Submission } from '@/payload-types'

const MAX_BODY_BYTES = 16_384
const CONTACT_RETENTION_DAYS = 30
const MAX_SUBMISSIONS_PER_HOUR = 5

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: PUBLIC_CORS_HEADERS })
}

function accepted(reference: string) {
  return submissionAcceptedSchema.parse({
    accepted: true,
    reference,
    message: 'Thanks. A human editor will verify the source before anything is published.',
  })
}

function fingerprint(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
  const address = forwarded || request.headers.get('x-real-ip') || 'unknown'
  const secret = process.env.SUBMISSION_HASH_SECRET
  if (!secret || secret.length < 24) throw new Error('SUBMISSION_HASH_SECRET is not configured.')
  return createHmac('sha256', secret).update(address).digest('hex')
}

export async function POST(request: Request) {
  const requestId = requestIdFrom(request)
  try {
    const contentLength = Number(request.headers.get('content-length') ?? 0)
    if (contentLength > MAX_BODY_BYTES)
      return apiError(413, 'BODY_TOO_LARGE', 'Submission is too large.', requestId)

    const bodyText = await request.text()
    if (new TextEncoder().encode(bodyText).byteLength > MAX_BODY_BYTES)
      return apiError(413, 'BODY_TOO_LARGE', 'Submission is too large.', requestId)

    const raw = JSON.parse(bodyText) as Record<string, unknown>
    if (typeof raw.website === 'string' && raw.website.length > 0) {
      return NextResponse.json(accepted(`OF-${crypto.randomUUID().slice(0, 8)}`), {
        status: 202,
        headers: PUBLIC_CORS_HEADERS,
      })
    }

    const input = submissionInputSchema.parse(raw)
    if (input.mainCategory !== 'not-sure' && !CATEGORY_CATALOG[input.mainCategory]) {
      return apiError(400, 'INVALID_CATEGORY', 'Choose a valid broad category.', requestId)
    }

    const payload = await getPayload({ config })
    const requestFingerprint = fingerprint(request)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1_000).toISOString()
    const recent = await payload.count({
      collection: 'submissions',
      where: {
        and: [
          { requestFingerprint: { equals: requestFingerprint } },
          { createdAt: { greater_than: oneHourAgo } },
        ],
      },
      overrideAccess: true,
    })
    if (recent.totalDocs >= MAX_SUBMISSIONS_PER_HOUR) {
      return apiError(
        429,
        'RATE_LIMITED',
        'Please wait before sending another opportunity.',
        requestId,
      )
    }

    const now = new Date()
    const submission = await payload.create({
      collection: 'submissions',
      overrideAccess: true,
      data: {
        sourceUrl: input.sourceUrl,
        title: input.title,
        mainCategory: input.mainCategory as Submission['mainCategory'],
        note: input.note,
        contactEmail: input.contactEmail || null,
        consentedAt: now.toISOString(),
        status: 'received',
        requestFingerprint,
        contactDeleteAfter: input.contactEmail
          ? new Date(now.valueOf() + CONTACT_RETENTION_DAYS * 86_400_000).toISOString()
          : null,
      },
    })

    return NextResponse.json(accepted(submissionReference(submission.id)), {
      status: 202,
      headers: { ...PUBLIC_CORS_HEADERS, 'X-Request-Id': requestId },
    })
  } catch (error) {
    if (error instanceof SyntaxError)
      return apiError(400, 'INVALID_JSON', 'Submission must be valid JSON.', requestId)
    if (error instanceof ZodError)
      return apiError(
        400,
        'INVALID_SUBMISSION',
        'Check the highlighted information and try again.',
        requestId,
        error,
      )
    console.error('Public submission failed.', {
      requestId,
      errorName: error instanceof Error ? error.name : 'UnknownError',
    })
    return apiError(
      500,
      'SUBMISSION_FAILED',
      'We could not save this opportunity yet. Please try again.',
      requestId,
    )
  }
}
