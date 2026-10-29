import { describe, expect, it } from "vitest";
import { DatabaseSync } from "node:sqlite";
import { pruneOldHistory } from "../lib/usage-history-db";

describe("SQLite Usage History & 4-Hour Retention", () => {
  it("creates table and prunes records older than 4 hours", () => {
    // In-memory SQLite for testing
    const db = new DatabaseSync(":memory:");
    db.exec(`
      CREATE TABLE usage_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT NOT NULL,
        model TEXT NOT NULL,
        prompt TEXT NOT NULL,
        response TEXT NOT NULL,
        tokens_used INTEGER,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
    `);

    // Insert 1 fresh record (now)
    db.prepare(`
      INSERT INTO usage_history (session_id, model, prompt, response, tokens_used, created_at)
      VALUES (?, ?, ?, ?, ?, datetime('now'))
    `).run("test-session", "test-model", "recent prompt", "recent answer", 100);

    // Insert 1 old record (5 hours ago)
    db.prepare(`
      INSERT INTO usage_history (session_id, model, prompt, response, tokens_used, created_at)
      VALUES (?, ?, ?, ?, ?, datetime('now', '-5 hours'))
    `).run("test-session", "test-model", "old prompt", "old answer", 50);

    // Verify 2 records exist before prune
    const countBefore = db.prepare("SELECT COUNT(*) as count FROM usage_history").get() as { count: number };
    expect(countBefore.count).toBe(2);

    // Prune records older than 4 hours
    const deleted = pruneOldHistory(db, 4);
    expect(deleted).toBe(1);

    // Verify only the recent record remains
    const remaining = db.prepare("SELECT prompt FROM usage_history").all() as { prompt: string }[];
    expect(remaining).toHaveLength(1);
    expect(remaining[0].prompt).toBe("recent prompt");
  });
});
