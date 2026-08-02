import type { Access, FieldAccess } from 'payload'

export type StaffRole = 'admin' | 'editor'

export function roleOf(user: unknown): StaffRole | null {
  if (!user || typeof user !== 'object' || !('role' in user)) return null
  const role = (user as { role?: unknown }).role
  return role === 'admin' || role === 'editor' ? role : null
}

export const isAuthenticated: Access = ({ req }) => Boolean(req.user)
export const isAdmin: Access = ({ req }) => roleOf(req.user) === 'admin'
export const isStaff: Access = ({ req }) => Boolean(roleOf(req.user))

export const adminFieldAccess: FieldAccess = ({ req }) => roleOf(req.user) === 'admin'
export const staffFieldAccess: FieldAccess = ({ req }) => Boolean(roleOf(req.user))

export const adminOrSelf: Access = ({ req }) => {
  if (roleOf(req.user) === 'admin') return true
  if (!req.user || typeof req.user !== 'object' || !('id' in req.user)) return false
  return { id: { equals: String((req.user as { id: unknown }).id) } }
}

export function requireRole(user: unknown, roles: readonly StaffRole[]): StaffRole {
  const role = roleOf(user)
  if (!role || !roles.includes(role)) throw new Error('You are not authorized for this action.')
  return role
}
