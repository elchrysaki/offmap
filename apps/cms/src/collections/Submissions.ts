import { CATEGORY_CATALOG, SUBMISSION_STATUSES } from '@offmap/taxonomy'
import type { CollectionBeforeChangeHook, CollectionConfig, CollectionSlug } from 'payload'

import { isAdmin, isStaff, roleOf, staffFieldAccess } from '../access/roles'

const enforceSubmissionApproval: CollectionBeforeChangeHook = ({ data, originalDoc, req }) => {
  const nextStatus = data.status ?? originalDoc?.status ?? 'received'
  if (nextStatus === 'approved' && roleOf(req.user) !== 'admin') {
    throw new Error('Only an admin can approve a submission.')
  }
  return data
}

export const Submissions: CollectionConfig = {
  slug: 'submissions',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'mainCategory', 'status', 'createdAt'],
    group: 'Editorial',
  },
  access: {
    create: () => false,
    read: isStaff,
    update: isStaff,
    delete: isAdmin,
  },
  hooks: {
    beforeChange: [enforceSubmissionApproval],
  },
  versions: { maxPerDoc: 50 },
  fields: [
    { name: 'sourceUrl', type: 'text', required: true, maxLength: 2_048 },
    { name: 'title', type: 'text', required: true, maxLength: 180 },
    {
      name: 'mainCategory',
      type: 'select',
      required: true,
      options: [
        { label: 'Not sure', value: 'not-sure' },
        ...Object.entries(CATEGORY_CATALOG).map(([value, definition]) => ({
          label: definition.title,
          value,
        })),
      ],
    },
    { name: 'note', type: 'textarea', maxLength: 1_000 },
    {
      name: 'contactEmail',
      type: 'email',
      access: { read: staffFieldAccess, update: staffFieldAccess },
    },
    { name: 'consentedAt', type: 'date', required: true },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'received',
      index: true,
      options: SUBMISSION_STATUSES.map((value) => ({ label: value, value })),
    },
    {
      name: 'requestFingerprint',
      type: 'text',
      required: true,
      index: true,
      admin: { hidden: true },
    },
    { name: 'contactDeleteAfter', type: 'date', index: true, admin: { readOnly: true } },
    { name: 'internalNotes', type: 'textarea', maxLength: 5_000 },
    {
      name: 'linkedOpportunity',
      type: 'relationship',
      relationTo: 'opportunities' as CollectionSlug,
    },
  ],
  timestamps: true,
}
