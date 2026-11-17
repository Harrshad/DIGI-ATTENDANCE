import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { eq, desc } from 'drizzle-orm';
import { db } from '../../database/drizzle.client';
import {
  exceptions,
  exceptionReviews,
  attendanceRecords,
  employees,
  locations,
  auditLogs,
} from '../../database/schema';
import { LocalGarageStorageService } from '../../storage/local-garage-storage.service';
import {
  ExceptionQueueItem,
  ExceptionReviewDetail,
  EscalateExceptionRequest,
  ResolveExceptionRequest,
  UserProfile,
} from '@triattendance/shared';

@Injectable()
export class ExceptionsService {
  constructor(private readonly storageService: LocalGarageStorageService) {}

  /**
   * Attaches an employee escalation note to an existing exception (E20 -> E22)
   */
  async attachEmployeeNote(employeeId: string, attendanceId: string | undefined, note: string) {
    let exceptionRecord;

    if (attendanceId) {
      [exceptionRecord] = await db
        .select()
        .from(exceptions)
        .where(eq(exceptions.attendanceRecordId, attendanceId))
        .limit(1);
    } else {
      [exceptionRecord] = await db
        .select()
        .from(exceptions)
        .where(eq(exceptions.employeeId, employeeId))
        .orderBy(desc(exceptions.createdAt))
        .limit(1);
    }

    if (!exceptionRecord) {
      throw new NotFoundException('No matching open exception found for this attendance.');
    }

    await db
      .update(exceptions)
      .set({
        employeeNote: note,
        status: 'Escalated',
      })
      .where(eq(exceptions.id, exceptionRecord.id));

    return {
      success: true,
      exceptionId: exceptionRecord.id,
      status: 'Escalated',
      message: 'Message sent to supervisor. Your shift is pending review.',
    };
  }

