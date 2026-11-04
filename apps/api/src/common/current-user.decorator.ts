import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserProfile } from '@triattendance/shared';

/**
 * Custom parameter decorator to extract the authenticated UserProfile from the request
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): UserProfile | undefined => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
