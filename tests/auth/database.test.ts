import { describe, it, expect, beforeEach, afterEach } from "vitest";
import Database from "better-sqlite3";
import { mkdirSync, existsSync, rmSync } from "node:fs";

const TEST_DB_PATH = "/tmp/claude/test-pulseo.db";

describe("Database schema", () => {
  let db: Database.Database;

  beforeEach(() => {
    // Clean up any previous test DB
    if (existsSync(TEST_DB_PATH)) {
      rmSync(TEST_DB_PATH);
    }
    mkdirSync("/tmp/claude", { recursive: true });

    db = new Database(TEST_DB_PATH);
    db.pragma("journal_mode = WAL");
    db.pragma("foreign_keys = ON");

    // Run the same migrations as the app
    db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT NOT NULL UNIQUE COLLATE NOCASE,
        email TEXT NOT NULL UNIQUE COLLATE NOCASE,
        password TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

      CREATE TABLE IF NOT EXISTS refresh_tokens (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        token_hash TEXT NOT NULL,
        expires_at TEXT NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token_hash ON refresh_tokens(token_hash);
      CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);
    `);
  });

  afterEach(() => {
    db.close();
    if (existsSync(TEST_DB_PATH)) {
      rmSync(TEST_DB_PATH);
    }
  });

  it("creates users table with correct columns", () => {
    const columns = db.prepare("PRAGMA table_info(users)").all() as Array<{ name: string; type: string; notnull: number }>;
    const columnNames = columns.map((c) => c.name);

    expect(columnNames).toContain("id");
    expect(columnNames).toContain("username");
    expect(columnNames).toContain("email");
    expect(columnNames).toContain("password");
    expect(columnNames).toContain("created_at");
    expect(columnNames).toContain("updated_at");
  });

  it("creates refresh_tokens table with correct columns", () => {
    const columns = db.prepare("PRAGMA table_info(refresh_tokens)").all() as Array<{ name: string }>;
    const columnNames = columns.map((c) => c.name);

    expect(columnNames).toContain("id");
    expect(columnNames).toContain("user_id");
    expect(columnNames).toContain("token_hash");
    expect(columnNames).toContain("expires_at");
    expect(columnNames).toContain("created_at");
  });

  it("enforces unique username constraint (case-insensitive)", () => {
    const now = new Date().toISOString();
    db.prepare("INSERT INTO users VALUES (?, ?, ?, ?, ?, ?)").run("id1", "TestUser", "a@b.com", "hash", now, now);

    expect(() => {
      db.prepare("INSERT INTO users VALUES (?, ?, ?, ?, ?, ?)").run("id2", "testuser", "c@d.com", "hash", now, now);
    }).toThrow(/UNIQUE/);
  });

  it("enforces unique email constraint (case-insensitive)", () => {
    const now = new Date().toISOString();
    db.prepare("INSERT INTO users VALUES (?, ?, ?, ?, ?, ?)").run("id1", "user1", "Test@Email.com", "hash", now, now);

    expect(() => {
      db.prepare("INSERT INTO users VALUES (?, ?, ?, ?, ?, ?)").run("id2", "user2", "test@email.com", "hash", now, now);
    }).toThrow(/UNIQUE/);
  });

  it("enforces foreign key constraint on refresh_tokens", () => {
    const now = new Date().toISOString();
    expect(() => {
      db.prepare("INSERT INTO refresh_tokens VALUES (?, ?, ?, ?, ?)").run("rt1", "nonexistent", "hash", now, now);
    }).toThrow(/FOREIGN KEY/);
  });

  it("cascades delete from users to refresh_tokens", () => {
    const now = new Date().toISOString();
    db.prepare("INSERT INTO users VALUES (?, ?, ?, ?, ?, ?)").run("u1", "user1", "a@b.com", "hash", now, now);
    db.prepare("INSERT INTO refresh_tokens VALUES (?, ?, ?, ?, ?)").run("rt1", "u1", "tokenhash", now, now);

    // Verify token exists
    const before = db.prepare("SELECT COUNT(*) as count FROM refresh_tokens WHERE user_id = ?").get("u1") as { count: number };
    expect(before.count).toBe(1);

    // Delete user
    db.prepare("DELETE FROM users WHERE id = ?").run("u1");

    // Token should be gone
    const after = db.prepare("SELECT COUNT(*) as count FROM refresh_tokens WHERE user_id = ?").get("u1") as { count: number };
    expect(after.count).toBe(0);
  });

  it("creates expected indexes", () => {
    const indexes = db.prepare("SELECT name FROM sqlite_master WHERE type = 'index' AND sql IS NOT NULL").all() as Array<{ name: string }>;
    const indexNames = indexes.map((i) => i.name);

    expect(indexNames).toContain("idx_users_email");
    expect(indexNames).toContain("idx_users_username");
    expect(indexNames).toContain("idx_refresh_tokens_token_hash");
    expect(indexNames).toContain("idx_refresh_tokens_user_id");
  });
});
