import { getDatabase } from "./database";

interface RefreshTokenRow {
  id: string;
  user_id: string;
  token_hash: string;
  expires_at: string;
  created_at: string;
}

export function storeRefreshToken(id: string, userId: string, tokenHash: string, expiresAt: string): void {
  const db = getDatabase();
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO refresh_tokens (id, user_id, token_hash, expires_at, created_at)
    VALUES (?, ?, ?, ?, ?)
  `).run(id, userId, tokenHash, expiresAt, now);
}

export function findRefreshTokenByHash(tokenHash: string): RefreshTokenRow | undefined {
  const db = getDatabase();
  return db.prepare("SELECT * FROM refresh_tokens WHERE token_hash = ?").get(tokenHash) as RefreshTokenRow | undefined;
}

export function deleteRefreshToken(id: string): void {
  const db = getDatabase();
  db.prepare("DELETE FROM refresh_tokens WHERE id = ?").run(id);
}

export function deleteRefreshTokenByHash(tokenHash: string): void {
  const db = getDatabase();
  db.prepare("DELETE FROM refresh_tokens WHERE token_hash = ?").run(tokenHash);
}

export function deleteAllRefreshTokensForUser(userId: string): void {
  const db = getDatabase();
  db.prepare("DELETE FROM refresh_tokens WHERE user_id = ?").run(userId);
}

export function isTokenExpired(expiresAt: string): boolean {
  return new Date(expiresAt) <= new Date();
}
