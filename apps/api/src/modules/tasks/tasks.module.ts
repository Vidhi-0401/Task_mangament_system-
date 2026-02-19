import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from '../../entities/task.entity';
import { OrgsModule } from '../orgs/orgs.module';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { TaskAccessGuard } from './task-access.guard';

@Module({
  imports: [TypeOrmModule.forFeature([Task]), OrgsModule],
  controllers: [TasksController],
  providers: [TasksService, TaskAccessGuard],
})
export class TasksModule {}
