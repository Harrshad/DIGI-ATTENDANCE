import { Module } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { AttendanceController } from './attendance.controller';
import { LocationsModule } from '../locations/locations.module';
import { AuthModule } from '../auth/auth.module';
import { MobileShiftController } from './mobile-shift.controller';
import { MobileShiftService } from './mobile-shift.service';
import { MobileAttendanceController } from './mobile-attendance.controller';
import { MobileAttendanceService } from './mobile-attendance.service';

@Module({
  imports: [LocationsModule, AuthModule],
  controllers: [AttendanceController, MobileShiftController, MobileAttendanceController],
  providers: [AttendanceService, MobileShiftService, MobileAttendanceService],
  exports: [AttendanceService, MobileShiftService, MobileAttendanceService],
})
export class AttendanceModule {}


