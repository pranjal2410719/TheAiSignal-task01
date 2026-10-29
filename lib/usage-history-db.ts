/**
 * SQLite session history storage with automated 4-hour retention cleanup.
 * @author Pranjal Yadav <https://github.com/pranjal2410719>
 */

import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { DatabaseSync } from "node:sqlite";

let database: DatabaseSync | undefined;
let lastPrunedAt = 0;

export type UsageHistoryRecord = {
  id: number;
  session_id: string;
  model: string;
  prompt: string;
  response: string;
  tokens_used: number | null;
  created_at: string;
};

// Maximum age for history records: 4 hours (in milliseconds)
const RETENTION_HOURS = 4;
const PRUNE_INTERVAL_MS = 15 * 60 * 1000; // Check prune every 15 minutes max to avoid excessive disk I/O

/**
 * Automatically purges usage records older than 4 hours.
 * Runs on database access to keep SQLite storage clean and lightweight.
 */
export function pruneOldHistory(db: DatabaseSync, hours = RETENTION_HOURS): number {
  try {
    const result = db.prepare(
      `DELETE FROM usage_history WHERE created_at < datetime('now', '-' || ? || ' hours')`
    ).run(hours);
    return Number(result.changes);
  } catch (err) {
    console.error("Failed to prune old usage history records:", err);
    return 0;
  }
}

/**
 * Resets / empties the usage history table on demand.
 */
export function resetUsageHistory(db: DatabaseSync): void {
  try {
    db.exec(`DELETE FROM usage_history; VACUUM;`);
  } catch (err) {
    console.error("Failed to reset usage history table:", err);
  }
}

export function getUsageDatabase(): DatabaseSync {
  if (!database) {
    // In Vercel serverless functions, the root filesystem is read-only.
    // Use /tmp which is the designated writable temporary directory.
    const dbPath =
      process.env.SQLITE_DB_PATH ||
      (process.env.VERCEL === "1"
        ? join("/tmp", "usage-history.sqlite")
        : join(process.cwd(), "data", "usage-history.sqlite"));

    mkdirSync(dirname(dbPath), { recursive: true });
    database = new DatabaseSync(dbPath);

    database.exec(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS usage_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT NOT NULL,
        model TEXT NOT NULL,
        prompt TEXT NOT NULL,
        response TEXT NOT NULL,
        tokens_used INTEGER,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
      CREATE INDEX IF NOT EXISTS usage_history_session_created_idx
        ON usage_history (session_id, created_at DESC);
    `);
  }

  // Auto-prune records older than 4 hours periodically
  const now = Date.now();
  if (now - lastPrunedAt > PRUNE_INTERVAL_MS) {
    pruneOldHistory(database, RETENTION_HOURS);
    lastPrunedAt = now;
  }

  return database;
}
