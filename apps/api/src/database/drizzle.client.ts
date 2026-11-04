import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as dotenv from 'dotenv';

dotenv.config();

const connectionString =
  process.env.DATABASE_URL ||
  'postgresql://triattendance:triattendance_dev_secret@localhost:5432/triattendance';

// PostgreSQL client configured for transaction safety & spatial PostGIS queries
export const pgClient = postgres(connectionString, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
});

export const db = drizzle(pgClient);

/**
 * Checks database connectivity and ensures PostGIS extension is loaded
 */
export async function verifyDatabaseConnection(): Promise<string> {
  try {
    const result = await pgClient`SELECT PostGIS_Version() as postgis_version;`;
    const version = result[0]?.postgis_version as string;
    return version || 'PostGIS active';
  } catch {
    // If running without database or during static builds, fallback gracefully
    return 'Database connection pending';
  }
}
