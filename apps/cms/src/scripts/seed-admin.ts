import 'dotenv/config'

import { getPayload } from 'payload'
import { z } from 'zod'

import config from '../payload.config'

const input = z
  .object({
    email: z.email(),
    password: z.string().min(14),
    name: z.string().trim().min(2).max(120),
  })
  .parse({
    email: process.env.OFFMAP_ADMIN_EMAIL,
    password: process.env.OFFMAP_ADMIN_PASSWORD,
    name: process.env.OFFMAP_ADMIN_NAME || 'OffMap Admin',
  })

const payload = await getPayload({ config })
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
  payload.logger.info(`Admin ${input.email} already exists; no changes made.`)
} else {
  await payload.create({
    collection: 'users',
    overrideAccess: true,
    context: { adminSeed: true },
    data: { ...input, role: 'admin' },
  })
  payload.logger.info(`Created the first OffMap admin: ${input.email}`)
}

process.exit(0)
