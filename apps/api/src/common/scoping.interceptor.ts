import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  ForbiddenException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { UserProfile } from '@triattendance/shared';

/**
 * Server-side scoping interceptor.
 * Guarantees that Account Managers can only query or act upon data within their assigned locations.
 * Admins bypass scoping checks.
 */
@Injectable()
export class ScopingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const user = request.user as UserProfile | undefined;

    if (!user) {
      return next.handle();
    }

    // Admins have organization-wide visibility
    if (user.role === 'ADMIN') {
      return next.handle();
    }

    // For Account Managers and Supervisors, validate location scope in query params or route params
    const requestedLocationId =
      request.params?.locationId ||
      request.query?.locationId ||
      request.body?.locationId;

    if (
      requestedLocationId &&
      requestedLocationId !== 'all' &&
      !user.assignedLocationIds.includes(requestedLocationId)
    ) {
      throw new ForbiddenException(
        'Access denied: You do not manage this site. Data scoping policy strictly enforced.',
      );
    }

    // Attach allowed location IDs to request context for services to filter queries automatically
    request.scopedLocationIds = user.assignedLocationIds;

    return next.handle();
  }
}
