import { pgTable, uuid, varchar, boolean, timestamp } from 'drizzle-orm/pg-core';
import { locations } from './locations';

/**
 * Employees — field workers who check in via the mobile app.
 * Not the same as users (Account Managers). Employees don't log into the web portal.
 */
export const employees = pgTable('employees', {
  id: uuid('id').primaryKey().defaultRandom(),
  employeeCode: varchar('employee_code', { length: 32 }).notNull().unique(), // e.g. TRIL-4821
  name: varchar('name', { length: 255 }).notNull(),
  department: varchar('department', { length: 128 }),
  role: varchar('role', { length: 128 }), // job title, e.g. Frontend Dev
  email: varchar('email', { length: 255 }),
  phone: varchar('phone', { length: 32 }),
  assignedLocationId: uuid('assigned_location_id').references(() => locations.id, { onDelete: 'set null' }),
  // Direct reporting manager (supervisor) — stored as free text for display
  reportingManagerName: varchar('reporting_manager_name', { length: 255 }),
  reportingManagerId: uuid('reporting_manager_id'), // FK to users (supervisor)
  passwordHash: varchar('password_hash', { length: 255 }),
  activationVoucherHash: varchar('activation_voucher_hash', { length: 255 }),
  isActivated: boolean('is_activated').notNull().default(false),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export type Employee = typeof employees.$inferSelect;
export type NewEmployee = typeof employees.$inferInsert;
