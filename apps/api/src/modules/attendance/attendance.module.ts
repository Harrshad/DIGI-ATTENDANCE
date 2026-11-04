import { Module } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { AttendanceController } from './attendance.controller';
import { LocationsModule } from '../locations/locations.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [LocationsModule, AuthModule],
  controllers: [AttendanceController],
  providers: [AttendanceService],
  exports: [AttendanceService],
})
export class AttendanceModule {}
