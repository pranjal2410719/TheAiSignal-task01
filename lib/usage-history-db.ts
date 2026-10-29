import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { DatabaseSync } from "node:sqlite";

let database: DatabaseSync | undefined;

export type UsageHistoryRecord = {
  id: number;
  session_id: string;
  model: string;
  prompt: string;
  response: string;
  tokens_used: number | null;
  created_at: string;
};

export function getUsageDatabase(): DatabaseSync {
  // Vercel Functions do not provide a durable, shared local filesystem.
  // Fail clearly rather than silently pretending a local SQLite file is production persistence.
  if (process.env.VERCEL === "1") {
    throw new Error("Local SQLite history is available in local development only. Vercel needs persistent storage or a hosted SQLite-compatible database.");
  }

  if (!database) {
    const dbPath = process.env.SQLITE_DB_PATH || join(process.cwd(), "data", "usage-history.sqlite");
    mkdirSync(dirname(dbPath), { recursive: true });
    database = new DatabaseSync(dbPath);
    database.exec(`
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

  return database;
}
