import { Body, Controller, Delete, Get, Param, Put, Post, Query, Req, UseGuards } from '@nestjs/common';
import { Permissions, Permission } from '@tm/auth';
import { JwtUser } from '../common/request-user';
import { TaskAccessGuard } from './task-access.guard';
import { TasksService } from './tasks.service';
import { CreateTaskDto, UpdateTaskDto } from './dtos';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasks: TasksService) {}

  @Post()
  @Permissions(Permission.TaskCreate)
  async create(@Req() req: any, @Body() dto: CreateTaskDto) {
    const user = req.user as JwtUser;
    return this.tasks.create(user, dto);
  }

  @Get()
  @Permissions(Permission.TaskRead)
  async list(@Req() req: any, @Query() query: any) {
    const user = req.user as JwtUser;
    return this.tasks.list(user, query);
  }

  @Put(':id')
  @UseGuards(TaskAccessGuard)
  @Permissions(Permission.TaskUpdate)
  async update(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateTaskDto) {
    const task = req.task;
    return this.tasks.update(task, dto);
  }

  @Delete(':id')
  @UseGuards(TaskAccessGuard)
  @Permissions(Permission.TaskDelete)
  async remove(@Req() req: any, @Param('id') id: string) {
    const task = req.task;
    return this.tasks.remove(task);
  }
}
