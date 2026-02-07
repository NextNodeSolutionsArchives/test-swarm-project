import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword } from "../../src/lib/auth/password";

describe("hashPassword + verifyPassword", () => {
  it("hashes and verifies a password correctly", async () => {
    const password = "TestPassword1!xyz";
    const hash = await hashPassword(password);

    expect(hash).toBeTruthy();
    expect(hash).not.toBe(password);
    // Argon2 hashes start with $argon2
    expect(hash.startsWith("$argon2")).toBe(true);

    const isValid = await verifyPassword(hash, password);
    expect(isValid).toBe(true);
  });

  it("rejects wrong password", async () => {
    const hash = await hashPassword("CorrectPass1!xy");
    const isValid = await verifyPassword(hash, "WrongPassword1!x");
    expect(isValid).toBe(false);
  });

  it("returns false for invalid hash", async () => {
    const isValid = await verifyPassword("not-a-hash", "anypassword");
    expect(isValid).toBe(false);
  });

  it("produces different hashes for same password (salted)", async () => {
    const hash1 = await hashPassword("SamePassword1!x");
    const hash2 = await hashPassword("SamePassword1!x");
    expect(hash1).not.toBe(hash2);
  });
});
