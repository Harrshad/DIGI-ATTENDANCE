import { pgTable, uuid, varchar, text, timestamp } from 'drizzle-orm/pg-core';
import { attendanceRecords } from './attendance';
import { employees } from './employees';

/**
 * Exceptions — created automatically when a check-in has:
 * - GPS outside geofence (GEOFENCE)
 * - Failed liveness / blink verification (LIVENESS)
 * - No check-out recorded by end of shift (MISSING_CHECKOUT)
 */
export const exceptions = pgTable('exceptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  attendanceRecordId: uuid('attendance_record_id').notNull().references(() => attendanceRecords.id),
  employeeId: uuid('employee_id').notNull().references(() => employees.id),
  type: varchar('type', { length: 32 }).notNull(), // GEOFENCE | LIVENESS | MISSING_CHECKOUT
  status: varchar('status', { length: 16 }).notNull().default('Pending'), // Pending | Escalated | Resolved | Rejected
  employeeNote: text('employee_note'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  resolvedAt: timestamp('resolved_at', { withTimezone: true }),
});

/**
 * Exception reviews — records the decision made on an exception.
 * Append-only: each review creates a new row, no updates.
 */
export const exceptionReviews = pgTable('exception_reviews', {
  id: uuid('id').primaryKey().defaultRandom(),
  exceptionId: uuid('exception_id').notNull().references(() => exceptions.id),
  reviewerId: uuid('reviewer_id').notNull(), // FK to users (manager / supervisor)
  reviewerName: varchar('reviewer_name', { length: 255 }),
  decision: varchar('decision', { length: 16 }).notNull(), // ESCALATE | APPROVE | REJECT
  note: text('note'), // Required for REJECT; informational for others
  supervisorId: uuid('supervisor_id'), // Target supervisor for ESCALATE decision
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export type Exception = typeof exceptions.$inferSelect;
export type NewException = typeof exceptions.$inferInsert;
export type ExceptionReview = typeof exceptionReviews.$inferSelect;
export type NewExceptionReview = typeof exceptionReviews.$inferInsert;
