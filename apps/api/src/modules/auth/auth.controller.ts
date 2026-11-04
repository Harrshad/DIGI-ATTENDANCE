import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  Res,
  UseGuards,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';
import { CurrentUser } from '../../common/current-user.decorator';
import { loginSchema, LoginRequest, UserProfile, ApiResponse as IApiResponse } from '@triattendance/shared';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Sign in to the account manager portal' })
  @ApiResponse({ status: 200, description: 'Signed in successfully with HttpOnly session cookie' })
  @ApiResponse({ status: 401, description: 'Invalid email or password' })
  @ApiResponse({ status: 403, description: 'Account locked due to 5 failed attempts' })
  async login(
    @Body() body: LoginRequest,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<IApiResponse<UserProfile>> {
    const parseResult = loginSchema.safeParse(body);
    if (!parseResult.success) {
      throw new BadRequestException(parseResult.error.issues[0]?.message);
    }

    const clientIp = req.ip || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];

    const { sessionToken, user, expiresAt } = await this.authService.login(
      parseResult.data.email,
      parseResult.data.password,
      clientIp,
      userAgent,
    );

    // Set secure HttpOnly session cookie
    res.cookie('session_id', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: expiresAt,
      path: '/',
    });

    return {
      success: true,
      data: user,
      message: 'Signed in successfully.',
    };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Log out and invalidate session' })
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<IApiResponse<null>> {
    const sessionToken = req.cookies?.['session_id'];
    if (sessionToken) {
      await this.authService.logout(sessionToken);
    }

    res.clearCookie('session_id', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    return {
      success: true,
      data: null,
      message: 'Logged out successfully.',
    };
  }

  @Get('me')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Get current authenticated user profile with assigned sites' })
  @ApiResponse({ status: 200, description: 'Profile retrieved' })
  @ApiResponse({ status: 401, description: 'Unauthenticated' })
  async me(@CurrentUser() user: UserProfile): Promise<IApiResponse<UserProfile>> {
    return {
      success: true,
      data: user,
    };
  }
}
