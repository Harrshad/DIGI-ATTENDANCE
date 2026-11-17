import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { eq, and, desc, gte, lte } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../../database/schema';
import { MobileAssignedSite, MobileTodayShift, MobileShiftStatus } from '@triattendance/shared';

@Injectable()
export class MobileShiftService {
  constructor(
    @Inject('DRIZZLE_CLIENT') private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  /**
   * Returns assigned site details for the authenticated mobile employee
   */
  async getAssignedSite(employeeId: string): Promise<MobileAssignedSite> {
    const [employee] = await this.db
      .select()
      .from(schema.employees)
      .where(eq(schema.employees.id, employeeId))
      .limit(1);

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    if (employee.assignedLocationId) {
      const [location] = await this.db
        .select()
        .from(schema.locations)
        .where(eq(schema.locations.id, employee.assignedLocationId))
        .limit(1);

      if (location) {
        return {
          siteId: location.id,
          siteCode: location.name,
          name: location.name,
          city: location.city,
          latitude: parseFloat(location.latitude as unknown as string),
          longitude: parseFloat(location.longitude as unknown as string),
          radiusMeters: location.radiusMeters || 800,
          shiftStartTime: '09:00',
          lateCutoffTime: '09:30',
          timezone: 'Asia/Kolkata',
        };
      }
    }

    // Default reference fallback site (BLR-1, Bengaluru)
    return {
      siteId: '00000000-0000-0000-0000-000000000000',
      siteCode: 'BLR-1',
      name: 'BLR-1, Bengaluru Headquarters',
      city: 'Bengaluru',
      latitude: 12.9716,
      longitude: 77.5946,
      radiusMeters: 800,
      shiftStartTime: '09:00',
      lateCutoffTime: '09:30',
      timezone: 'Asia/Kolkata',
    };
  }

  /**
   * Computes the current employee's shift state for today
   */
  async getTodayShift(employeeId: string): Promise<MobileTodayShift> {
    const site = await this.getAssignedSite(employeeId);

    // Calculate start and end of "today" in UTC corresponding to Asia/Kolkata
    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(now);
    endOfDay.setUTCHours(23, 59, 59, 999);

    const [record] = await this.db
      .select()
      .from(schema.attendanceRecords)
      .where(
        and(
          eq(schema.attendanceRecords.employeeId, employeeId),
          gte(schema.attendanceRecords.attemptedCheckInAt, startOfDay),
          lte(schema.attendanceRecords.attemptedCheckInAt, endOfDay),
        ),
      )
      .orderBy(desc(schema.attendanceRecords.attemptedCheckInAt))
      .limit(1);

    if (!record) {
      return {
        status: 'Check-in Pending',
        checkInTime: null,
        checkOutTime: null,
        totalWorkSeconds: 0,
        totalWorkFormatted: '0h 0m',
        site,
        coordinates: null,
        exceptionPending: false,
      };
    }

    let status: MobileShiftStatus = 'Checked IN';
    if (record.status === 'Rejected' || record.status === 'Flagged') {
      status = 'Pending Review';
    } else if (record.checkOutAt) {
      status = 'Checked Out';
    }

    const checkInDate = new Date(record.selfieCapuredAt || record.attemptedCheckInAt);
    const checkOutDate = record.checkOutAt ? new Date(record.checkOutAt) : null;

    let totalWorkSeconds = 0;
    if (checkOutDate) {
      totalWorkSeconds = Math.max(0, Math.floor((checkOutDate.getTime() - checkInDate.getTime()) / 1000));
    } else {
      totalWorkSeconds = Math.max(0, Math.floor((now.getTime() - checkInDate.getTime()) / 1000));
    }

    const hours = Math.floor(totalWorkSeconds / 3600);
    const minutes = Math.floor((totalWorkSeconds % 3600) / 60);
    const totalWorkFormatted = `${hours}h ${minutes}m`;

    const formatTime = (d: Date) =>
      d.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        timeZone: 'Asia/Kolkata',
      });

    return {
      status,
      checkInTime: formatTime(checkInDate),
      checkOutTime: checkOutDate ? formatTime(checkOutDate) : null,
      totalWorkSeconds,
      totalWorkFormatted,
      site,
      coordinates: {
        latitude: parseFloat(record.latitude as unknown as string),
        longitude: parseFloat(record.longitude as unknown as string),
      },
      exceptionPending: status === 'Pending Review',
    };
  }
}

