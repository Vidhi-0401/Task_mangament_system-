import { Role } from '@tm/data';

export type JwtUser = {
  userId: string;
  orgId: string;
  role: Role;
  email: string;
  name: string;
};
