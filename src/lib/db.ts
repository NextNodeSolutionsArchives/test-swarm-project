import Database from "better-sqlite3";
import { mkdirSync, existsSync } from "node:fs";
import { dirname } from "node:path";
import { v4 as uuidv4 } from "uuid";

const DB_PATH = "data/pulseo.db";

let dbInstance: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!dbInstance) {
    const dir = dirname(DB_PATH);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    dbInstance = new Database(DB_PATH);
    dbInstance.pragma("journal_mode = WAL");
    dbInstance.pragma("foreign_keys = ON");
    initializeSchema(dbInstance);
  }
  return dbInstance;
}

function initializeSchema(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS columns (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      status_value TEXT NOT NULL,
      position INTEGER NOT NULL,
      color TEXT,
      created_at INTEGER NOT NULL,
      UNIQUE(user_id, status_value)
    );

    CREATE INDEX IF NOT EXISTS idx_columns_user_id ON columns(user_id);
    CREATE INDEX IF NOT EXISTS idx_columns_position ON columns(user_id, position);

    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT NOT NULL,
      position INTEGER NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      deleted_at INTEGER
    );

    CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
    CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(user_id, status);
    CREATE INDEX IF NOT EXISTS idx_tasks_position ON tasks(user_id, position);
    CREATE INDEX IF NOT EXISTS idx_tasks_deleted_at ON tasks(deleted_at);
  `);
}

export function seedColumnsForUser(userId: string): void {
  const db = getDb();
  const existing = db
    .prepare("SELECT COUNT(*) as count FROM columns WHERE user_id = ?")
    .get(userId) as { count: number };

  if (existing.count > 0) return;

  const now = Math.floor(Date.now() / 1000);
  const insert = db.prepare(
    "INSERT INTO columns (id, user_id, name, status_value, position, color, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)"
  );

  const seedData = [
    { name: "Todo", statusValue: "todo", position: 0, color: "#3B82F6" },
    {
      name: "In Progress",
      statusValue: "in-progress",
      position: 1,
      color: "#F59E0B",
    },
    { name: "Done", statusValue: "done", position: 2, color: "#00D67E" },
  ];

  const transaction = db.transaction(() => {
    for (const col of seedData) {
      insert.run(
        uuidv4(),
        userId,
        col.name,
        col.statusValue,
        col.position,
        col.color,
        now
      );
    }
  });

  transaction();
}

export function cleanupExpiredSoftDeletes(): void {
  const db = getDb();
  const cutoff = Math.floor(Date.now() / 1000) - 60;
  db.prepare("DELETE FROM tasks WHERE deleted_at IS NOT NULL AND deleted_at < ?").run(cutoff);
}

/** Reset DB instance (for testing) */
export function resetDbInstance(): void {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}
