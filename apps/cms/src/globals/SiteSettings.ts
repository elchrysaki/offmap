import type { CollectionSlug, GlobalConfig } from 'payload'

import { isAdmin } from '../access/roles'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  admin: { group: 'Editorial' },
  access: {
    read: () => true,
    update: isAdmin,
  },
  versions: { max: 50 },
  fields: [
    {
      name: 'featuredOpportunities',
      type: 'relationship',
      relationTo: 'opportunities' as CollectionSlug,
      hasMany: true,
      maxRows: 12,
      filterOptions: { _status: { equals: 'published' } },
    },
    { name: 'announcement', type: 'text', maxLength: 240 },
    { name: 'closingSoonDays', type: 'number', required: true, defaultValue: 14, min: 1, max: 60 },
    { name: 'publicEmail', type: 'email' },
    { name: 'aboutUrl', type: 'text', maxLength: 2_048 },
    { name: 'privacyUrl', type: 'text', maxLength: 2_048 },
  ],
}
