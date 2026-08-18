import { cp, mkdir } from 'node:fs/promises'
import { resolve } from 'node:path'

const cmsRoot = resolve(import.meta.dirname, '../..')
const standaloneAppRoot = resolve(cmsRoot, '.next/standalone/apps/cms')

await mkdir(resolve(standaloneAppRoot, '.next/static'), { recursive: true })
await cp(resolve(cmsRoot, '.next/static'), resolve(standaloneAppRoot, '.next/static'), {
  recursive: true,
  force: true,
})

console.log('Prepared standalone CMS static assets.')
