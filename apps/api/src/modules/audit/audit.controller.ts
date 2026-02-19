import { Controller, Get } from '@nestjs/common';
import { Permissions, Permission } from '@tm/auth';
import { AuditLogService } from './audit.service';

@Controller('audit-log')
export class AuditController {
  constructor(private readonly audit: AuditLogService) {}

  @Get()
  @Permissions(Permission.AuditRead)
  async list() {
    return this.audit.latest(200);
  }
}
