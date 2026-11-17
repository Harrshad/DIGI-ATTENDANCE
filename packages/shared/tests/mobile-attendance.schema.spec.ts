import { describe, it, expect } from 'vitest';
import {
  mobileCheckInSchema,
  mobileCheckOutSchema,
  mobileEscalateExceptionSchema,
} from '../src/schemas/mobile-attendance.schema';

describe('Mobile Attendance Schemas', () => {
  const validUUID = 'a3bb189e-8bf9-3888-9912-ace4e6543002';
  const validUUID2 = 'c4dd290f-9ca0-4999-aa23-bdf5f7654113';

  it('validates a correct check-in payload', () => {
    const valid = mobileCheckInSchema.parse({
      siteId: validUUID,
      latitude: 12.9716,
      longitude: 77.5946,
      accuracyMeters: 8,
      isMockLocation: false,
      clientCapturedAt: new Date().toISOString(),
      deviceId: 'android-uuid-device-1',
      idempotencyKey: validUUID2,
      livenessPassed: true,
      blinkDetected: true,
    });

    expect(valid.siteId).toBe(validUUID);
    expect(valid.accuracyMeters).toBe(8);
  });

  it('rejects invalid latitude and longitude', () => {
    expect(() =>
      mobileCheckInSchema.parse({
        siteId: validUUID,
        latitude: 95.0, // Invalid
        longitude: 77.5946,
        accuracyMeters: 8,
        clientCapturedAt: new Date().toISOString(),
        deviceId: 'device-1',
        idempotencyKey: validUUID2,
      })
    ).toThrow();
  });

  it('validates exception escalation note payload', () => {
    const payload = mobileEscalateExceptionSchema.parse({
      siteId: validUUID,
      note: 'Working from client premises at Whitefield today.',
      latitude: 12.9816,
      longitude: 77.6046,
      measuredDistanceMeters: 1400,
    });

    expect(payload.note).toBe('Working from client premises at Whitefield today.');
    expect(payload.measuredDistanceMeters).toBe(1400);
  });
});

