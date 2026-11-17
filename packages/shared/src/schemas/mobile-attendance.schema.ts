import { z } from 'zod';

/**
 * Mobile Attendance Check-In Request Schema
 */
export const mobileCheckInSchema = z.object({
  siteId: z.string().uuid('Valid site UUID is required'),
  latitude: z.number().min(-90).max(90, 'Latitude must be between -90 and 90'),
  longitude: z.number().min(-180).max(180, 'Longitude must be between -180 and 180'),
  accuracyMeters: z.number().min(0, 'Accuracy must be positive'),
  isMockLocation: z.boolean().default(false),
  clientCapturedAt: z.string().datetime('Client captured time must be ISO8601'),
  deviceId: z.string().min(1, 'Device ID is required'),
  idempotencyKey: z.string().uuid('Idempotency key must be a valid UUIDv4'),
  livenessPassed: z.boolean().default(true),
  blinkDetected: z.boolean().default(true),
});

export type MobileCheckInInput = z.infer<typeof mobileCheckInSchema>;

/**
 * Mobile Attendance Check-Out Request Schema
 */
export const mobileCheckOutSchema = z.object({
  siteId: z.string().uuid('Valid site UUID is required'),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  accuracyMeters: z.number().min(0),
  isMockLocation: z.boolean().default(false),
  clientCapturedAt: z.string().datetime(),
  deviceId: z.string().min(1),
  idempotencyKey: z.string().uuid(),
  livenessPassed: z.boolean().default(true),
  blinkDetected: z.boolean().default(true),
});

export type MobileCheckOutInput = z.infer<typeof mobileCheckOutSchema>;

/**
 * Mobile Exception Escalation Note Request Schema (E20 -> E22)
 */
export const mobileEscalateExceptionSchema = z.object({
  attendanceId: z.string().uuid('Valid attendance UUID is required').optional(),
  siteId: z.string().uuid('Valid site UUID is required'),
  note: z.string().min(1, 'Reason or message to supervisor is required').max(500),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  measuredDistanceMeters: z.number().min(0),
});

export type MobileEscalateExceptionInput = z.infer<typeof mobileEscalateExceptionSchema>;

/**
 * Mobile Missing Check-Out Note Request Schema (E27, E40)
 */
export const mobileMissingCheckoutNoteSchema = z.object({
  attendanceId: z.string().uuid('Valid attendance record UUID is required'),
  note: z.string().min(1, 'Explanation note is required').max(500),
});

export type MobileMissingCheckoutNoteInput = z.infer<typeof mobileMissingCheckoutNoteSchema>;

