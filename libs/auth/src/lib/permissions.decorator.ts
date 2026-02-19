import { SetMetadata } from '@nestjs/common';
import { Permission } from './rbac';

export const PERMISSIONS_KEY = 'tm_permissions';
export const Permissions = (...permissions: Permission[]) => SetMetadata(PERMISSIONS_KEY, permissions);
