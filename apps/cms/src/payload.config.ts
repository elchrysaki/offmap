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
import { roleOf } from './access/roles'

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
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
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
  },
})
