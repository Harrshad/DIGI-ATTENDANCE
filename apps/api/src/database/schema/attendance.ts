import {
  pgTable,
  uuid,
  varchar,
  boolean,
  integer,
  decimal,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';
import { employees } from './employees';
import { locations } from './locations';

/**
 * Attendance records — written by the mobile check-in API.
 * READ-ONLY for Account Managers (enforced at API layer — no PATCH/PUT/DELETE endpoints).
 * Holds GPS spatial data as raw decimal lat/lng (PostGIS queries run against locations.geog).
 */
export const attendanceRecords = pgTable('attendance_records', {
  id: uuid('id').primaryKey().defaultRandom(),
  employeeId: uuid('employee_id').notNull().references(() => employees.id),
  locationId: uuid('location_id').references(() => locations.id, { onDelete: 'set null' }),

  // Check-in timing — both timestamps stored in UTC
  attemptedCheckInAt: timestamp('attempted_check_in_at', { withTimezone: true }).notNull(), // GPS first pinged
  selfieCapuredAt: timestamp('selfie_captured_at', { withTimezone: true }), // Camera + blink completed
  checkOutAt: timestamp('check_out_at', { withTimezone: true }),

  // GPS & mock detection
  latitude: decimal('latitude', { precision: 10, scale: 7 }).notNull(),
  longitude: decimal('longitude', { precision: 10, scale: 7 }).notNull(),
  gpsAccuracyMeters: decimal('gps_accuracy_meters', { precision: 6, scale: 2 }).notNull(),
  isMockLocation: boolean('is_mock_location').notNull().default(false),

  // Distance from boundary — computed server-side by PostGIS
  distanceFromBoundaryMeters: decimal('distance_from_boundary_meters', { precision: 8, scale: 2 }).default('0'),

  // Selfie evidence — key in object storage (Garage S3)
  selfieStorageKey: text('selfie_storage_key'),
  selfieDeletedAt: timestamp('selfie_deleted_at', { withTimezone: true }), // DPDP 90-day retention

  // Liveness verification results from mobile
  livenessPassed: boolean('liveness_passed').notNull().default(false),
  blinkAttemptCount: integer('blink_attempt_count').notNull().default(1),

  // Computed attendance status
  status: varchar('status', { length: 16 }).notNull(), // Present | Late | Absent | Rejected | Flagged

  // Site name at time of check-in (denormalized for display)
  siteNameSnapshot: varchar('site_name_snapshot', { length: 64 }),

  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export type AttendanceRecord = typeof attendanceRecords.$inferSelect;
export type NewAttendanceRecord = typeof attendanceRecords.$inferInsert;
