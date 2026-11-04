import { describe, it, expect } from 'vitest';
import {
  loginSchema,
  checkInRequestSchema,
  createLocationSchema,
  escalateExceptionSchema,
  resolveExceptionSchema,
  downloadRecordSchema,
} from '../src';

describe('Shared Zod Schemas Validation', () => {
  describe('loginSchema', () => {
    it('should validate valid work credentials', () => {
      const valid = { email: 'joe.rosario@company.com', password: 'securePassword123' };
      const parsed = loginSchema.safeParse(valid);
      expect(parsed.success).toBe(true);
    });

    it('should reject invalid email and short password', () => {
      const invalid = { email: 'not-an-email', password: 'short' };
      const parsed = loginSchema.safeParse(invalid);
      expect(parsed.success).toBe(false);
      if (!parsed.success) {
        expect(parsed.error.issues.length).toBeGreaterThanOrEqual(2);
      }
    });
  });

  describe('checkInRequestSchema', () => {
    it('should validate compliant check-in payload', () => {
      const valid = {
        employeeId: 'TRIL-4821',
        assignedLocationId: 'loc-chn-1',
        latitude: 12.9716,
        longitude: 77.5946,
        gpsAccuracyMeters: 8,
        isMockLocation: false,
        selfieStorageKey: 'selfies/2026/08/21/tril-4821.jpg',
        livenessPassed: true,
        blinkAttemptCount: 1,
      };
      const parsed = checkInRequestSchema.safeParse(valid);
      expect(parsed.success).toBe(true);
    });

    it('should reject out-of-bounds coordinates and negative accuracy', () => {
      const invalid = {
        employeeId: 'TRIL-4821',
        assignedLocationId: 'loc-chn-1',
        latitude: 95.0, // invalid > 90
        longitude: 77.5946,
        gpsAccuracyMeters: -5, // invalid negative
        selfieStorageKey: '',
        livenessPassed: true,
      };
      const parsed = checkInRequestSchema.safeParse(invalid);
      expect(parsed.success).toBe(false);
    });
  });

  describe('createLocationSchema', () => {
    it('should validate valid work location details', () => {
      const valid = {
        name: 'BLR-4',
        city: 'Bangalore',
        address: 'Outer Ring Road, Bellandur, Bangalore',
        radiusMeters: 500,
        latitude: 12.9352,
        longitude: 77.6946,
        assignedEmployeeIds: ['EMP-401', 'EMP-108'],
      };
      const parsed = createLocationSchema.safeParse(valid);
      expect(parsed.success).toBe(true);
    });

    it('should reject non-positive radius', () => {
      const invalid = {
        name: 'BLR-4',
        city: 'Bangalore',
        address: 'Outer Ring Road',
        radiusMeters: -100,
        latitude: 12.9352,
        longitude: 77.6946,
      };
      const parsed = createLocationSchema.safeParse(invalid);
      expect(parsed.success).toBe(false);
    });
  });

  describe('escalateExceptionSchema & resolveExceptionSchema', () => {
    it('should require a note when escalating to supervisor', () => {
      expect(escalateExceptionSchema.safeParse({ note: '' }).success).toBe(false);
      expect(escalateExceptionSchema.safeParse({ note: 'Client visit at Guindy' }).success).toBe(true);
    });

    it('should allow APPROVE without a note', () => {
      const parsed = resolveExceptionSchema.safeParse({ decision: 'APPROVE' });
      expect(parsed.success).toBe(true);
    });

    it('should strictly require a note when decision is REJECT', () => {
      const withoutNote = resolveExceptionSchema.safeParse({ decision: 'REJECT' });
      expect(withoutNote.success).toBe(false);

      const withNote = resolveExceptionSchema.safeParse({
        decision: 'REJECT',
        note: 'Employee confirmed outside working zone without authorization',
      });
      expect(withNote.success).toBe(true);
    });
  });

  describe('downloadRecordSchema', () => {
    it('should parse valid record export parameters', () => {
      const valid = {
        dateRangeStart: '2026-08-01',
        dateRangeEnd: '2026-08-26',
        locationId: 'all',
        employeeScope: 'all',
        status: 'all',
        format: 'CSV',
      };
      const parsed = downloadRecordSchema.safeParse(valid);
      expect(parsed.success).toBe(true);
    });
  });
});
