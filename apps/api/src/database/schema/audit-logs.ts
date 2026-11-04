import { pgTable, uuid, varchar, jsonb, timestamp } from 'drizzle-orm/pg-core';

/**
 * Append-only audit log — records every significant action.
 * Never updated or deleted. Immutable by design.
 *
 * Captures:
 * - CHECK_IN_RECORDED, CHECK_OUT_RECORDED
 * - EXCEPTION_ESCALATED, EXCEPTION_APPROVED, EXCEPTION_REJECTED
 * - REPORT_REQUESTED, REPORT_GENERATED
 * - EVIDENCE_VIEWED (selfie presigned URL access)
 * - LOGIN_SUCCESS, LOGIN_FAILURE, ACCOUNT_LOCKED
 */
export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  actorId: uuid('actor_id'), // nullable: system-generated events have no actor
  actorType: varchar('actor_type', { length: 32 }).notNull(), // USER | EMPLOYEE_DEVICE | SYSTEM
  actorName: varchar('actor_name', { length: 255 }),
  action: varchar('action', { length: 64 }).notNull(), // e.g. EXCEPTION_ESCALATED
  targetId: uuid('target_id'), // ID of the entity acted upon
  targetType: varchar('target_type', { length: 64 }), // e.g. ATTENDANCE_RECORD, EXCEPTION
  details: jsonb('details').$type<Record<string, unknown>>(),
  ipAddress: varchar('ip_address', { length: 64 }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export type AuditLog = typeof auditLogs.$inferSelect;
export type NewAuditLog = typeof auditLogs.$inferInsert;
