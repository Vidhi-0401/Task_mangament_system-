import { CanActivate, ExecutionContext, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission, hasAllPermissions } from '@tm/auth';
import { Task } from '../../entities/task.entity';
import { OrgsService } from '../orgs/orgs.service';
import { JwtUser } from '../common/request-user';

@Injectable()
export class TaskAccessGuard implements CanActivate {
  constructor(
    @InjectRepository(Task) private readonly tasks: Repository<Task>,
    private readonly orgs: OrgsService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const user = req.user as JwtUser | undefined;
    if (!user) return false;

    const id = req.params?.id as string | undefined;
    if (!id) return true;

    const task = await this.tasks.findOne({ where: { id } });
    if (!task) throw new NotFoundException('Task not found');
    req.task = task;

    const canOrg = await this.orgs.canAccessOrg(user.orgId, user.role, task.organizationId);
    if (!canOrg) throw new ForbiddenException('Not in organization scope');

    const method = (req.method || '').toUpperCase();
    const isWrite = method === 'PUT' || method === 'PATCH' || method === 'DELETE';
    if (isWrite) {
      const needed = method === 'DELETE' ? Permission.TaskDelete : Permission.TaskUpdate;
      const ok = hasAllPermissions(user.role, [needed]);
      if (!ok) throw new ForbiddenException('Insufficient permission');
    }

    return true;
  }
}
