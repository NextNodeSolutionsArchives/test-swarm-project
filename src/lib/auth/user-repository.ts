import { v4 as uuidv4 } from "uuid";
import { getDatabase } from "./database";
import type { User, PublicUser, PublicUserWithTimestamp } from "./types";

export function createUser(username: string, email: string, hashedPassword: string): User {
  const db = getDatabase();
  const id = uuidv4();
  const now = new Date().toISOString();

  const stmt = db.prepare(`
    INSERT INTO users (id, username, email, password, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  stmt.run(id, username, email.toLowerCase(), hashedPassword, now, now);

  return { id, username, email: email.toLowerCase(), password: hashedPassword, createdAt: now, updatedAt: now };
}

export function findUserByEmail(email: string): User | undefined {
  const db = getDatabase();
  const stmt = db.prepare("SELECT * FROM users WHERE email = ? COLLATE NOCASE");
  const row = stmt.get(email.toLowerCase()) as Record<string, string> | undefined;

  if (!row) return undefined;

  return {
    id: row.id,
    username: row.username,
    email: row.email,
    password: row.password,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function findUserById(id: string): User | undefined {
  const db = getDatabase();
  const stmt = db.prepare("SELECT * FROM users WHERE id = ?");
  const row = stmt.get(id) as Record<string, string> | undefined;

  if (!row) return undefined;

  return {
    id: row.id,
    username: row.username,
    email: row.email,
    password: row.password,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function findUserByUsername(username: string): User | undefined {
  const db = getDatabase();
  const stmt = db.prepare("SELECT * FROM users WHERE username = ? COLLATE NOCASE");
  const row = stmt.get(username) as Record<string, string> | undefined;

  if (!row) return undefined;

  return {
    id: row.id,
    username: row.username,
    email: row.email,
    password: row.password,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function toPublicUser(user: User): PublicUser {
  return { id: user.id, username: user.username, email: user.email };
}

export function toPublicUserWithTimestamp(user: User): PublicUserWithTimestamp {
  return { id: user.id, username: user.username, email: user.email, createdAt: user.createdAt };
}
