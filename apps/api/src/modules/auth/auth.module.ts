import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';
import { AuthController } from './auth.controller';
import { MobileAuthController } from './mobile-auth.controller';
import { MobileAuthService } from './mobile-auth.service';
import { MobileTokenService } from './mobile-token.service';
import { MobileAuthGuard } from './mobile-auth.guard';

@Module({
  controllers: [AuthController, MobileAuthController],
  providers: [AuthService, AuthGuard, MobileAuthService, MobileTokenService, MobileAuthGuard],
  exports: [AuthService, AuthGuard, MobileAuthService, MobileTokenService, MobileAuthGuard],
})
export class AuthModule {}



