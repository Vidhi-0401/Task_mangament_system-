import { Role } from '@tm/data';
import { Permission, hasAllPermissions } from './rbac';

describe('RBAC permission mapping', () => {
  it('Viewer can only read tasks', () => {
    expect(hasAllPermissions(Role.Viewer, [Permission.TaskRead])).toBe(true);
    expect(hasAllPermissions(Role.Viewer, [Permission.TaskCreate])).toBe(false);
  });

  it('Admin can manage tasks and read audit', () => {
    expect(hasAllPermissions(Role.Admin, [Permission.TaskCreate, Permission.TaskRead, Permission.TaskUpdate, Permission.TaskDelete])).toBe(true);
    expect(hasAllPermissions(Role.Admin, [Permission.AuditRead])).toBe(true);
  });

  it('Owner includes Admin permissions', () => {
    expect(hasAllPermissions(Role.Owner, [Permission.TaskCreate, Permission.AuditRead])).toBe(true);
  });
});
