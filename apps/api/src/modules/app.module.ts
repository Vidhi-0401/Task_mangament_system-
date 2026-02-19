import { Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from './config.module';
import { AuthModule } from './auth/auth.module';
import { TasksModule } from './tasks/tasks.module';
import { AuditModule } from './audit/audit.module';
import { OrgsModule } from './orgs/orgs.module';
import { SeedModule } from './seed/seed.module';
import { Organization } from '../entities/organization.entity';
import { User } from '../entities/user.entity';
import { Task } from '../entities/task.entity';
import { AuditLog } from '../entities/audit-log.entity';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { RbacGuard } from '@tm/auth';
import { AuditInterceptor } from './audit/audit.interceptor';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forRootAsync({
      useFactory: async () => {
        const dbType = process.env.DB_TYPE || 'sqlite';
        const dbPath = process.env.DB_PATH || './data.sqlite';
        return {
          type: dbType as any,
          database: dbPath,
          entities: [Organization, User, Task, AuditLog],
          synchronize: true,
          logging: false,
        };
      },
    }),
    AuthModule,
    OrgsModule,
    TasksModule,
    AuditModule,
    SeedModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RbacGuard },
    { provide: APP_INTERCEPTOR, useClass: AuditInterceptor },
  ],
})
export class AppModule {}
