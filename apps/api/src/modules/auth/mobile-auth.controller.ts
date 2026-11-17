import { Controller, Post, Body, HttpCode, HttpStatus, BadRequestException } from '@nestjs/common';
import { MobileAuthService } from './mobile-auth.service';
import {
  mobileLoginSchema,
  mobileActivationRequestSchema,
  mobileVerifyActivationSchema,
  mobileRefreshTokenSchema,
} from '@triattendance/shared';

@Controller('api/v1/auth/mobile')
export class MobileAuthController {
  constructor(private readonly mobileAuthService: MobileAuthService) { }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() body: unknown) {
    const parseResult = mobileLoginSchema.safeParse(body);
    if (!parseResult.success) {
      throw new BadRequestException(parseResult.error.errors[0]?.message || 'Invalid login payload');
    }
    return this.mobileAuthService.login(parseResult.data);
  }

  @Post('activate')
  @HttpCode(HttpStatus.OK)
  async requestActivation(@Body() body: unknown) {
    const parseResult = mobileActivationRequestSchema.safeParse(body);
    if (!parseResult.success) {
      throw new BadRequestException(parseResult.error.errors[0]?.message || 'Invalid activation payload');
    }
    return this.mobileAuthService.requestActivation(parseResult.data);
  }

  @Post('verify-activation')
  @HttpCode(HttpStatus.OK)
  async verifyActivation(@Body() body: unknown) {
    const parseResult = mobileVerifyActivationSchema.safeParse(body);
    if (!parseResult.success) {
      throw new BadRequestException(parseResult.error.errors[0]?.message || 'Invalid verification payload');
    }
    return this.mobileAuthService.verifyActivation(parseResult.data);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() body: unknown) {
    const parseResult = mobileRefreshTokenSchema.safeParse(body);
    if (!parseResult.success) {
      throw new BadRequestException(parseResult.error.errors[0]?.message || 'Invalid refresh token payload');
    }
    return this.mobileAuthService.refreshToken(parseResult.data);
  }
}
