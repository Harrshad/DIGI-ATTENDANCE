import { Controller, Get, UseGuards, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { MobileShiftService } from './mobile-shift.service';
import { MobileAuthGuard } from '../auth/mobile-auth.guard';
import { MobileAssignedSite, MobileTodayShift } from '@triattendance/shared';

@Controller('api/v1/mobile')
@UseGuards(MobileAuthGuard)
export class MobileShiftController {
  constructor(private readonly mobileShiftService: MobileShiftService) {}

  @Get('sites/assigned')
  @HttpCode(HttpStatus.OK)
  async getAssignedSite(@Req() req: any): Promise<MobileAssignedSite> {
    return this.mobileShiftService.getAssignedSite(req.user.id);
  }

  @Get('shift/today')
  @HttpCode(HttpStatus.OK)
  async getTodayShift(@Req() req: any): Promise<MobileTodayShift> {
    return this.mobileShiftService.getTodayShift(req.user.id);
  }
}

