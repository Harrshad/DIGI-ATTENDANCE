import { seedUsers } from './seeds/users.seed';
import { seedLocations } from './seeds/locations.seed';
import { seedAttendance } from './seeds/attendance.seed';
import { pgClient, verifyDatabaseConnection } from './drizzle.client';

async function runSeed() {
  console.log('--- Starting TriAttendance Reference Seed ---');

  const connectionStatus = await verifyDatabaseConnection();
  console.log(`Database status: ${connectionStatus}`);

  try {
    const usersList = await seedUsers();
    const manager = usersList.find((u) => u.email === 'joe.rosario@company.com');

    const locationsList = await seedLocations(manager);
    await seedAttendance(locationsList, usersList);

    console.log('--- TriAttendance Reference Data Seeding Complete ---');
  } catch (err) {
    console.error('Seeding encountered an error:', err);
    process.exitCode = 1;
  } finally {
    await pgClient.end();
  }
}

runSeed();
