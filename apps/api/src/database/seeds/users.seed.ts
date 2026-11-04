import * as argon2 from 'argon2';
import { db } from '../drizzle.client';
import { users } from '../schema/users';

export async function seedUsers() {
  console.log('Seeding portal users (Account Managers, Supervisors, Admins)...');

  const defaultPasswordHash = await argon2.hash('Password123!', {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 4,
  });

  const userData = [
    {
      email: 'joe.rosario@company.com',
      name: 'Joseph J',
      passwordHash: defaultPasswordHash,
      role: 'ACCOUNT_MANAGER',
      isActive: true,
      hasDelegatedResolutionPermission: true, // Special permission to approve/reject exceptions
    },
    {
      email: 'anita.menon@company.com',
      name: 'Anita Menon',
      passwordHash: defaultPasswordHash,
      role: 'SUPERVISOR',
      isActive: true,
      hasDelegatedResolutionPermission: true,
    },
    {
      email: 'sarah.mitchell@company.com',
      name: 'Sarah Mitchell',
      passwordHash: defaultPasswordHash,
      role: 'SUPERVISOR',
      isActive: true,
      hasDelegatedResolutionPermission: true,
    },
    {
      email: 'admin@company.com',
      name: 'HR Administration',
      passwordHash: defaultPasswordHash,
      role: 'ADMIN',
      isActive: true,
      hasDelegatedResolutionPermission: true,
    },
  ];

  const insertedUsers = [];
  for (const u of userData) {
    const [inserted] = await db
      .insert(users)
      .values(u)
      .onConflictDoUpdate({
        target: users.email,
        set: {
          name: u.name,
          role: u.role,
          hasDelegatedResolutionPermission: u.hasDelegatedResolutionPermission,
        },
      })
      .returning();
    if (inserted) insertedUsers.push(inserted);
  }

  console.log(`Seeded ${insertedUsers.length} users successfully.`);
  return insertedUsers;
}
