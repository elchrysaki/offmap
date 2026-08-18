import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Opportunities } from './collections/Opportunities'
import { ResearchRuns } from './collections/ResearchRuns'
import { Submissions } from './collections/Submissions'
import { Users } from './collections/Users'
import { SiteSettings } from './globals/SiteSettings'
import { refreshLifecycleTask } from './jobs/refresh-lifecycle'
import { researchOpportunityTask } from './jobs/research-opportunity'
import { migrations } from './migrations'
import { roleOf } from './access/roles'
import { importLegacyOpportunities } from './scripts/import-legacy'
import { ensureConfiguredAdmin } from './scripts/seed-admin'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Opportunities, Submissions, ResearchRuns],
  globals: [SiteSettings],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  serverURL:
    process.env.PAYLOAD_PUBLIC_SERVER_URL ||
    (process.env.RENDER_EXTERNAL_HOSTNAME
      ? `https://${process.env.RENDER_EXTERNAL_HOSTNAME}`
      : undefined),
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    migrationDir: path.resolve(dirname, 'migrations'),
    prodMigrations: process.env.OFFMAP_RUN_PROD_MIGRATIONS === 'true' ? migrations : undefined,
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
  }),
  jobs: {
    access: {
      queue: ({ req }) => roleOf(req.user) === 'admin',
      run: ({ req }) => roleOf(req.user) === 'admin',
      cancel: ({ req }) => roleOf(req.user) === 'admin',
    },
    autoRun: [{ allQueues: true, cron: '0 * * * * *', limit: 10 }],
    deleteJobOnComplete: false,
    tasks: [refreshLifecycleTask, researchOpportunityTask],
  },
  sharp,
  plugins: [],
  onInit: async (payload) => {
    payload.logger.info('OffMap CMS initialized. Public routes expose published DTOs only.')
    if (process.env.OFFMAP_SEED_ADMIN_ON_INIT === 'true') {
      await ensureConfiguredAdmin(payload)
    }
    if (process.env.OFFMAP_IMPORT_LEGACY_ON_INIT === 'true') {
      const { writeResult } = await importLegacyOpportunities(payload)
      payload.logger.info(
        `Legacy showcase import complete: ${writeResult.created} created, ${writeResult.skipped} already present.`,
      )
    }
  },
})
