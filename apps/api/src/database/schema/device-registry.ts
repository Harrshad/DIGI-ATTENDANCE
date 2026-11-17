import { pgTable, uuid, varchar, boolean, timestamp } from 'drizzle-orm/pg-core';
import { employees } from './employees';

/**
 * Mobile Device Registry — tracks registered physical devices bound to an employee account.
 */
export const deviceRegistry = pgTable('device_registry', {
  id: uuid('id').primaryKey().defaultRandom(),
  employeeId: uuid('employee_id').notNull().references(() => employees.id, { onDelete: 'cascade' }),
  deviceId: varchar('device_id', { length: 128 }).notNull(), // Unique installation/hardware device UUID
  deviceModel: varchar('device_model', { length: 128 }).notNull().default('Generic Mobile Device'),
  osVersion: varchar('os_version', { length: 64 }).notNull().default('Android'),
  appVersion: varchar('app_version', { length: 32 }).notNull().default('1.0.2'),
  platform: varchar('platform', { length: 16 }).notNull().default('ANDROID'), // ANDROID | IOS
  fcmToken: varchar('fcm_token', { length: 512 }),
  refreshTokenHash: varchar('refresh_token_hash', { length: 255 }),
  isActive: boolean('is_active').notNull().default(true),
  lastActiveAt: timestamp('last_active_at', { withTimezone: true }).notNull().defaultNow(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export type DeviceRegistrationEntity = typeof deviceRegistry.$inferSelect;
export type NewDeviceRegistrationEntity = typeof deviceRegistry.$inferInsert;

