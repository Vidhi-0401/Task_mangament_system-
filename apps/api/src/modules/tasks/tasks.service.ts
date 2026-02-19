import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, In } from 'typeorm';
import { TaskCategory, TaskStatus } from '@tm/data';
import { Task } from '../../entities/task.entity';
import { OrgsService } from '../orgs/orgs.service';
import { JwtUser } from '../common/request-user';
import { CreateTaskDto, UpdateTaskDto } from './dtos';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task) private readonly tasks: Repository<Task>,
    private readonly orgs: OrgsService
  ) {}

  async create(user: JwtUser, dto: CreateTaskDto) {
    const orgId = dto.organizationId ?? user.orgId;
    const canOrg = await this.orgs.canAccessOrg(user.orgId, user.role, orgId);
    if (!canOrg) throw new ForbiddenException('Not allowed to create in this organization');

    const task = this.tasks.create({
      title: dto.title,
      description: dto.description ?? null,
      category: dto.category ?? TaskCategory.Work,
      status: dto.status ?? TaskStatus.Todo,
      order: dto.order ?? 0,
      organizationId: orgId,
      createdById: user.userId,
    });

    return this.tasks.save(task);
  }

  async list(user: JwtUser, query: any) {
    const orgIds = await this.orgs.accessibleOrgIds(user.orgId, user.role);

    const where: any = { organizationId: In(orgIds) };

    if (query.status) where.status = query.status;
    if (query.category) where.category = query.category;
    if (query.search) where.title = Like(`%${String(query.search).slice(0, 100)}%`);

    const sortBy = (query.sortBy as string) || 'order';
    const sortDir = (query.sortDir as string) === 'desc' ? 'DESC' : 'ASC';

    const allowedSort: Record<string, any> = {
      createdAt: 'createdAt',
      title: 'title',
      order: 'order',
      status: 'status',
      category: 'category',
    };

    const order = { [allowedSort[sortBy] || 'order']: sortDir as any };

    return this.tasks.find({ where, order });
  }

  async update(task: Task, dto: UpdateTaskDto) {
    if (dto.title !== undefined) task.title = dto.title;
    if (dto.description !== undefined) task.description = dto.description as any;
    if (dto.category !== undefined) task.category = dto.category;
    if (dto.status !== undefined) task.status = dto.status;
    if (dto.order !== undefined) task.order = dto.order;
    return this.tasks.save(task);
  }

  async remove(task: Task) {
    await this.tasks.delete({ id: task.id });
    return { ok: true };
  }
}
