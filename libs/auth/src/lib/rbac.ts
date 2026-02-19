import { Role } from '@tm/data';

export enum Permission {
  TaskCreate = 'task:create',
  TaskRead = 'task:read',
  TaskUpdate = 'task:update',
  TaskDelete = 'task:delete',
  AuditRead = 'audit:read',
}

export const ROLE_PERMISSIONS: Record<Role, Set<Permission>> = {
  [Role.Viewer]: new Set([Permission.TaskRead]),
  [Role.Admin]: new Set([
    Permission.TaskCreate,
    Permission.TaskRead,
    Permission.TaskUpdate,
    Permission.TaskDelete,
    Permission.AuditRead,
  ]),
  [Role.Owner]: new Set([
    Permission.TaskCreate,
    Permission.TaskRead,
    Permission.TaskUpdate,
    Permission.TaskDelete,
    Permission.AuditRead,
  ]),
};

export function hasPermission(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.has(permission) ?? false;
}

export function hasAllPermissions(role: Role, permissions: Permission[]): boolean {
  return permissions.every((p) => hasPermission(role, p));
}
