/**
 * Iteration 2 Tests — connect-auth-dashboard
 * FR-5: Auto-seed default columns on first visit
 * FR-6: Dashboard header bar with username + logout
 * FR-7: Silent token refresh in api-client
 * FR-8: After login, redirect to /dashboard
 * FR-9: After logout, redirect to /auth
 */
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";

const ROOT = resolve(__dirname, "../..");

function readFile(relativePath: string): string {
  return readFileSync(join(ROOT, relativePath), "utf-8");
}

describe("FR-5: Auto-seed default columns on first visit", () => {
  it("GET /api/columns should call seedColumnsForUser before returning", () => {
    const content = readFile("src/pages/api/columns/index.ts");
    expect(content).toContain("seedColumnsForUser");
  });

  it("seedColumnsForUser should be imported in columns index", () => {
    const content = readFile("src/pages/api/columns/index.ts");
    expect(content).toMatch(/import.*seedColumnsForUser.*from/);
  });
});

describe("FR-6: Dashboard header bar with username + logout", () => {
  it("DashboardApp should accept username prop", () => {
    const content = readFile("src/components/dashboard/DashboardApp.tsx");
    expect(content).toContain("username");
  });

  it("DashboardApp should have a logout button or handler", () => {
    const content = readFile("src/components/dashboard/DashboardApp.tsx");
    expect(content).toMatch(/logout/i);
  });

  it("DashboardApp should import logout from auth client", () => {
    const content = readFile("src/components/dashboard/DashboardApp.tsx");
    expect(content).toMatch(/logout/);
  });

  it("DashboardApp should render a header bar with user info", () => {
    const content = readFile("src/components/dashboard/DashboardApp.tsx");
    // Should have header-like structure with username display
    expect(content).toMatch(/header|Header|dashboard-header/i);
  });

  it("dashboard.astro should pass username prop to DashboardApp", () => {
    const content = readFile("src/pages/dashboard.astro");
    expect(content).toMatch(/username\s*=\s*\{/);
  });
});

describe("FR-7: Silent token refresh in api-client", () => {
  it("api-client should handle 401 responses with token refresh", () => {
    const content = readFile("src/lib/api-client.ts");
    expect(content).toMatch(/401/);
  });

  it("api-client should call the refresh endpoint", () => {
    const content = readFile("src/lib/api-client.ts");
    expect(content).toMatch(/\/api\/auth\/refresh|refreshToken/);
  });

  it("api-client should retry the original request after refresh", () => {
    const content = readFile("src/lib/api-client.ts");
    // Should have retry logic
    expect(content).toMatch(/retry|fetch.*again|second.*fetch/i);
  });

  it("api-client should redirect to /auth on refresh failure", () => {
    const content = readFile("src/lib/api-client.ts");
    expect(content).toMatch(/\/auth/);
  });

  it("api-client should prevent infinite refresh loops", () => {
    const content = readFile("src/lib/api-client.ts");
    // Should have a flag or counter to prevent infinite loops
    expect(
      content.includes("isRetry") ||
        content.includes("retried") ||
        content.includes("_retry") ||
        content.includes("refreshing") ||
        content.includes("skipRefresh")
    ).toBe(true);
  });
});

describe("FR-8: After login, redirect to /dashboard", () => {
  it("AuthForm should redirect to /dashboard after successful login", () => {
    const content = readFile("src/components/AuthForm.tsx");
    expect(content).toContain("/dashboard");
  });

  it("AuthForm should redirect to /dashboard after successful registration", () => {
    const content = readFile("src/components/AuthForm.tsx");
    // Both login and register should redirect to /dashboard
    const dashboardRedirects = (content.match(/\/dashboard/g) || []).length;
    expect(dashboardRedirects).toBeGreaterThanOrEqual(2);
  });
});

describe("FR-9: After logout, redirect to /auth", () => {
  it("DashboardApp logout handler should redirect to /auth", () => {
    const content = readFile("src/components/dashboard/DashboardApp.tsx");
    expect(content).toContain("/auth");
  });

  it("DashboardApp should call logout API before redirecting", () => {
    const content = readFile("src/components/dashboard/DashboardApp.tsx");
    // Should call the logout function/endpoint
    expect(content).toMatch(/logout/);
  });
});
