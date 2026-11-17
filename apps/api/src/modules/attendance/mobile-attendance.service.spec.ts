import { describe, it, expect, vi } from 'vitest';
import { MobileAttendanceService } from './mobile-attendance.service';
import { UnprocessableEntityException } from '@nestjs/common';

describe('MobileAttendanceService', () => {
  it('throws UnprocessableEntityException when check-in is outside geofence', async () => {
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
          returning: vi.fn().mockResolvedValue([{ id: 'att-123' }]),
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

    const service = new MobileAttendanceService(mockDb, mockLocationsService);

    await expect(
      service.processCheckIn('emp-1', {
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
      }),
    ).rejects.toThrow(UnprocessableEntityException);
  });
});

