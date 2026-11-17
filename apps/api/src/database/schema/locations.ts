import { pgTable, uuid, varchar, text, decimal, integer, timestamp, customType } from 'drizzle-orm/pg-core';

/**
 * PostGIS GEOGRAPHY custom type for storing spatial points.
 * Stored as GEOGRAPHY(Point, 4326) — WGS84 geographic coordinate system.
 * Enables ST_DWithin / ST_Distance in meters on the spheroid.
 */
export const geographyPoint = customType<{
  data: string;
  driverData: string;
}>({
  dataType() {
    return 'GEOGRAPHY(Point, 4326)';
  },
});

/**
 * Work locations — each location has a name, city, coordinates, and a geofence radius.
 * PostGIS spatial column 'geog' stores the center point of the geofence.
 */
export const locations = pgTable('locations', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 64 }).notNull().unique(), // e.g. CHN-1, BLR-3
  city: varchar('city', { length: 128 }).notNull(), // e.g. Chennai, Bangalore
  address: text('address').notNull(),
  radiusMeters: integer('radius_meters').notNull().default(800),
  latitude: decimal('latitude', { precision: 10, scale: 7 }).notNull(),
  longitude: decimal('longitude', { precision: 10, scale: 7 }).notNull(),
  // PostGIS geography column — computed from lat/lng on insert
  geog: geographyPoint('geog').notNull(),
  status: varchar('status', { length: 16 }).notNull().default('Active'), // Active | Disabled
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

/**
 * Manager-to-location assignments — enforces server-side data scoping.
 * A manager can only see data for their assigned locations.
 */
export const managerLocationAssignments = pgTable('manager_location_assignments', {
  id: uuid('id').primaryKey().defaultRandom(),
  managerId: uuid('manager_id').notNull(),
  locationId: uuid('location_id').notNull().references(() => locations.id, { onDelete: 'cascade' }),
  assignedAt: timestamp('assigned_at', { withTimezone: true }).notNull().defaultNow(),
});

export type Location = typeof locations.$inferSelect;
export type NewLocation = typeof locations.$inferInsert;
export type ManagerLocationAssignment = typeof managerLocationAssignments.$inferSelect;
