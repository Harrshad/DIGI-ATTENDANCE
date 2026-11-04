import { sql } from 'drizzle-orm';
import { db } from '../drizzle.client';
import { locations, managerLocationAssignments } from '../schema/locations';
import { User } from '../schema/users';

export async function seedLocations(managerUser?: User) {
  console.log('Seeding enterprise work locations & PostGIS geofences...');

  const locationData = [
    {
      name: 'CHN-1',
      city: 'Chennai',
      address: 'Olympia Tech Park, Guindy, Chennai, Tamil Nadu 600032',
      radiusMeters: 500,
      latitude: '13.0102000',
      longitude: '80.2157000',
      status: 'Active',
    },
    {
      name: 'CHN-2',
      city: 'Chennai',
      address: 'Ramanujan IT City, Taramani, Chennai, Tamil Nadu 600113',
      radiusMeters: 500,
      latitude: '12.9881000',
      longitude: '80.2458000',
      status: 'Active',
    },
    {
      name: 'CHN-3',
      city: 'Chennai',
      address: 'DLF Cybercity, Shivaji Nagar, Manapakkam, Chennai, Tamil Nadu 600089',
      radiusMeters: 600,
      latitude: '13.0195000',
      longitude: '80.1637000',
      status: 'Active',
    },
    {
      name: 'BLR-1',
      city: 'Bangalore',
      address: 'Prestige Tech Park, Marathahalli Outer Ring Rd, Bangalore, Karnataka 560103',
      radiusMeters: 500,
      latitude: '12.9352000',
      longitude: '77.6946000',
      status: 'Active',
    },
    {
      name: 'BLR-2',
      city: 'Bangalore',
      address: 'Embassy TechVillage, Outer Ring Rd, Devarabisanahalli, Bangalore, Karnataka 560103',
      radiusMeters: 500,
      latitude: '12.9268000',
      longitude: '77.6892000',
      status: 'Active',
    },
    {
      name: 'BLR-3',
      city: 'Bangalore',
      address: 'Bagmane Tech Park, CV Raman Nagar, Bangalore, Karnataka 560093',
      radiusMeters: 400,
      latitude: '12.9815000',
      longitude: '77.6627000',
      status: 'Active',
    },
    {
      name: 'HYD-2',
      city: 'Hyderabad',
      address: 'Hitec City, Madhapur, Hyderabad, Telangana 500081',
      radiusMeters: 600,
      latitude: '17.4483000',
      longitude: '78.3742000',
      status: 'Disabled',
    },
  ];

  const insertedLocations = [];
  for (const loc of locationData) {
    const lng = parseFloat(loc.longitude);
    const lat = parseFloat(loc.latitude);

    const [inserted] = await db
      .insert(locations)
      .values({
        name: loc.name,
        city: loc.city,
        address: loc.address,
        radiusMeters: loc.radiusMeters,
        latitude: loc.latitude,
        longitude: loc.longitude,
        geog: sql`ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography` as any,
        status: loc.status,
      })
      .onConflictDoUpdate({
        target: locations.name,
        set: {
          city: loc.city,
          address: loc.address,
          radiusMeters: loc.radiusMeters,
          latitude: loc.latitude,
          longitude: loc.longitude,
          geog: sql`ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography` as any,
          status: loc.status,
        },
      })
      .returning();

    if (inserted) insertedLocations.push(inserted);
  }

  // Manager-to-location scoping assignments (Joseph J has CHN-1, BLR-1, BLR-3, and HYD-2)
  if (managerUser) {
    const managedCodes = ['CHN-1', 'BLR-1', 'BLR-3', 'HYD-2'];
    const scopedLocs = insertedLocations.filter((l) => managedCodes.includes(l.name));

    for (const loc of scopedLocs) {
      await db
        .insert(managerLocationAssignments)
        .values({
          managerId: managerUser.id,
          locationId: loc.id,
        })
        .onConflictDoNothing();
    }
  }

  console.log(`Seeded ${insertedLocations.length} locations successfully.`);
  return insertedLocations;
}
