import { describe, it, expect } from "vitest";
import {
  validateUsername,
  validateEmail,
  validatePassword,
  validateRegisterInput,
  validateLoginInput,
} from "../../src/lib/auth/validation";

describe("validateUsername", () => {
  it("accepts valid usernames", () => {
    expect(validateUsername("john_doe").valid).toBe(true);
    expect(validateUsername("abc").valid).toBe(true);
    expect(validateUsername("a".repeat(30)).valid).toBe(true);
    expect(validateUsername("User123").valid).toBe(true);
  });

  it("rejects empty username", () => {
    const result = validateUsername("");
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Username is required");
  });

  it("rejects username shorter than 3 chars", () => {
    const result = validateUsername("ab");
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("at least 3"))).toBe(true);
  });

  it("rejects username longer than 30 chars", () => {
    const result = validateUsername("a".repeat(31));
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("at most 30"))).toBe(true);
  });

  it("rejects username with special characters", () => {
    const result = validateUsername("john@doe");
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("letters, numbers, and underscores"))).toBe(true);
  });

  it("rejects username with spaces", () => {
    const result = validateUsername("john doe");
    expect(result.valid).toBe(false);
  });
});

describe("validateEmail", () => {
  it("accepts valid emails", () => {
    expect(validateEmail("user@example.com").valid).toBe(true);
    expect(validateEmail("test.user@domain.co").valid).toBe(true);
  });

  it("rejects empty email", () => {
    const result = validateEmail("");
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Email is required");
  });

  it("rejects invalid email format", () => {
    expect(validateEmail("notanemail").valid).toBe(false);
    expect(validateEmail("@domain.com").valid).toBe(false);
    expect(validateEmail("user@").valid).toBe(false);
  });
});

describe("validatePassword", () => {
  const validPassword = "StrongPass1!xy";

  it("accepts valid password", () => {
    expect(validatePassword(validPassword).valid).toBe(true);
  });

  it("rejects empty password", () => {
    const result = validatePassword("");
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Password is required");
  });

  it("rejects password shorter than 12 chars", () => {
    const result = validatePassword("Short1!abc");
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("at least 12"))).toBe(true);
  });

  it("rejects password without uppercase", () => {
    const result = validatePassword("lowercase1!abcd");
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("uppercase"))).toBe(true);
  });

  it("rejects password without lowercase", () => {
    const result = validatePassword("UPPERCASE1!ABCD");
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("lowercase"))).toBe(true);
  });

  it("rejects password without number", () => {
    const result = validatePassword("NoNumbers!abcd");
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("number"))).toBe(true);
  });

  it("rejects password without special character", () => {
    const result = validatePassword("NoSpecial1abcd");
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("special"))).toBe(true);
  });

  it("reports multiple failures at once", () => {
    const result = validatePassword("short");
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(1);
  });
});

describe("validateRegisterInput", () => {
  it("accepts valid input", () => {
    const result = validateRegisterInput({
      username: "testuser",
      email: "test@example.com",
      password: "ValidPass1!xyz",
    });
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("rejects null input", () => {
    const result = validateRegisterInput(null);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Request body is required");
  });

  it("collects errors from all fields", () => {
    const result = validateRegisterInput({
      username: "",
      email: "",
      password: "",
    });
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThanOrEqual(3);
  });
});

describe("validateLoginInput", () => {
  it("accepts valid input", () => {
    const result = validateLoginInput({
      email: "test@example.com",
      password: "anypassword",
    });
    expect(result.valid).toBe(true);
  });

  it("rejects missing email", () => {
    const result = validateLoginInput({ password: "test" });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Email is required");
  });

  it("rejects missing password", () => {
    const result = validateLoginInput({ email: "test@example.com" });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Password is required");
  });

  it("rejects null input", () => {
    const result = validateLoginInput(null);
    expect(result.valid).toBe(false);
  });
});
