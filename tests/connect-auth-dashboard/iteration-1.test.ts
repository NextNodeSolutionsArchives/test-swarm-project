/**
 * Iteration 1 Tests — connect-auth-dashboard
 * FR-1: Remove AUTH_ENABLED flag + mock auth module
 * FR-2: Protect /dashboard with 302 redirect
 * FR-3: Protect API routes with 401 JSON
 * FR-4: JWT-based auth-guard utility
 * FR-10: Redirect authenticated /auth visitors to /dashboard
 */
import { describe, it, expect } from "vitest";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";

const ROOT = resolve(__dirname, "../..");
const SRC = join(ROOT, "src");

function readFile(relativePath: string): string {
  return readFileSync(join(ROOT, relativePath), "utf-8");
}

function fileExists(relativePath: string): boolean {
  return existsSync(join(ROOT, relativePath));
}

describe("FR-1: Remove AUTH_ENABLED feature flag", () => {
  it("src/lib/auth.ts (mock auth module) should NOT exist", () => {
    expect(fileExists("src/lib/auth.ts")).toBe(false);
  });

  it("src/env.d.ts should NOT reference AUTH_ENABLED", () => {
    const content = readFile("src/env.d.ts");
    expect(content).not.toContain("AUTH_ENABLED");
  });

  it("no source file should import from @/lib/auth (the old mock module)", () => {
    const apiRoutes = [
      "src/pages/api/tasks/index.ts",
      "src/pages/api/tasks/[id].ts",
      "src/pages/api/tasks/[id]/restore.ts",
      "src/pages/api/tasks/reorder.ts",
      "src/pages/api/columns/index.ts",
      "src/pages/api/columns/[id].ts",
      "src/pages/api/columns/reorder.ts",
    ];

    for (const route of apiRoutes) {
      const content = readFile(route);
      expect(content, `${route} still imports from @/lib/auth`).not.toMatch(
        /from\s+["']@\/lib\/auth["']/
      );
    }
  });

  it("no source file should reference getUserIdFromRequest", () => {
    const apiRoutes = [
      "src/pages/api/tasks/index.ts",
      "src/pages/api/tasks/[id].ts",
      "src/pages/api/tasks/[id]/restore.ts",
      "src/pages/api/tasks/reorder.ts",
      "src/pages/api/columns/index.ts",
      "src/pages/api/columns/[id].ts",
      "src/pages/api/columns/reorder.ts",
    ];

    for (const route of apiRoutes) {
      const content = readFile(route);
      expect(content, `${route} still uses getUserIdFromRequest`).not.toContain(
        "getUserIdFromRequest"
      );
    }
  });
});

describe("FR-4: JWT-based auth-guard utility", () => {
  it("src/lib/auth-guard.ts should exist", () => {
    expect(fileExists("src/lib/auth-guard.ts")).toBe(true);
  });

  it("auth-guard.ts should import verifyAccessToken from auth/tokens", () => {
    const content = readFile("src/lib/auth-guard.ts");
    expect(content).toMatch(/verifyAccessToken/);
    expect(content).toMatch(/auth\/tokens/);
  });

  it("auth-guard.ts should reference the pulseo_access cookie", () => {
    const content = readFile("src/lib/auth-guard.ts");
    // Either uses the COOKIE_ACCESS constant or the literal string
    expect(
      content.includes("pulseo_access") || content.includes("COOKIE_ACCESS")
    ).toBe(true);
  });

  it("auth-guard.ts should export a function for extracting user from request", () => {
    const content = readFile("src/lib/auth-guard.ts");
    // Should export a function (named export)
    expect(content).toMatch(/export\s+(async\s+)?function\s+\w+/);
  });

  it("auth-guard.ts should NOT contain mock user or AUTH_ENABLED references", () => {
    const content = readFile("src/lib/auth-guard.ts");
    expect(content).not.toContain("mock-user");
    expect(content).not.toContain("AUTH_ENABLED");
    expect(content).not.toContain("MOCK_USER");
  });
});

describe("FR-3: Protect dashboard API routes with 401", () => {
  const apiRoutes = [
    "src/pages/api/tasks/index.ts",
    "src/pages/api/tasks/[id].ts",
    "src/pages/api/tasks/[id]/restore.ts",
    "src/pages/api/tasks/reorder.ts",
    "src/pages/api/columns/index.ts",
    "src/pages/api/columns/[id].ts",
    "src/pages/api/columns/reorder.ts",
  ];

  it("all API routes should import from @/lib/auth-guard", () => {
    for (const route of apiRoutes) {
      const content = readFile(route);
      expect(content, `${route} missing auth-guard import`).toMatch(
        /from\s+["']@\/lib\/auth-guard["']/
      );
    }
  });

  it("all API routes should have unauthorized response handling", () => {
    for (const route of apiRoutes) {
      const content = readFile(route);
      // Should call unauthorizedResponse() for unauthenticated requests
      expect(content, `${route} missing unauthorizedResponse`).toContain(
        "unauthorizedResponse"
      );
    }
  });
});

describe("FR-2: Protect /dashboard with 302 redirect to /auth", () => {
  it("dashboard.astro should contain auth guard logic", () => {
    const content = readFile("src/pages/dashboard.astro");
    // Should import or use verifyAccessToken or auth-guard
    expect(
      content.includes("auth-guard") ||
        content.includes("verifyAccessToken") ||
        content.includes("pulseo_access") ||
        content.includes("COOKIE_ACCESS")
    ).toBe(true);
  });

  it("dashboard.astro should redirect to /auth", () => {
    const content = readFile("src/pages/dashboard.astro");
    expect(content).toMatch(/redirect.*\/auth|\/auth.*redirect/i);
  });

  it("dashboard.astro should pass user data to the component", () => {
    const content = readFile("src/pages/dashboard.astro");
    // Should pass user-related props
    expect(
      content.includes("username") || content.includes("user")
    ).toBe(true);
  });
});

describe("FR-10: Redirect authenticated /auth visitors to /dashboard", () => {
  it("auth.astro should contain JWT verification logic", () => {
    const content = readFile("src/pages/auth.astro");
    expect(
      content.includes("auth-guard") ||
        content.includes("verifyAccessToken") ||
        content.includes("pulseo_access") ||
        content.includes("COOKIE_ACCESS")
    ).toBe(true);
  });

  it("auth.astro should redirect authenticated users to /dashboard", () => {
    const content = readFile("src/pages/auth.astro");
    expect(content).toMatch(/redirect.*\/dashboard|\/dashboard.*redirect/i);
  });
});
