import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import { z } from 'zod'

import { roleOf } from '@/access/roles'
import { apiError, requestIdFrom } from '@/lib/api-response'
import config from '@/payload.config'

const inputSchema = z.object({ submissionId: z.number().int().positive() })

export async function POST(request: Request) {
  const requestId = requestIdFrom(request)
  try {
    const payload = await getPayload({ config })
    const { user } = await payload.auth({ headers: request.headers })
    if (roleOf(user) !== 'admin')
      return apiError(403, 'ADMIN_REQUIRED', 'Only an admin can start research.', requestId)
    const input = inputSchema.parse(await request.json())
    const submission = await payload.findByID({
      collection: 'submissions',
      id: input.submissionId,
      overrideAccess: true,
      depth: 0,
    })
    if (!['received', 'draft-ready'].includes(submission.status)) {
      return apiError(409, 'INVALID_STATE', 'This submission is not ready for research.', requestId)
    }
    const queueResearch = payload.jobs.queue as unknown as (args: {
      task: string
      queue: string
      input: { submissionId: number; requestedBy: number }
    }) => Promise<{ id: number | string }>
    const job = await queueResearch({
      task: 'research-opportunity',
      queue: 'research',
      input: { submissionId: submission.id, requestedBy: user!.id },
    })
    return NextResponse.json({ queued: true, jobId: job.id }, { status: 202 })
  } catch (error) {
    return apiError(400, 'RESEARCH_NOT_QUEUED', 'Research could not be queued.', requestId, error)
  }
}
