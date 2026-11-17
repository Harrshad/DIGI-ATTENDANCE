import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { MobileAttendanceService } from './mobile-attendance.service';
import { MobileAuthGuard } from '../auth/mobile-auth.guard';
import {
  mobileCheckInSchema,
  mobileCheckOutSchema,
} from '@triattendance/shared';

@Controller('api/v1/mobile/attendance')
@UseGuards(MobileAuthGuard)
export class MobileAttendanceController {
  constructor(private readonly mobileAttendanceService: MobileAttendanceService) {}

  @Post('check-in')
  @HttpCode(HttpStatus.OK)
  async checkIn(@Req() req: any, @Body() body: unknown) {
    const parseResult = mobileCheckInSchema.safeParse(body);
    if (!parseResult.success) {
      throw new BadRequestException(parseResult.error.errors[0]?.message || 'Invalid check-in payload');
    }
    return this.mobileAttendanceService.processCheckIn(req.user.id, parseResult.data);
  }

  @Post('check-out')
  @HttpCode(HttpStatus.OK)
  async checkOut(@Req() req: any, @Body() body: unknown) {
    const parseResult = mobileCheckOutSchema.safeParse(body);
    if (!parseResult.success) {
      throw new BadRequestException(parseResult.error.errors[0]?.message || 'Invalid check-out payload');
    }
    return this.mobileAttendanceService.processCheckOut(req.user.id, parseResult.data);
  }
}

