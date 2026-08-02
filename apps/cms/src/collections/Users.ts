import type { CollectionBeforeChangeHook, CollectionConfig } from 'payload'

import { adminOrSelf, isAdmin, roleOf } from '../access/roles'

const preventRoleEscalation: CollectionBeforeChangeHook = ({ data, originalDoc, req }) => {
  if (req.context?.adminSeed === true) return data
  if (roleOf(req.user) !== 'admin') {
    data.role = originalDoc?.role ?? 'editor'
  }
  return data
}

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'name', 'role', 'updatedAt'],
  },
  auth: {
    tokenExpiration: 8 * 60 * 60,
  },
  access: {
    admin: ({ req }) => Boolean(req.user),
    create: isAdmin,
    read: adminOrSelf,
    update: adminOrSelf,
    delete: isAdmin,
  },
  hooks: {
    beforeChange: [preventRoleEscalation],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      maxLength: 120,
    },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'editor',
      saveToJWT: true,
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Editor', value: 'editor' },
      ],
    },
  ],
  timestamps: true,
}
