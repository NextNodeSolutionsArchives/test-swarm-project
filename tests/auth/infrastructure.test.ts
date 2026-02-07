import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "node:fs";

describe("FR-1: Astro SSR Configuration", () => {
  it("astro.config.mjs uses static output with node adapter (Astro 5 SSR opt-in per page)", () => {
    const config = readFileSync("astro.config.mjs", "utf-8");
    expect(config).toContain('output: "static"');
  });

  it("astro.config.mjs imports and uses @astrojs/node adapter", () => {
    const config = readFileSync("astro.config.mjs", "utf-8");
    expect(config).toContain('@astrojs/node');
    expect(config).toContain("adapter:");
  });

  it("existing index page still exists", () => {
    expect(existsSync("src/pages/index.astro")).toBe(true);
  });
});

describe("FR-2: Hono API Integration", () => {
  it("catch-all API route exists", () => {
    expect(existsSync("src/pages/api/[...slug].ts")).toBe(true);
  });

  it("catch-all route disables prerender", () => {
    const content = readFileSync("src/pages/api/[...slug].ts", "utf-8");
    expect(content).toContain("prerender = false");
  });

  it("Hono app file exists with basePath /api", () => {
    expect(existsSync("src/lib/auth/app.ts")).toBe(true);
    const content = readFileSync("src/lib/auth/app.ts", "utf-8");
    expect(content).toContain('basePath("/api")');
  });

  it("Hono app mounts auth routes", () => {
    const content = readFileSync("src/lib/auth/app.ts", "utf-8");
    expect(content).toContain('"/auth"');
    expect(content).toContain("authRoutes");
  });
});

describe("FR-3: Database Setup", () => {
  it("database module exists", () => {
    expect(existsSync("src/lib/auth/database.ts")).toBe(true);
  });

  it("database module references correct DB path", () => {
    const content = readFileSync("src/lib/auth/database.ts", "utf-8");
    expect(content).toContain("data/pulseo.db");
  });

  it("database module creates users and refresh_tokens tables", () => {
    const content = readFileSync("src/lib/auth/database.ts", "utf-8");
    expect(content).toContain("CREATE TABLE IF NOT EXISTS users");
    expect(content).toContain("CREATE TABLE IF NOT EXISTS refresh_tokens");
  });

  it("database module creates indexes", () => {
    const content = readFileSync("src/lib/auth/database.ts", "utf-8");
    expect(content).toContain("idx_users_email");
    expect(content).toContain("idx_users_username");
    expect(content).toContain("idx_refresh_tokens_token_hash");
  });

  it("data/ directory is gitignored", () => {
    const gitignore = readFileSync(".gitignore", "utf-8");
    expect(gitignore).toContain("data/");
  });
});

describe("FR-11: Auth Middleware", () => {
  it("middleware module exists", () => {
    expect(existsSync("src/lib/auth/middleware.ts")).toBe(true);
  });

  it("middleware reads access token from cookie", () => {
    const content = readFileSync("src/lib/auth/middleware.ts", "utf-8");
    expect(content).toContain("COOKIE_ACCESS");
    expect(content).toContain("getCookie");
  });

  it("middleware sets user in context (non-blocking)", () => {
    const content = readFileSync("src/lib/auth/middleware.ts", "utf-8");
    expect(content).toContain('c.set("user"');
    // Should NOT contain 401 or reject — it's non-blocking
    expect(content).not.toContain("401");
  });
});

describe("Auth types", () => {
  it("types module exists with required exports", () => {
    const content = readFileSync("src/lib/auth/types.ts", "utf-8");
    expect(content).toContain("interface User");
    expect(content).toContain("interface PublicUser");
    expect(content).toContain("interface RefreshToken");
    expect(content).toContain("interface AccessTokenPayload");
    expect(content).toContain("COOKIE_ACCESS");
    expect(content).toContain("COOKIE_REFRESH");
    expect(content).toContain("pulseo_access");
    expect(content).toContain("pulseo_refresh");
  });
});

describe("Dependencies", () => {
  it("package.json includes all required auth dependencies", () => {
    const pkg = JSON.parse(readFileSync("package.json", "utf-8"));
    expect(pkg.dependencies["@astrojs/node"]).toBeTruthy();
    expect(pkg.dependencies["hono"]).toBeTruthy();
    expect(pkg.dependencies["better-sqlite3"]).toBeTruthy();
    expect(pkg.dependencies["argon2"]).toBeTruthy();
    expect(pkg.dependencies["jose"]).toBeTruthy();
    expect(pkg.dependencies["uuid"]).toBeTruthy();
  });
});
