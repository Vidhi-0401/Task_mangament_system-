import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { Role, TaskCategory, TaskStatus } from '@tm/data';
import { Organization } from '../../entities/organization.entity';
import { User } from '../../entities/user.entity';
import { Task } from '../../entities/task.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Organization, User, Task])],
})
export class SeedModule implements OnModuleInit {
  constructor(
    @InjectRepository(Organization) private readonly orgs: Repository<Organization>,
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Task) private readonly tasks: Repository<Task>
  ) {}

  async onModuleInit() {
    if (String(process.env.SEED_ON_BOOT || '').toLowerCase() !== 'true') return;

    const userCount = await this.users.count();
    if (userCount > 0) return;

    const acme = await this.orgs.save(this.orgs.create({ name: 'Acme', parentId: null }));
    const eng = await this.orgs.save(this.orgs.create({ name: 'Acme-Eng', parentId: acme.id }));

    const pwd = await bcrypt.hash('Password@123', 10);

    const owner = await this.users.save(
      this.users.create({
        email: 'owner@acme.com',
        name: 'Acme Owner',
        passwordHash: pwd,
        role: Role.Owner,
        organizationId: acme.id,
      })
    );

    const admin = await this.users.save(
      this.users.create({
        email: 'admin@eng.acme.com',
        name: 'Eng Admin',
        passwordHash: pwd,
        role: Role.Admin,
        organizationId: eng.id,
      })
    );

    await this.users.save(
      this.users.create({
        email: 'viewer@eng.acme.com',
        name: 'Eng Viewer',
        passwordHash: pwd,
        role: Role.Viewer,
        organizationId: eng.id,
      })
    );

    await this.tasks.save(
      this.tasks.create({
        title: 'Welcome task (Acme parent)',
        description: 'Visible to Owner, and parent Admin/Owner scope',
        category: TaskCategory.Work,
        status: TaskStatus.Todo,
        order: 0,
        organizationId: acme.id,
        createdById: owner.id,
      })
    );

    await this.tasks.save(
      this.tasks.create({
        title: 'Eng backlog item',
        description: 'Visible to Eng users; also visible to Acme Owner/Admin via hierarchy',
        category: TaskCategory.Work,
        status: TaskStatus.InProgress,
        order: 1,
        organizationId: eng.id,
        createdById: admin.id,
      })
    );

    // eslint-disable-next-line no-console
    console.log('Seeded demo orgs/users/tasks (SEED_ON_BOOT=true).');
  }
}
