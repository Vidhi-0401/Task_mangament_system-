import { Role, TaskCategory, TaskStatus } from './enums';

export interface Organization {
  id: string;
  name: string;
  parentId?: string | null;
}

export interface UserPublic {
  id: string;
  email: string;
  name: string;
  role: Role;
  organizationId: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  category: TaskCategory;
  status: TaskStatus;
  order: number;
  organizationId: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  ts: string;
  userId?: string | null;
  orgId?: string | null;
  action: string;
  method: string;
  path: string;
  resourceId?: string | null;
  outcome: 'ALLOWED' | 'DENIED';
  statusCode: number;
  ip?: string | null;
}
