import { describe, it, expect, beforeAll } from "vitest";
import { createAccessToken, verifyAccessToken, generateRefreshToken, hashToken } from "../../src/lib/auth/tokens";
import type { PublicUser } from "../../src/lib/auth/types";

const testUser: PublicUser = {
  id: "test-uuid-1234",
  username: "testuser",
  email: "test@example.com",
};

describe("createAccessToken + verifyAccessToken", () => {
  let token: string;

  beforeAll(async () => {
    token = await createAccessToken(testUser);
  });

  it("creates a non-empty JWT string", () => {
    expect(token).toBeTruthy();
    expect(typeof token).toBe("string");
    // JWT has 3 parts separated by dots
    expect(token.split(".")).toHaveLength(3);
  });

  it("verifies a valid token and returns correct payload", async () => {
    const payload = await verifyAccessToken(token);
    expect(payload).not.toBeNull();
    expect(payload!.sub).toBe(testUser.id);
    expect(payload!.username).toBe(testUser.username);
    expect(payload!.email).toBe(testUser.email);
    expect(payload!.iat).toBeTypeOf("number");
    expect(payload!.exp).toBeTypeOf("number");
    expect(payload!.exp).toBeGreaterThan(payload!.iat);
  });

  it("returns null for an invalid token", async () => {
    const payload = await verifyAccessToken("invalid.token.string");
    expect(payload).toBeNull();
  });

  it("returns null for an empty string", async () => {
    const payload = await verifyAccessToken("");
    expect(payload).toBeNull();
  });
});

describe("generateRefreshToken", () => {
  it("returns token, hash, id, and expiresAt", () => {
    const result = generateRefreshToken();
    expect(result.token).toBeTruthy();
    expect(result.hash).toBeTruthy();
    expect(result.id).toBeTruthy();
    expect(result.expiresAt).toBeTruthy();
  });

  it("generates unique tokens each time", () => {
    const a = generateRefreshToken();
    const b = generateRefreshToken();
    expect(a.token).not.toBe(b.token);
    expect(a.hash).not.toBe(b.hash);
    expect(a.id).not.toBe(b.id);
  });

  it("hash matches the hashToken function", () => {
    const result = generateRefreshToken();
    expect(hashToken(result.token)).toBe(result.hash);
  });

  it("expiresAt is in the future", () => {
    const result = generateRefreshToken();
    const expires = new Date(result.expiresAt);
    expect(expires.getTime()).toBeGreaterThan(Date.now());
  });
});

describe("hashToken", () => {
  it("produces consistent hashes", () => {
    const hash1 = hashToken("test-token");
    const hash2 = hashToken("test-token");
    expect(hash1).toBe(hash2);
  });

  it("produces different hashes for different inputs", () => {
    const hash1 = hashToken("token-a");
    const hash2 = hashToken("token-b");
    expect(hash1).not.toBe(hash2);
  });

  it("returns a 64-char hex string (SHA-256)", () => {
    const hash = hashToken("test");
    expect(hash).toHaveLength(64);
    expect(/^[0-9a-f]+$/.test(hash)).toBe(true);
  });
});
