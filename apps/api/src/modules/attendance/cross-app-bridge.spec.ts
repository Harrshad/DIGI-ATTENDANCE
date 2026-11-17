import { describe, it, expect, vi } from 'vitest';
import { MobileAttendanceService } from './mobile-attendance.service';
import { UnprocessableEntityException } from '@nestjs/common';

describe('Cross-App Attendance Integration Bridge', () => {
  it('1. Outside-boundary check-in (1.4 km) creates an exception and returns 422 with exact distance', async () => {
    const mockDb: any = {
      select: vi.fn().mockReturnThis(),
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockReturnThis(),
      limit: vi.fn().mockImplementation(() => {
        return Promise.resolve([
          {
            id: 'site-blr-1',
            name: 'BLR-1',
            radiusMeters: 800,
          },
        ]);
      }),
      insert: vi.fn().mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([{ id: 'att-rejected-123' }]),
        }),
      }),
    };

    const mockLocationsService: any = {
      evaluateGeofence: vi.fn().mockResolvedValue({
        isInside: false,
        measuredDistanceMeters: 1400,
        distanceOutsideBoundaryMeters: 600,
        allowedRadiusMeters: 800,
        locationName: 'BLR-1',
      }),
    };

    const attendanceService = new MobileAttendanceService(mockDb, mockLocationsService);

    let errorThrown: any;
    try {
      await attendanceService.processCheckIn('emp-1', {
        siteId: 'a3bb189e-8bf9-3888-9912-ace4e6543002',
        latitude: 12.9816,
        longitude: 77.6046,
        accuracyMeters: 8,
        isMockLocation: false,
        clientCapturedAt: new Date().toISOString(),
        deviceId: 'device-1',
        idempotencyKey: 'c4dd290f-9ca0-4999-aa23-bdf5f7654113',
        livenessPassed: true,
        blinkDetected: true,
      });
    } catch (err) {
      errorThrown = err;
    }

    expect(errorThrown).toBeInstanceOf(UnprocessableEntityException);
    const response = errorThrown.getResponse();
    expect(response.error).toBe('OutsideGeofence');
    expect(response.measuredDistanceMeters).toBe(1400);
    expect(response.distanceOutsideMeters).toBe(600);
  });

  it('2. Inside-boundary check-in (within 800m) successfully marks shift Checked IN', async () => {
    const mockDb: any = {
      select: vi.fn().mockReturnThis(),
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockReturnThis(),
      limit: vi.fn().mockImplementation(() => {
        return Promise.resolve([
          {
            id: 'site-blr-1',
            name: 'BLR-1',
            radiusMeters: 800,
          },
        ]);
      }),
      insert: vi.fn().mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([{ id: 'att-ok-456' }]),
        }),
      }),
    };

    const mockLocationsService: any = {
      evaluateGeofence: vi.fn().mockResolvedValue({
        isInside: true,
        measuredDistanceMeters: 350,
        distanceOutsideBoundaryMeters: 0,
        allowedRadiusMeters: 800,
        locationName: 'BLR-1',
      }),
    };

    const attendanceService = new MobileAttendanceService(mockDb, mockLocationsService);
    const result = await attendanceService.processCheckIn('emp-1', {
      siteId: 'a3bb189e-8bf9-3888-9912-ace4e6543002',
      latitude: 12.9716,
      longitude: 77.5946,
      accuracyMeters: 8,
      isMockLocation: false,
      clientCapturedAt: new Date().toISOString(),
      deviceId: 'device-1',
      idempotencyKey: 'e5ee301a-8bb1-4111-bb34-cef6f8765224',
      livenessPassed: true,
      blinkDetected: true,
    });

    expect(result.success).toBe(true);
    expect(result.status).toBe('Checked IN');
    expect(result.siteCode).toBe('BLR-1');
  });
});

