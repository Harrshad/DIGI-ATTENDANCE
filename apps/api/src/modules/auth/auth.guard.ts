import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from './auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const sessionToken =
      request.cookies?.['session_id'] ||
      request.headers['authorization']?.replace(/^Bearer\s+/i, '');

    if (!sessionToken) {
      throw new UnauthorizedException('Authentication session required.');
    }

    const user = await this.authService.validateSession(sessionToken);
    (request as any).user = user;
    return true;
  }
}
