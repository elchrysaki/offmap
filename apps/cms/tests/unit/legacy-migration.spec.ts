import { describe, expect, it } from 'vitest'

import {
  buildMigrationReport,
  mapLegacyOpportunity,
  readLegacySources,
} from '@/scripts/import-legacy'

describe('legacy migration', () => {
  it('discovers exactly 23 published and 2 archived records with valid pairs', async () => {
    const records = await readLegacySources()
    const report = buildMigrationReport(records)
    expect(report.discovered).toEqual({ published: 23, archived: 2, total: 25 })
    expect(report.duplicates).toEqual([])
    expect(report.categoryMismatches).toEqual([])
  })

  it('preserves unknown values and legacy provenance without silent enrichment', async () => {
    const records = await readLegacySources()
    const legacy = records.find((record) => record.slug === 'ea-summit-istanbul')
    expect(legacy).toBeDefined()
    const mapped = mapLegacyOpportunity(legacy!)
    expect(mapped.dates?.applicationDeadlineAt).toBeNull()
    expect(mapped.dates?.applicationDeadlineRaw).toBe('open soon')
    expect(mapped.legacy?.rawRecord).toBe(legacy)
    expect(mapped.moderationFlags).toContain('unnormalized-deadline')
  })

  it('keeps archived records as non-published moderation history', async () => {
    const records = await readLegacySources()
    const archived = records.find((record) => record.slug === 'nasa-lucy-mission-internship')
    const mapped = mapLegacyOpportunity(archived!)
    expect(mapped._status).toBe('draft')
    expect(mapped.legacy?.archived).toBe(true)
    expect(mapped.moderationFlags).toContain('expired')
  })
})
