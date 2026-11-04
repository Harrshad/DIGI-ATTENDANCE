import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import * as argon2 from 'argon2';
import crypto from 'crypto';
import { eq, and, gt } from 'drizzle-orm';
import { db } from '../../database/drizzle.client';
import { users, sessions, auditLogs, managerLocationAssignments } from '../../database/schema';
import { UserProfile } from '@triattendance/shared';

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MINUTES = 15;
const SESSION_DURATION_HOURS = 24;

@Injectable()
export class AuthService {
  /**
   * Hashes a password using Argon2id
   */
  async hashPassword(password: string): Promise<string> {
    return argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 65536,
      timeCost: 3,
      parallelism: 4,
    });
  }

  /**
   * Verifies a password against an Argon2id hash
   */
  async verifyPassword(hash: string, plain: string): Promise<boolean> {
    try {
      return await argon2.verify(hash, plain);
    } catch {
      return false;
    }
  }

  /**
   * Authenticates user, enforcing 5-attempt brute force lockout and session generation
   */
  async login(
    email: string,
    plainPassword: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<{ sessionToken: string; user: UserProfile; expiresAt: Date }> {
    const normalizedEmail = email.trim().toLowerCase();
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, normalizedEmail))
      .limit(1);

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid work email or password.');
    }

    const now = new Date();

    // Check if account is locked
    if (user.lockedUntil && user.lockedUntil > now) {
      const remainingMinutes = Math.ceil(
        (user.lockedUntil.getTime() - now.getTime()) / (60 * 1000),
      );
      throw new ForbiddenException(
        `Account is locked due to multiple failed login attempts. Try again in ${remainingMinutes} minute(s).`,
      );
    }

    // Verify password
    const isPasswordValid = await this.verifyPassword(user.passwordHash, plainPassword);

    if (!isPasswordValid) {
      const updatedAttempts = (user.failedLoginAttempts || 0) + 1;
      let lockoutDate: Date | null = null;

      if (updatedAttempts >= MAX_FAILED_ATTEMPTS) {
        lockoutDate = new Date(now.getTime() + LOCKOUT_DURATION_MINUTES * 60 * 1000);
      }

      await db
        .update(users)
        .set({
          failedLoginAttempts: updatedAttempts,
          lockedUntil: lockoutDate,
          updatedAt: now,
        })
        .where(eq(users.id, user.id));

      await db.insert(auditLogs).values({
        actorId: user.id,
        actorType: 'USER',
        actorName: user.name,
        action: lockoutDate ? 'ACCOUNT_LOCKED' : 'LOGIN_FAILED',
        targetId: user.id,
        targetType: 'USER',
        details: { attempts: updatedAttempts, locked: !!lockoutDate },
        ipAddress,
        createdAt: now,
      });

      if (lockoutDate) {
        throw new ForbiddenException(
          `Account locked for ${LOCKOUT_DURATION_MINUTES} minutes due to 5 failed login attempts.`,
        );
      }

      throw new UnauthorizedException('Invalid work email or password.');
    }

    // Reset failed attempts upon successful authentication
    await db
      .update(users)
      .set({
        failedLoginAttempts: 0,
        lockedUntil: null,
        lastLoginAt: now,
        updatedAt: now,
      })
      .where(eq(users.id, user.id));

    // Generate secure cryptographic session token
    const sessionToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(now.getTime() + SESSION_DURATION_HOURS * 60 * 60 * 1000);

    await db.insert(sessions).values({
      userId: user.id,
      sessionToken,
      expiresAt,
      ipAddress,
      userAgent,
      createdAt: now,
    });

    await db.insert(auditLogs).values({
      actorId: user.id,
      actorType: 'USER',
      actorName: user.name,
      action: 'LOGIN_SUCCESS',
      targetId: user.id,
      targetType: 'USER',
      ipAddress,
      createdAt: now,
    });

    const userProfile = await this.getUserProfile(user.id);

    return { sessionToken, user: userProfile, expiresAt };
  }

  /**
   * Validates active session from cookie token
   */
  async validateSession(sessionToken: string): Promise<UserProfile> {
    if (!sessionToken) {
      throw new UnauthorizedException('Authentication required.');
    }

    const now = new Date();
    const [sessionRecord] = await db
      .select({
        sessionId: sessions.id,
        userId: sessions.userId,
        expiresAt: sessions.expiresAt,
      })
      .from(sessions)
      .where(and(eq(sessions.sessionToken, sessionToken), gt(sessions.expiresAt, now)))
      .limit(1);

    if (!sessionRecord) {
      throw new UnauthorizedException('Invalid or expired session.');
    }

    return this.getUserProfile(sessionRecord.userId);
  }

  /**
   * Destroys active session on logout
   */
  async logout(sessionToken: string): Promise<void> {
    if (!sessionToken) return;
    await db.delete(sessions).where(eq(sessions.sessionToken, sessionToken));
  }

  /**
   * Retrieves user profile with assigned site IDs for scoping
   */
  async getUserProfile(userId: string): Promise<UserProfile> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      throw new NotFoundException('User profile not found.');
    }

    const assignments = await db
      .select({ locationId: managerLocationAssignments.locationId })
      .from(managerLocationAssignments)
      .where(eq(managerLocationAssignments.managerId, userId));

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role as UserProfile['role'],
      assignedLocationIds: assignments.map((a) => a.locationId),
      hasDelegatedResolutionPermission: user.hasDelegatedResolutionPermission,
    };
  }
}
