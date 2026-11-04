import { pgTable, uuid, varchar, text, boolean, timestamp } from 'drizzle-orm/pg-core';

/**
 * In-app notifications stored in PostgreSQL.
 * Served by the API to power the notification bell in the top header.
 */
export const notifications = pgTable('notifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(), // Recipient (Account Manager or Supervisor)
  type: varchar('type', { length: 32 }).notNull(), // EXCEPTION_RAISED | REPORT_READY | ESCALATION_RESOLVED
  title: varchar('title', { length: 255 }).notNull(),
  message: text('message').notNull(),
  linkUrl: text('link_url'), // e.g. /alerts/[exception-id]
  read: boolean('read').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  readAt: timestamp('read_at', { withTimezone: true }),
});

export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;
