import { Module, Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { verifyDatabaseConnection } from './database/drizzle.client';
import { AuthModule } from './modules/auth/auth.module';
import { LocationsModule } from './modules/locations/locations.module';
import { AttendanceModule } from './modules/attendance/attendance.module';
import { ExceptionsModule } from './modules/exceptions/exceptions.module';
import { WorkforceModule } from './modules/workforce/workforce.module';
import { ReportsModule } from './modules/reports/reports.module';
import { NotificationsModule } from './modules/notifications/notifications.module';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  @Get()
  @ApiOperation({ summary: 'API & PostGIS Health Check' })
  @ApiResponse({ status: 200, description: 'Service operational' })
  async checkHealth() {
    const postgisVersion = await verifyDatabaseConnection();
    return {
      status: 'ok',
      service: 'TriAttendance API',
      timestamp: new Date().toISOString(),
      postgis: postgisVersion,
    };
  }
}

@Module({
  imports: [
    AuthModule,
    LocationsModule,
    AttendanceModule,
    ExceptionsModule,
    WorkforceModule,
    ReportsModule,
    NotificationsModule,
  ],
  controllers: [HealthController],
  providers: [],
})
export class AppModule {}
