import { z } from 'zod';

export const checkInRequestSchema = z.object({
  employeeId: z.string().min(1, 'Employee ID is required'),
  assignedLocationId: z.string().min(1, 'Assigned Location ID is required'),
  latitude: z.number().min(-90).max(90, 'Valid latitude coordinate is required'),
  longitude: z.number().min(-180).max(180, 'Valid longitude coordinate is required'),
  gpsAccuracyMeters: z.number().nonnegative('GPS accuracy must be a non-negative number'),
  isMockLocation: z.boolean().default(false),
  selfieStorageKey: z.string().min(1, 'Selfie image key is required'),
  livenessPassed: z.boolean(),
  blinkAttemptCount: z.number().int().min(1).default(1),
  timestampUtc: z.string().datetime().optional(),
});

export type CheckInRequest = z.infer<typeof checkInRequestSchema>;

export const checkOutRequestSchema = z.object({
  employeeId: z.string().min(1, 'Employee ID is required'),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  timestampUtc: z.string().datetime().optional(),
});

export type CheckOutRequest = z.infer<typeof checkOutRequestSchema>;
