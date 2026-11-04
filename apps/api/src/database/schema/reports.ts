import { pgTable, uuid, varchar, integer, text, timestamp, jsonb } from 'drizzle-orm/pg-core';

/**
 * Background report generation jobs.
 * Created when a manager triggers "Download record" on the Records page.
 * Processed by BullMQ worker backed by Valkey.
 */
export const reportJobs = pgTable('report_jobs', {
  id: uuid('id').primaryKey().defaultRandom(),
  requestedById: uuid('requested_by_id').notNull(), // FK to users
  requestedByName: varchar('requested_by_name', { length: 255 }),

  // Filters applied to this report
  dateRangeStart: varchar('date_range_start', { length: 16 }).notNull(), // e.g. 2026-08-01
  dateRangeEnd: varchar('date_range_end', { length: 16 }).notNull(), // e.g. 2026-08-26
  locationId: varchar('location_id', { length: 64 }).default('all'),
  employeeScope: varchar('employee_scope', { length: 64 }).default('all'),
  status: varchar('status_filter', { length: 32 }).default('all'),

  // Job lifecycle
  jobStatus: varchar('job_status', { length: 16 }).notNull().default('PENDING'), // PENDING | PROCESSING | DONE | FAILED
  fileFormat: varchar('file_format', { length: 8 }).notNull().default('CSV'), // CSV | PDF

  // Output artifact
  estimatedRows: integer('estimated_rows'),
  actualRows: integer('actual_rows'),
  storageKey: text('storage_key'), // Garage S3 object key after completion
  displayTitle: varchar('display_title', { length: 255 }), // e.g. "August 2026 · BLR-3"
  errorMessage: text('error_message'),
  metadata: jsonb('metadata').$type<Record<string, unknown>>(),

  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  completedAt: timestamp('completed_at', { withTimezone: true }),
});

export type ReportJob = typeof reportJobs.$inferSelect;
export type NewReportJob = typeof reportJobs.$inferInsert;
