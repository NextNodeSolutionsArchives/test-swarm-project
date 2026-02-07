import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { app } from "../../src/lib/auth/app";
import Database from "better-sqlite3";
import { mkdirSync, existsSync, rmSync } from "node:fs";

// Override DB path for tests by mocking the database module
// We test via the Hono app.fetch() which doesn't need a real server

const VALID_PASSWORD = "StrongPass1!xyz";
const VALID_USER = {
  username: "testuser",
  email: "test@example.com",
  password: VALID_PASSWORD,
};

function createRequest(method: string, path: string, body?: unknown, cookies?: string): Request {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (cookies) {
    headers["Cookie"] = cookies;
  }
  return new Request(`http://localhost${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
}

function getCookies(response: Response): Record<string, string> {
  const cookies: Record<string, string> = {};
  const setCookieHeaders = response.headers.getSetCookie();
  for (const header of setCookieHeaders) {
    const [nameValue] = header.split(";");
    const [name, value] = nameValue.split("=");
    cookies[name.trim()] = value?.trim() ?? "";
  }
  return cookies;
}

function buildCookieString(cookies: Record<string, string>): string {
  return Object.entries(cookies)
    .map(([k, v]) => `${k}=${v}`)
    .join("; ");
}

describe("Auth API Routes", () => {
  describe("POST /api/auth/register", () => {
    it("registers a new user successfully", async () => {
      const res = await app.fetch(
        createRequest("POST", "/api/auth/register", {
          username: "newuser_" + Date.now(),
          email: `new${Date.now()}@example.com`,
          password: VALID_PASSWORD,
        })
      );

      expect(res.status).toBe(201);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data.user).toHaveProperty("id");
      expect(body.data.user).toHaveProperty("username");
      expect(body.data.user).toHaveProperty("email");
      expect(body.data.user).not.toHaveProperty("password");
    });

    it("sets httpOnly cookies on registration", async () => {
      const res = await app.fetch(
        createRequest("POST", "/api/auth/register", {
          username: "cookieuser_" + Date.now(),
          email: `cookie${Date.now()}@example.com`,
          password: VALID_PASSWORD,
        })
      );

      const cookies = getCookies(res);
      expect(cookies).toHaveProperty("pulseo_access");
      expect(cookies).toHaveProperty("pulseo_refresh");
    });

    it("rejects invalid username (too short)", async () => {
      const res = await app.fetch(
        createRequest("POST", "/api/auth/register", {
          username: "ab",
          email: "test@example.com",
          password: VALID_PASSWORD,
        })
      );

      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.success).toBe(false);
      expect(body.error.code).toBe("INVALID_USERNAME");
    });

    it("rejects invalid email", async () => {
      const res = await app.fetch(
        createRequest("POST", "/api/auth/register", {
          username: "validuser",
          email: "not-an-email",
          password: VALID_PASSWORD,
        })
      );

      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.success).toBe(false);
      expect(body.error.code).toBe("INVALID_EMAIL");
    });

    it("rejects weak password", async () => {
      const res = await app.fetch(
        createRequest("POST", "/api/auth/register", {
          username: "validuser",
          email: "valid@example.com",
          password: "weak",
        })
      );

      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.success).toBe(false);
      expect(body.error.code).toBe("WEAK_PASSWORD");
    });

    it("rejects duplicate username", async () => {
      const uniqueUser = "dupuser_" + Date.now();
      // Register first
      await app.fetch(
        createRequest("POST", "/api/auth/register", {
          username: uniqueUser,
          email: `dup1_${Date.now()}@example.com`,
          password: VALID_PASSWORD,
        })
      );

      // Try duplicate
      const res = await app.fetch(
        createRequest("POST", "/api/auth/register", {
          username: uniqueUser,
          email: `dup2_${Date.now()}@example.com`,
          password: VALID_PASSWORD,
        })
      );

      expect(res.status).toBe(409);
      const body = await res.json();
      expect(body.error.code).toBe("USERNAME_TAKEN");
    });

    it("rejects duplicate email", async () => {
      const uniqueEmail = `dupemail_${Date.now()}@example.com`;
      // Register first
      await app.fetch(
        createRequest("POST", "/api/auth/register", {
          username: "emaildup1_" + Date.now(),
          email: uniqueEmail,
          password: VALID_PASSWORD,
        })
      );

      // Try duplicate
      const res = await app.fetch(
        createRequest("POST", "/api/auth/register", {
          username: "emaildup2_" + Date.now(),
          email: uniqueEmail,
          password: VALID_PASSWORD,
        })
      );

      expect(res.status).toBe(409);
      const body = await res.json();
      expect(body.error.code).toBe("EMAIL_TAKEN");
    });

    it("stores email as lowercase", async () => {
      const ts = Date.now();
      const res = await app.fetch(
        createRequest("POST", "/api/auth/register", {
          username: "lcuser_" + ts,
          email: `MixedCase_${ts}@Example.COM`,
          password: VALID_PASSWORD,
        })
      );

      expect(res.status).toBe(201);
      const body = await res.json();
      expect(body.data.user.email).toBe(`mixedcase_${ts}@example.com`);
    });
  });

  describe("POST /api/auth/login", () => {
    const loginEmail = `login_${Date.now()}@example.com`;
    const loginUsername = "loginuser_" + Date.now();

    beforeAll(async () => {
      await app.fetch(
        createRequest("POST", "/api/auth/register", {
          username: loginUsername,
          email: loginEmail,
          password: VALID_PASSWORD,
        })
      );
    });

    it("logs in successfully with correct credentials", async () => {
      const res = await app.fetch(
        createRequest("POST", "/api/auth/login", {
          email: loginEmail,
          password: VALID_PASSWORD,
        })
      );

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data.user.email).toBe(loginEmail);
    });

    it("sets cookies on login", async () => {
      const res = await app.fetch(
        createRequest("POST", "/api/auth/login", {
          email: loginEmail,
          password: VALID_PASSWORD,
        })
      );

      const cookies = getCookies(res);
      expect(cookies).toHaveProperty("pulseo_access");
      expect(cookies).toHaveProperty("pulseo_refresh");
    });

    it("rejects wrong password without leaking info", async () => {
      const res = await app.fetch(
        createRequest("POST", "/api/auth/login", {
          email: loginEmail,
          password: "WrongPassword1!x",
        })
      );

      expect(res.status).toBe(401);
      const body = await res.json();
      expect(body.error.code).toBe("INVALID_CREDENTIALS");
      // Should use generic message (not leak that password specifically was wrong)
      expect(body.error.message).not.toContain("wrong password");
      expect(body.error.message).not.toContain("incorrect password");
    });

    it("rejects non-existent email without leaking info", async () => {
      const res = await app.fetch(
        createRequest("POST", "/api/auth/login", {
          email: "nonexistent@example.com",
          password: VALID_PASSWORD,
        })
      );

      expect(res.status).toBe(401);
      const body = await res.json();
      expect(body.error.code).toBe("INVALID_CREDENTIALS");
      // Same error for non-existent email
      expect(body.error.message).not.toContain("not found");
    });

    it("rejects missing email field", async () => {
      const res = await app.fetch(
        createRequest("POST", "/api/auth/login", {
          password: VALID_PASSWORD,
        })
      );

      expect(res.status).toBe(401);
      const body = await res.json();
      expect(body.success).toBe(false);
    });
  });

  describe("GET /api/auth/me", () => {
    it("returns user when authenticated", async () => {
      const ts = Date.now();
      // Register to get cookies
      const registerRes = await app.fetch(
        createRequest("POST", "/api/auth/register", {
          username: "meuser_" + ts,
          email: `me_${ts}@example.com`,
          password: VALID_PASSWORD,
        })
      );

      const cookies = getCookies(registerRes);
      const cookieStr = buildCookieString(cookies);

      const res = await app.fetch(createRequest("GET", "/api/auth/me", undefined, cookieStr));

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data.user).toHaveProperty("id");
      expect(body.data.user).toHaveProperty("username");
      expect(body.data.user).toHaveProperty("email");
      expect(body.data.user).toHaveProperty("createdAt");
    });

    it("returns 401 when not authenticated", async () => {
      const res = await app.fetch(createRequest("GET", "/api/auth/me"));

      expect(res.status).toBe(401);
      const body = await res.json();
      expect(body.error.code).toBe("UNAUTHORIZED");
    });

    it("returns 401 with invalid token", async () => {
      const res = await app.fetch(
        createRequest("GET", "/api/auth/me", undefined, "pulseo_access=invalid.token.here")
      );

      expect(res.status).toBe(401);
    });
  });

  describe("POST /api/auth/logout", () => {
    it("clears cookies on logout", async () => {
      const ts = Date.now();
      const registerRes = await app.fetch(
        createRequest("POST", "/api/auth/register", {
          username: "logoutuser_" + ts,
          email: `logout_${ts}@example.com`,
          password: VALID_PASSWORD,
        })
      );

      const cookies = getCookies(registerRes);
      const cookieStr = buildCookieString(cookies);

      const res = await app.fetch(createRequest("POST", "/api/auth/logout", undefined, cookieStr));

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data).toBeNull();
    });

    it("succeeds even without cookies", async () => {
      const res = await app.fetch(createRequest("POST", "/api/auth/logout"));

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
    });
  });

  describe("POST /api/auth/refresh", () => {
    it("refreshes tokens successfully", async () => {
      const ts = Date.now();
      const registerRes = await app.fetch(
        createRequest("POST", "/api/auth/register", {
          username: "refreshuser_" + ts,
          email: `refresh_${ts}@example.com`,
          password: VALID_PASSWORD,
        })
      );

      const cookies = getCookies(registerRes);
      const cookieStr = buildCookieString(cookies);

      const res = await app.fetch(createRequest("POST", "/api/auth/refresh", undefined, cookieStr));

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data.user).toHaveProperty("id");

      // Should set new cookies
      const newCookies = getCookies(res);
      expect(newCookies).toHaveProperty("pulseo_access");
      expect(newCookies).toHaveProperty("pulseo_refresh");
    });

    it("rejects when no refresh token cookie", async () => {
      const res = await app.fetch(createRequest("POST", "/api/auth/refresh"));

      expect(res.status).toBe(401);
      const body = await res.json();
      expect(body.error.code).toBe("INVALID_REFRESH_TOKEN");
    });

    it("rejects invalid refresh token", async () => {
      const res = await app.fetch(
        createRequest("POST", "/api/auth/refresh", undefined, "pulseo_refresh=invalid_token_value")
      );

      expect(res.status).toBe(401);
    });
  });

  describe("API response format consistency", () => {
    it("all success responses have { success: true, data: ... }", async () => {
      const ts = Date.now();
      const res = await app.fetch(
        createRequest("POST", "/api/auth/register", {
          username: "formatuser_" + ts,
          email: `format_${ts}@example.com`,
          password: VALID_PASSWORD,
        })
      );

      const body = await res.json();
      expect(body).toHaveProperty("success", true);
      expect(body).toHaveProperty("data");
    });

    it("all error responses have { success: false, error: { code, message } }", async () => {
      const res = await app.fetch(
        createRequest("POST", "/api/auth/login", {
          email: "wrong@example.com",
          password: "WrongPass1!xyz",
        })
      );

      const body = await res.json();
      expect(body).toHaveProperty("success", false);
      expect(body.error).toHaveProperty("code");
      expect(body.error).toHaveProperty("message");
    });
  });

  describe("Health check", () => {
    it("returns ok", async () => {
      const res = await app.fetch(new Request("http://localhost/api/health"));
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.status).toBe("ok");
    });
  });
});
