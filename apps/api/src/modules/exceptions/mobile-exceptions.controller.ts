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
import { MobileAuthGuard } from '../auth/mobile-auth.guard';
import { ExceptionsService } from './exceptions.service';
import { mobileEscalateExceptionSchema } from '@triattendance/shared';

@Controller('api/v1/mobile/exceptions')
@UseGuards(MobileAuthGuard)
export class MobileExceptionsController {
  constructor(private readonly exceptionsService: ExceptionsService) {}

  @Post('escalate')
  @HttpCode(HttpStatus.OK)
  async escalateToSupervisor(@Req() req: any, @Body() body: unknown) {
    const parseResult = mobileEscalateExceptionSchema.safeParse(body);
    if (!parseResult.success) {
      throw new BadRequestException(parseResult.error.errors[0]?.message || 'Invalid escalation payload');
    }

    const { attendanceId, note } = parseResult.data;
    return this.exceptionsService.attachEmployeeNote(req.user.id, attendanceId, note);
  }
}

