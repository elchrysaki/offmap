import { config as loadEnv } from 'dotenv'
import { fileURLToPath } from 'node:url'
import { getPayload } from 'payload'
import { testUser } from './test-user.js'

loadEnv({ path: fileURLToPath(new URL('../../.env', import.meta.url)) })
const { default: config } = await import('../../src/payload.config.js')

/**
 * Seeds a test user for e2e admin tests.
 */
export async function seedTestUser(): Promise<void> {
  const payload = await getPayload({ config })

  // Delete existing test user if any
  await payload.delete({
    collection: 'users',
    where: {
      email: {
        equals: testUser.email,
      },
    },
  })

  // Create fresh test user
  await payload.create({
    collection: 'users',
    context: { adminSeed: true },
    data: testUser,
  })
}

/**
 * Cleans up test user after tests
 */
export async function cleanupTestUser(): Promise<void> {
  const payload = await getPayload({ config })

  await payload.delete({
    collection: 'users',
    where: {
      email: {
        equals: testUser.email,
      },
    },
  })
}

const action = process.argv[2]
if (action === 'seed') await seedTestUser()
if (action === 'cleanup') await cleanupTestUser()
if (action === 'seed' || action === 'cleanup') process.exit(0)
