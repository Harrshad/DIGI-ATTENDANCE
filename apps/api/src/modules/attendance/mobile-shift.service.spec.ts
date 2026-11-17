import { describe, it, expect, vi } from 'vitest';
import { MobileShiftService } from './mobile-shift.service';

describe('MobileShiftService', () => {
  it('returns default fallback site if employee has no assigned location', async () => {
    const mockDb: any = {
      select: vi.fn().mockReturnThis(),
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([
        {
          id: 'emp-1',
          name: 'Alex Patel',
          assignedLocationId: null,
        },
      ]),
    };

    const service = new MobileShiftService(mockDb);
    const site = await service.getAssignedSite('emp-1');

    expect(site.siteCode).toBe('BLR-1');
    expect(site.radiusMeters).toBe(800);
    expect(site.timezone).toBe('Asia/Kolkata');
  });

  it('derives Check-in Pending state when no attendance record exists today', async () => {
    const mockDb: any = {
      select: vi.fn().mockReturnThis(),
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockReturnThis(),
      limit: vi.fn().mockImplementation(() => {
        // First call is getAssignedSite -> employee lookup
        return Promise.resolve([
          {
            id: 'emp-1',
            name: 'Alex Patel',
            assignedLocationId: null,
          },
        ]);
      }),
    };

    // Override second call for attendanceRecords to return empty
    let callCount = 0;
    mockDb.limit = vi.fn().mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        return Promise.resolve([{ id: 'emp-1', name: 'Alex Patel', assignedLocationId: null }]);
      }
      return Promise.resolve([]);
    });

    const service = new MobileShiftService(mockDb);
    const shift = await service.getTodayShift('emp-1');

    expect(shift.status).toBe('Check-in Pending');
    expect(shift.checkInTime).toBeNull();
    expect(shift.totalWorkFormatted).toBe('0h 0m');
  });
});

