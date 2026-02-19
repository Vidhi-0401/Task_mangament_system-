import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { AuditLog } from '../../entities/audit-log.entity';

@Injectable()
export class AuditLogService {
  constructor(@InjectRepository(AuditLog) private readonly logs: Repository<AuditLog>) {}

  private filePath(): string {
    return path.resolve(process.cwd(), 'audit.log');
  }

  async append(entry: Omit<AuditLog, 'id' | 'ts'>) {
    const saved = await this.logs.save(this.logs.create(entry as any));
    try {
      fs.appendFileSync(this.filePath(), JSON.stringify({ ...entry, ts: new Date().toISOString() }) + '\n', 'utf-8');
    } catch {
      // ignore file errors in dev
    }
    return saved;
  }

  async latest(limit = 200) {
    return this.logs.find({ order: { ts: 'DESC' }, take: limit });
  }
}
