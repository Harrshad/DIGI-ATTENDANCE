import {
  Controller,
  Get,
  Patch,
  Post,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiCookieAuth } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../../common/current-user.decorator';
import {
  AppNotification,
  UserProfile,
  ApiResponse as IApiResponse,
} from '@triattendance/shared';

@ApiTags('Notifications')
@ApiCookieAuth('session_id')
@Controller('notifications')
@UseGuards(AuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get active in-app notifications for authenticated manager' })
  @ApiResponse({ status: 200, description: 'Notifications list' })
  async getNotifications(
    @CurrentUser() user: UserProfile
  ): Promise<IApiResponse<AppNotification[]>> {
    const data = await this.notificationsService.getNotifications(user);
    return { success: true, data };
  }

  @Patch(':id/read')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark an in-app notification as read' })
  async markAsRead(
    @Param('id') id: string,
    @CurrentUser() user: UserProfile
  ): Promise<IApiResponse<null>> {
    await this.notificationsService.markAsRead(id, user);
    return { success: true, data: null, message: 'Notification marked as read.' };
  }

  @Post('retention-cleanup')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Trigger India DPDP 90-day selfie retention cleanup' })
  async triggerPurge(): Promise<IApiResponse<{ purgedCount: number }>> {
    const data = await this.notificationsService.executeRetentionPurge();
    return {
      success: true,
      data,
      message: `DPDP 90-day cleanup completed: ${data.purgedCount} selfie binaries removed.`,
    };
  }
}
