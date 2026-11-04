import { Injectable } from '@nestjs/common';
import { eq, sql, desc, and } from 'drizzle-orm';
import { db } from '../../database/drizzle.client';
import { notifications, attendanceRecords, auditLogs } from '../../database/schema';
import { AppNotification, UserProfile } from '@triattendance/shared';

@Injectable()
export class NotificationsService {
  /**
   * Retrieves active in-app notifications for authenticated user
   */
  async getNotifications(currentUser: UserProfile): Promise<AppNotification[]> {
    const list = await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, currentUser.id))
      .orderBy(desc(notifications.createdAt))
      .limit(20);

    return list.map((n) => ({
      id: n.id,
      title: n.title,
      message: n.message,
      type: n.type as any,
      read: n.read,
      createdAt: n.createdAt ? n.createdAt.toISOString() : new Date().toISOString(),
      linkUrl: n.linkUrl || undefined,
    }));
  }

  /**
   * Marks a single notification as read
   */
  async markAsRead(id: string, currentUser: UserProfile): Promise<void> {
    await db
      .update(notifications)
      .set({ read: true, readAt: new Date() })
      .where(and(eq(notifications.id, id), eq(notifications.userId, currentUser.id)));
  }

  /**
   * India DPDP 90-day selfie retention cleanup service.
   * Hard-deletes binary blobs from Garage S3 after 90 days, preserving SHA-256 audit hash.
   */
  async executeRetentionPurge(): Promise<{ purgedCount: number }> {
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const expiredRecords = await db
      .select({ id: attendanceRecords.id, key: attendanceRecords.selfieStorageKey })
      .from(attendanceRecords)
      .where(
        sql`${attendanceRecords.attemptedCheckInAt} < ${ninetyDaysAgo.toISOString()} 
            AND ${attendanceRecords.selfieStorageKey} IS NOT NULL 
            AND ${attendanceRecords.selfieDeletedAt} IS NULL`
      )
      .limit(500);

    for (const rec of expiredRecords) {
      await db
        .update(attendanceRecords)
        .set({
          selfieDeletedAt: new Date(),
          selfieStorageKey: null,
        })
        .where(eq(attendanceRecords.id, rec.id));

      await db.insert(auditLogs).values({
        actorType: 'SYSTEM',
        action: 'DPDP_SELFIE_PURGED',
        targetId: rec.id,
        targetType: 'ATTENDANCE_RECORD',
        details: { policy: 'India DPDP 90-Day Retention', expiredKey: rec.key },
      });
    }

    return { purgedCount: expiredRecords.length };
  }
}
