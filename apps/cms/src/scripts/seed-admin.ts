import 'dotenv/config'

import type { Payload } from 'payload'
import { z } from 'zod'

import { pathToFileURL } from 'node:url'

const adminInputSchema = z.object({
  email: z.email(),
  password: z.string().min(14),
  name: z.string().trim().min(2).max(120),
})

export async function ensureConfiguredAdmin(payload: Payload) {
  const input = adminInputSchema.parse({
    email: process.env.OFFMAP_ADMIN_EMAIL,
    password: process.env.OFFMAP_ADMIN_PASSWORD,
    name: process.env.OFFMAP_ADMIN_NAME || 'OffMap Admin',
  })
  const existing = await payload.find({
    collection: 'users',
    where: { email: { equals: input.email } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })

  if (existing.docs[0]) {
    if (existing.docs[0].role !== 'admin') {
      throw new Error(
        'The configured email already belongs to a non-admin user; recover it manually.',
      )
    }
    payload.logger.info('Configured OffMap admin already exists; no changes made.')
    return { created: false }
  }

  await payload.create({
    collection: 'users',
    overrideAccess: true,
    context: { adminSeed: true },
    data: { ...input, role: 'admin' },
  })
  payload.logger.info('Created the configured first OffMap admin.')
  return { created: true }
}

const isEntrypoint = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href
if (isEntrypoint) {
  const [{ getPayload }, { default: config }] = await Promise.all([
    import('payload'),
    import('../payload.config'),
  ])
  await ensureConfiguredAdmin(await getPayload({ config }))
  process.exit(0)
}
