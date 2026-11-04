import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  UseInterceptors,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiCookieAuth } from '@nestjs/swagger';
import { AttendanceService } from './attendance.service';
import { AuthGuard } from '../auth/auth.guard';
import { ScopingInterceptor } from '../../common/scoping.interceptor';
import { CurrentUser } from '../../common/current-user.decorator';
import {
  checkInRequestSchema,
  checkOutRequestSchema,
  CheckInRequest,
  CheckOutRequest,
  TodayAttendanceItem,
  DashboardKPISummary,
  UserProfile,
  ApiResponse as IApiResponse,
} from '@triattendance/shared';

@ApiTags('Attendance')
@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  /**
   * Public check-in endpoint for mobile app clients
   */
  @Post('check-in')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Submit location-verified mobile check-in with selfie' })
  async checkIn(@Body() body: CheckInRequest): Promise<IApiResponse<any>> {
    const parseResult = checkInRequestSchema.safeParse(body);
    if (!parseResult.success) {
      throw new BadRequestException(parseResult.error.issues[0]?.message);
    }
    const data = await this.attendanceService.processCheckIn(parseResult.data);
    return { success: true, data, message: 'Check-in processed.' };
  }

  /**
   * Public check-out endpoint for mobile app clients
   */
  @Post('check-out')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Submit employee check-out' })
  async checkOut(@Body() body: CheckOutRequest): Promise<IApiResponse<null>> {
    const parseResult = checkOutRequestSchema.safeParse(body);
    if (!parseResult.success) {
      throw new BadRequestException(parseResult.error.issues[0]?.message);
    }
    await this.attendanceService.processCheckOut(parseResult.data);
    return { success: true, data: null, message: 'Check-out recorded successfully.' };
  }

  /**
   * Web Portal: Today's attendance list (AM 02)
   */
  @Get('today')
  @UseGuards(AuthGuard)
  @UseInterceptors(ScopingInterceptor)
  @ApiCookieAuth('session_id')
  @ApiOperation({ summary: "Get today's team attendance for dashboard (AM 02)" })
  async getTodayAttendance(
    @CurrentUser() user: UserProfile
  ): Promise<IApiResponse<TodayAttendanceItem[]>> {
    const scopedIds = user.role === 'ADMIN' ? undefined : user.assignedLocationIds;
    const data = await this.attendanceService.getTodayAttendance(scopedIds);
    return { success: true, data };
  }

  /**
   * Web Portal: Today's 4 KPI cards (AM 02)
   */
  @Get('kpis')
  @UseGuards(AuthGuard)
  @UseInterceptors(ScopingInterceptor)
  @ApiCookieAuth('session_id')
  @ApiOperation({ summary: 'Get summary KPI counts for dashboard (AM 02)' })
  async getDashboardKpis(
    @CurrentUser() user: UserProfile
  ): Promise<IApiResponse<DashboardKPISummary>> {
    const scopedIds = user.role === 'ADMIN' ? undefined : user.assignedLocationIds;
    const data = await this.attendanceService.getDashboardKpis(scopedIds);
    return { success: true, data };
  }
}
