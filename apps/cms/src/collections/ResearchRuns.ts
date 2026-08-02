import type { CollectionBeforeChangeHook, CollectionConfig, CollectionSlug } from 'payload'

import { isStaff } from '../access/roles'

const appendOnly: CollectionBeforeChangeHook = ({ operation }) => {
  if (operation !== 'create') throw new Error('Research runs are immutable evidence records.')
}

export const ResearchRuns: CollectionConfig = {
  slug: 'research-runs',
  admin: {
    useAsTitle: 'reference',
    defaultColumns: ['reference', 'status', 'model', 'promptVersion', 'createdAt'],
    group: 'Research',
  },
  access: {
    create: isStaff,
    read: isStaff,
    update: () => false,
    delete: () => false,
  },
  hooks: { beforeChange: [appendOnly] },
  fields: [
    { name: 'reference', type: 'text', required: true, unique: true, index: true },
    {
      name: 'submission',
      type: 'relationship',
      relationTo: 'submissions' as CollectionSlug,
      required: true,
    },
    { name: 'opportunity', type: 'relationship', relationTo: 'opportunities' as CollectionSlug },
    { name: 'requestedBy', type: 'relationship', relationTo: 'users', required: true },
    {
      name: 'status',
      type: 'select',
      required: true,
      options: [
        { label: 'Succeeded', value: 'succeeded' },
        { label: 'Failed', value: 'failed' },
      ],
    },
    { name: 'model', type: 'text', required: true },
    { name: 'modelSnapshot', type: 'text' },
    { name: 'promptVersion', type: 'text', required: true },
    {
      name: 'proposal',
      type: 'json',
      admin: { description: 'Untrusted proposal; compare every field with citations.' },
    },
    { name: 'citations', type: 'json' },
    { name: 'warnings', type: 'json' },
    { name: 'usage', type: 'json' },
    { name: 'failure', type: 'textarea', maxLength: 5_000 },
    { name: 'startedAt', type: 'date', required: true },
    { name: 'completedAt', type: 'date', required: true },
  ],
  timestamps: true,
}