  /**
   * Retrieves alerts/exceptions queue matching AM 06
   */
  async getExceptionsQueue(
    tab?: 'ALL_OPEN' | 'GEOFENCE' | 'LIVENESS' | 'MISSING_CHECKOUT',
    scopedLocationIds?: string[]
  ): Promise<ExceptionQueueItem[]> {
    const query = db
      .select({
        id: exceptions.id,
        attendanceRecordId: exceptions.attendanceRecordId,
        type: exceptions.type,
        status: exceptions.status,
        createdAt: exceptions.createdAt,
        employeeId: employees.id,
        employeeCode: employees.employeeCode,
        employeeName: employees.name,
        attemptedCheckInAt: attendanceRecords.attemptedCheckInAt,
        checkOutAt: attendanceRecords.checkOutAt,
        siteName: locations.name,
        distanceOutside: attendanceRecords.distanceFromBoundaryMeters,
        locationId: attendanceRecords.locationId,
      })
      .from(exceptions)
      .innerJoin(attendanceRecords, eq(exceptions.attendanceRecordId, attendanceRecords.id))
      .innerJoin(employees, eq(exceptions.employeeId, employees.id))
      .leftJoin(locations, eq(attendanceRecords.locationId, locations.id))
      .orderBy(desc(exceptions.createdAt));

    const rows = await query;

    // Filter in-memory by scoped sites & tab
    const filtered = rows.filter((r) => {
      if (scopedLocationIds && scopedLocationIds.length > 0 && r.locationId) {
        if (!scopedLocationIds.includes(r.locationId)) return false;
      }
      if (tab === 'GEOFENCE') return r.type === 'GEOFENCE';
      if (tab === 'LIVENESS') return r.type === 'LIVENESS';
      if (tab === 'MISSING_CHECKOUT') return r.type === 'MISSING_CHECKOUT';
      return true;
    });

    return filtered.map((r) => {
      const initials = r.employeeName
        .split(' ')
        .map((p) => p[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();

      const dateStr = r.attemptedCheckInAt
        ? new Date(r.attemptedCheckInAt).toLocaleDateString('en-GB', {
            timeZone: 'Asia/Kolkata',
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })
        : '';

      const checkInStr = r.attemptedCheckInAt
        ? new Date(r.attemptedCheckInAt).toLocaleTimeString('en-US', {
            timeZone: 'Asia/Kolkata',
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
          })
        : '-';

      const checkOutStr = r.checkOutAt
        ? new Date(r.checkOutAt).toLocaleTimeString('en-US', {
            timeZone: 'Asia/Kolkata',
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
          })
        : '—';

      const isOutside = Number(r.distanceOutside || 0) > 0;

      return {
        id: r.id,
        attendanceRecordId: r.attendanceRecordId,
        employeeId: r.employeeId,
        employeeCode: r.employeeCode,
        employeeName: r.employeeName,
        initials,
        date: dateStr,
        checkInTime: checkInStr,
        checkOutTime: checkOutStr,
        siteName: isOutside ? 'Outside boundary' : r.siteName || 'Unknown',
        status: (r.status === 'Rejected' ? 'Rejected' : r.status === 'Flagged' ? 'Flagged' : 'Pending') as any,
        type: r.type as any,
        isOutsideBoundary: isOutside,
      };
    });
  }

  /**
   * Retrieves single exception review detail matching AM 07
   */
  async getExceptionDetail(
    exceptionId: string,
    currentUser: UserProfile
  ): Promise<ExceptionReviewDetail> {
    const [row] = await db
      .select({
        id: exceptions.id,
        attendanceRecordId: exceptions.attendanceRecordId,
        type: exceptions.type,
        status: exceptions.status,
        employeeId: employees.id,
        employeeCode: employees.employeeCode,
        employeeName: employees.name,
        reportingManagerName: employees.reportingManagerName,
        attemptedCheckInAt: attendanceRecords.attemptedCheckInAt,
        selfieCapturedAt: attendanceRecords.selfieCapuredAt,
        checkOutAt: attendanceRecords.checkOutAt,
        latitude: attendanceRecords.latitude,
        longitude: attendanceRecords.longitude,
        gpsAccuracyMeters: attendanceRecords.gpsAccuracyMeters,
        distanceFromBoundaryMeters: attendanceRecords.distanceFromBoundaryMeters,
        selfieStorageKey: attendanceRecords.selfieStorageKey,
        livenessPassed: attendanceRecords.livenessPassed,
        blinkAttemptCount: attendanceRecords.blinkAttemptCount,
        locationName: locations.name,
        locationRadius: locations.radiusMeters,
        locationLat: locations.latitude,
        locationLng: locations.longitude,
      })
      .from(exceptions)
      .innerJoin(attendanceRecords, eq(exceptions.attendanceRecordId, attendanceRecords.id))
      .innerJoin(employees, eq(exceptions.employeeId, employees.id))
      .leftJoin(locations, eq(attendanceRecords.locationId, locations.id))
      .where(eq(exceptions.id, exceptionId))
      .limit(1);

    if (!row) {
      throw new NotFoundException(`Exception #${exceptionId} not found.`);
    }

    const selfieKey = row.selfieStorageKey || `selfies/${row.employeeCode}.jpg`;
    const presignedUrl = await this.storageService.getPresignedUrl(selfieKey, 900);

    const dateFormatted = row.attemptedCheckInAt
      ? new Date(row.attemptedCheckInAt).toLocaleDateString('en-US', {
          timeZone: 'Asia/Kolkata',
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })
      : '';

    const attemptedTimeFormatted = row.attemptedCheckInAt
      ? new Date(row.attemptedCheckInAt).toLocaleTimeString('en-US', {
          timeZone: 'Asia/Kolkata',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        })
      : '';

    const selfieTimeFormatted = row.selfieCapturedAt
      ? new Date(row.selfieCapturedAt).toLocaleTimeString('en-US', {
          timeZone: 'Asia/Kolkata',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        })
      : attemptedTimeFormatted;

    const checkOutFormatted = row.checkOutAt
      ? new Date(row.checkOutAt).toLocaleTimeString('en-US', {
          timeZone: 'Asia/Kolkata',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        })
      : null;

    const siteRadius = row.locationRadius || 500;
    const distanceOutside = Math.round(Number(row.distanceFromBoundaryMeters || 0));
    const measuredDistance = siteRadius + distanceOutside;
    const gpsAccuracy = Math.round(Number(row.gpsAccuracyMeters || 8));

    // Log evidence view for DPDP compliance audit trail
    await db.insert(auditLogs).values({
      actorId: currentUser.id,
      actorType: 'USER',
      actorName: currentUser.name,
      action: 'EVIDENCE_VIEWED',
      targetId: row.attendanceRecordId,
      targetType: 'ATTENDANCE_RECORD',
      details: { exceptionId: row.id, employeeCode: row.employeeCode },
    });

    const canApproveOrReject =
      currentUser.role === 'ADMIN' ||
      currentUser.role === 'SUPERVISOR' ||
      Boolean(currentUser.hasDelegatedResolutionPermission);

    return {
      id: row.id,
      attendanceRecordId: row.attendanceRecordId,
      employeeId: row.employeeId,
      employeeCode: row.employeeCode,
      employeeName: row.employeeName,
      dateFormatted,
      reportingManagerName: row.reportingManagerName || 'Anita Menon',
      attemptedCheckInTime: attemptedTimeFormatted,
      assignedSiteCode: row.locationName || 'CHN-1',
      assignedSiteRadiusMeters: siteRadius,
      siteCenterLatitude: parseFloat(row.locationLat || '12.9716'),
      siteCenterLongitude: parseFloat(row.locationLng || '77.5946'),
      actualCheckInLatitude: parseFloat(row.latitude),
      actualCheckInLongitude: parseFloat(row.longitude),
      measuredDistanceMeters: measuredDistance,
      distanceOutsideBoundaryMeters: distanceOutside,
      gpsAccuracyMeters: gpsAccuracy,
      isGpsReliable: gpsAccuracy <= 15,
      blinkVerificationPassed: row.livenessPassed,
      blinkAttemptCount: row.blinkAttemptCount || 1,
      checkOutTime: checkOutFormatted,
      selfiePresignedUrl: presignedUrl,
      selfieCapturedAt: selfieTimeFormatted,
      currentStatus: (row.status === 'Rejected' ? 'Rejected' : row.status === 'Flagged' ? 'Flagged' : 'Pending') as any,
      canApproveOrReject,
    };
  }

  /**
   * Escalates exception to supervisor (AM 07 primary action)
   */
  async escalateException(
    exceptionId: string,
    dto: EscalateExceptionRequest,
    currentUser: UserProfile
  ): Promise<void> {
    const [exc] = await db
      .select()
      .from(exceptions)
      .where(eq(exceptions.id, exceptionId))
      .limit(1);

    if (!exc) {
      throw new NotFoundException(`Exception #${exceptionId} not found.`);
    }

    await db
      .update(exceptions)
      .set({ status: 'Escalated' })
      .where(eq(exceptions.id, exceptionId));

    await db.insert(exceptionReviews).values({
      exceptionId,
      reviewerId: currentUser.id,
      reviewerName: currentUser.name,
      decision: 'ESCALATE',
      note: dto.note,
      supervisorId: dto.supervisorId,
    });

    await db.insert(auditLogs).values({
      actorId: currentUser.id,
      actorType: 'USER',
      actorName: currentUser.name,
      action: 'EXCEPTION_ESCALATED',
      targetId: exceptionId,
      targetType: 'EXCEPTION',
      details: { note: dto.note },
    });
  }

  /**
   * Resolves exception directly (for users with delegated permission or Supervisors/Admins)
   */
  async resolveException(
    exceptionId: string,
    dto: ResolveExceptionRequest,
    currentUser: UserProfile
  ): Promise<void> {
    const [exc] = await db
      .select()
      .from(exceptions)
      .where(eq(exceptions.id, exceptionId))
      .limit(1);

    if (!exc) {
      throw new NotFoundException(`Exception #${exceptionId} not found.`);
    }

    if (
      currentUser.role !== 'ADMIN' &&
      currentUser.role !== 'SUPERVISOR' &&
      !currentUser.hasDelegatedResolutionPermission
    ) {
      throw new BadRequestException('You do not possess permission to resolve exceptions directly.');
    }

    const newAttendanceStatus = dto.decision === 'APPROVE' ? 'Present' : 'Absent';
    const exceptionStatus = dto.decision === 'APPROVE' ? 'Resolved' : 'Rejected';

    await db
      .update(exceptions)
      .set({ status: exceptionStatus, resolvedAt: new Date() })
      .where(eq(exceptions.id, exceptionId));

    await db
      .update(attendanceRecords)
      .set({ status: newAttendanceStatus })
      .where(eq(attendanceRecords.id, exc.attendanceRecordId));

    await db.insert(exceptionReviews).values({
      exceptionId,
      reviewerId: currentUser.id,
      reviewerName: currentUser.name,
      decision: dto.decision,
      note: dto.note,
    });

    await db.insert(auditLogs).values({
      actorId: currentUser.id,
      actorType: 'USER',
      actorName: currentUser.name,
      action: dto.decision === 'APPROVE' ? 'EXCEPTION_APPROVED' : 'EXCEPTION_REJECTED',
      targetId: exceptionId,
      targetType: 'EXCEPTION',
      details: { decision: dto.decision, note: dto.note },
    });
  }
}
