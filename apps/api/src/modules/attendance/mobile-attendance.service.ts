import { Injectable, BadRequestException, UnprocessableEntityException, Inject } from '@nestjs/common';
import { eq, and, desc, gte } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../../database/schema';
import { LocationsService } from '../locations/locations.service';
import {
  MobileCheckInInput,
  MobileCheckOutInput,
  MobileAttendanceSubmissionResponse,
} from '@triattendance/shared';

@Injectable()
export class MobileAttendanceService {
  constructor(
    @Inject('DRIZZLE_CLIENT') private readonly db: NodePgDatabase<typeof schema>,
    private readonly locationsService: LocationsService,
  ) {}

  /**
   * Processes a mobile check-in submission with authoritative server-side PostGIS geofence evaluation
   */
  async processCheckIn(
    employeeId: string,
    dto: MobileCheckInInput,
    selfieStorageKey?: string,
  ): Promise<MobileAttendanceSubmissionResponse> {
    const [employee] = await this.db
      .select()
      .from(schema.employees)
      .where(eq(schema.employees.id, employeeId))
      .limit(1);

    if (!employee) {
      throw new BadRequestException('Employee record not found');
    }

    const [location] = await this.db
      .select()
      .from(schema.locations)
      .where(eq(schema.locations.id, dto.siteId))
      .limit(1);

    if (!location) {
      throw new BadRequestException('Work site not found');
    }

    // Authoritative PostGIS geofence calculation
    const geofenceResult = await this.locationsService.evaluateGeofence(
      dto.siteId,
      dto.latitude,
      dto.longitude,
    );

    const serverNow = new Date();
    const istTimeStr = serverNow.toLocaleTimeString('en-US', {
      timeZone: 'Asia/Kolkata',
      hour12: true,
      hour: '2-digit',
      minute: '2-digit',
    });
    const istDateStr = serverNow.toLocaleDateString('en-GB', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

    const isInside = geofenceResult.isInside;
    const measuredDistance = Math.round(geofenceResult.measuredDistanceMeters);
    const radiusMeters = location.radiusMeters || 800;
    const distanceOutside = isInside ? 0 : Math.max(0, measuredDistance - radiusMeters);

    let status: 'Present' | 'Late' | 'Rejected' | 'Flagged' = 'Present';

    // Shift late cutoff (09:30 AM IST)
    const istHours24 = parseInt(
      serverNow.toLocaleTimeString('en-US', { timeZone: 'Asia/Kolkata', hour12: false, hour: '2-digit' }),
      10,
    );
    const istMinutes = parseInt(
      serverNow.toLocaleTimeString('en-US', { timeZone: 'Asia/Kolkata', hour12: false, minute: '2-digit' }),
      10,
    );
    const isLate = istHours24 > 9 || (istHours24 === 9 && istMinutes > 30);

    if (dto.isMockLocation || !isInside) {
      status = 'Rejected';
    } else if (!dto.livenessPassed) {
      status = 'Flagged';
    } else if (isLate) {
      status = 'Late';
    }

    const [attendance] = await this.db
      .insert(schema.attendanceRecords)
      .values({
        employeeId: employee.id,
        locationId: location.id,
        attemptedCheckInAt: serverNow,
        selfieCapuredAt: serverNow,
        latitude: dto.latitude.toString(),
        longitude: dto.longitude.toString(),
        gpsAccuracyMeters: dto.accuracyMeters.toString(),
        isMockLocation: dto.isMockLocation,
        distanceFromBoundaryMeters: distanceOutside.toString(),
        selfieStorageKey: selfieStorageKey || 'selfies/mock-selfie-photo.jpg',
        livenessPassed: dto.livenessPassed,
        blinkAttemptCount: 1,
        status,
        siteNameSnapshot: location.name,
      })
      .returning();

    if (!attendance) {
      throw new BadRequestException('Failed to record attendance');
    }

    // If outside geofence or flagged, automatically create an exception
    if (status === 'Rejected' || status === 'Flagged') {
      await this.db.insert(schema.exceptions).values({
        attendanceRecordId: attendance.id,
        employeeId: employee.id,
        type: !isInside ? 'GEOFENCE' : 'LIVENESS',
        status: 'Pending',
      });

      throw new UnprocessableEntityException({
        success: false,
        error: 'OutsideGeofence',
        message: `You are about ${(measuredDistance / 1000).toFixed(1)} km from ${location.name}. Attendance can only be recorded inside the site boundary.`,
        attendanceId: attendance.id,
        siteCode: location.name,
        measuredDistanceMeters: measuredDistance,
        distanceOutsideMeters: distanceOutside,
      });
    }

    return {
      success: true,
      attendanceId: attendance.id,
      status: 'Checked IN',
      serverTimestamp: serverNow.toISOString(),
      formattedTime: istTimeStr,
      formattedDate: istDateStr,
      siteCode: location.name,
      siteName: location.name,
      coordinates: {
        latitude: dto.latitude,
        longitude: dto.longitude,
      },
    };
  }

  /**
   * Processes a mobile check-out submission
   */
  async processCheckOut(
    employeeId: string,
    dto: MobileCheckOutInput,
  ): Promise<MobileAttendanceSubmissionResponse> {
    const serverNow = new Date();
    const startOfDay = new Date(serverNow);
    startOfDay.setUTCHours(0, 0, 0, 0);

    const [openAttendance] = await this.db
      .select()
      .from(schema.attendanceRecords)
      .where(
        and(
          eq(schema.attendanceRecords.employeeId, employeeId),
          gte(schema.attendanceRecords.attemptedCheckInAt, startOfDay),
        ),
      )
      .orderBy(desc(schema.attendanceRecords.attemptedCheckInAt))
      .limit(1);

    if (!openAttendance) {
      throw new BadRequestException('No active check-in found for today');
    }

    const checkInTime = new Date(openAttendance.selfieCapuredAt || openAttendance.attemptedCheckInAt);
    const durationSeconds = Math.max(0, Math.floor((serverNow.getTime() - checkInTime.getTime()) / 1000));
    const hours = Math.floor(durationSeconds / 3600);
    const minutes = Math.floor((durationSeconds % 3600) / 60);
    const totalWorkFormatted = `${hours}h ${minutes}m`;

    await this.db
      .update(schema.attendanceRecords)
      .set({
        checkOutAt: serverNow,
      })
      .where(eq(schema.attendanceRecords.id, openAttendance.id));

    const istTimeStr = serverNow.toLocaleTimeString('en-US', {
      timeZone: 'Asia/Kolkata',
      hour12: true,
      hour: '2-digit',
      minute: '2-digit',
    });
    const istDateStr = serverNow.toLocaleDateString('en-GB', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

    return {
      success: true,
      attendanceId: openAttendance.id,
      status: 'Checked Out',
      serverTimestamp: serverNow.toISOString(),
      formattedTime: istTimeStr,
      formattedDate: istDateStr,
      siteCode: openAttendance.siteNameSnapshot || 'BLR-1',
      siteName: openAttendance.siteNameSnapshot || 'BLR-1',
      coordinates: {
        latitude: dto.latitude,
        longitude: dto.longitude,
      },
      totalWorkFormatted,
    };
  }
}
