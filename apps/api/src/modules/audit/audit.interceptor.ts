import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, catchError, tap, throwError } from 'rxjs';
import { AuditLogService } from './audit.service';
import { JwtUser } from '../common/request-user';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly audit: AuditLogService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const http = context.switchToHttp();
    const req = http.getRequest();
    const user = req.user as JwtUser | undefined;

    const action = `${req.method} ${req.route?.path ?? req.url}`;
    const baseEntry = {
      userId: user?.userId ?? null,
      orgId: user?.orgId ?? null,
      action,
      method: req.method,
      path: req.originalUrl ?? req.url,
      resourceId: req.params?.id ?? null,
      ip: req.ip ?? null,
    };

    return next.handle().pipe(
      tap(async () => {
        await this.audit.append({ ...baseEntry, outcome: 'ALLOWED', statusCode: 200 });
      }),
      catchError((err) => {
        const statusCode = err?.status ?? 500;
        this.audit.append({ ...baseEntry, outcome: 'DENIED', statusCode }).catch(() => {});
        return throwError(() => err);
      })
    );
  }
}
