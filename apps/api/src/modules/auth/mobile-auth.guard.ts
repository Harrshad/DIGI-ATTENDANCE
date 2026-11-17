import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { MobileTokenService, JwtPayload } from '../auth/mobile-token.service';

export interface MobileRequestUser {
  id: string;
  employeeCode?: string;
  role: string;
}

@Injectable()
export class MobileAuthGuard implements CanActivate {
  constructor(private readonly tokenService: MobileTokenService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid Authorization bearer token');
    }

    const token = authHeader.substring(7).trim();
    try {
      const payload = this.tokenService.verify<JwtPayload>(token);
      request.user = {
        id: payload.sub,
        employeeCode: payload.employeeCode,
        role: payload.role || 'EMPLOYEE',
      } as MobileRequestUser;
      return true;
    } catch (err: unknown) {
      throw new UnauthorizedException((err as Error).message || 'Invalid or expired mobile token');
    }
  }
}

