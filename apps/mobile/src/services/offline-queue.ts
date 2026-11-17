import * as SQLite from 'expo-sqlite';

export interface OfflineAttendanceSubmission {
  id: string; // client UUID
  type: 'CHECK_IN' | 'CHECK_OUT';
  payloadJson: string;
  capturedAt: string;
  synced: number; // 0 = false, 1 = true
}

export class OfflineQueueService {
  private static db: SQLite.SQLiteDatabase | null = null;

  static async getDatabase(): Promise<SQLite.SQLiteDatabase> {
    if (!this.db) {
      this.db = await SQLite.openDatabaseAsync('triattendance_offline.db');
      await this.db.execAsync(`
        CREATE TABLE IF NOT EXISTS offline_submissions (
          id TEXT PRIMARY KEY,
          type TEXT NOT NULL,
          payload_json TEXT NOT NULL,
          captured_at TEXT NOT NULL,
          synced INTEGER NOT NULL DEFAULT 0
        );
      `);
    }
    return this.db;
  }

  static async enqueueSubmission(
    id: string,
    type: 'CHECK_IN' | 'CHECK_OUT',
    payload: any,
  ): Promise<void> {
    const db = await this.getDatabase();
    await db.runAsync(
      `INSERT INTO offline_submissions (id, type, payload_json, captured_at, synced) VALUES (?, ?, ?, ?, 0);`,
      id,
      type,
      JSON.stringify(payload),
      new Date().toISOString(),
    );
  }

  static async getPendingSubmissions(): Promise<OfflineAttendanceSubmission[]> {
    const db = await this.getDatabase();
    const rows = await db.getAllAsync<any>(
      `SELECT id, type, payload_json as payloadJson, captured_at as capturedAt, synced FROM offline_submissions WHERE synced = 0 ORDER BY captured_at ASC;`,
    );
    return rows;
  }

  static async markSubmissionSynced(id: string): Promise<void> {
    const db = await this.getDatabase();
    await db.runAsync(`UPDATE offline_submissions SET synced = 1 WHERE id = ?;`, id);
  }
}

