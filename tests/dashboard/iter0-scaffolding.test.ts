import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "../..");

describe("Iteration 0 — Dashboard Scaffolding", () => {
  describe("Astro SSR Configuration", () => {
    it("should have node adapter configured in astro.config.mjs", () => {
      const config = readFileSync(join(ROOT, "astro.config.mjs"), "utf-8");
      expect(config).toContain("@astrojs/node");
      expect(config).toContain("adapter");
      // Astro 5 uses output: "static" with per-page prerender = false (hybrid removed)
    });
  });

  describe("Database Module", () => {
    it("should export getDb, seedColumnsForUser, cleanupExpiredSoftDeletes", () => {
      const dbFile = readFileSync(join(ROOT, "src/lib/db.ts"), "utf-8");
      expect(dbFile).toContain("export function getDb");
      expect(dbFile).toContain("export function seedColumnsForUser");
      expect(dbFile).toContain("export function cleanupExpiredSoftDeletes");
    });

    it("should create columns table with correct schema", () => {
      const dbFile = readFileSync(join(ROOT, "src/lib/db.ts"), "utf-8");
      expect(dbFile).toContain("CREATE TABLE IF NOT EXISTS columns");
      expect(dbFile).toContain("user_id TEXT NOT NULL");
      expect(dbFile).toContain("status_value TEXT NOT NULL");
      expect(dbFile).toContain("position INTEGER NOT NULL");
      expect(dbFile).toContain("color TEXT");
      expect(dbFile).toContain("created_at INTEGER NOT NULL");
    });

    it("should create tasks table with correct schema", () => {
      const dbFile = readFileSync(join(ROOT, "src/lib/db.ts"), "utf-8");
      expect(dbFile).toContain("CREATE TABLE IF NOT EXISTS tasks");
      expect(dbFile).toContain("title TEXT NOT NULL");
      expect(dbFile).toContain("description TEXT");
      expect(dbFile).toContain("status TEXT NOT NULL");
      expect(dbFile).toContain("deleted_at INTEGER");
      expect(dbFile).toContain("updated_at INTEGER NOT NULL");
    });

    it("should create indexes for performance", () => {
      const dbFile = readFileSync(join(ROOT, "src/lib/db.ts"), "utf-8");
      expect(dbFile).toContain("idx_tasks_user_id");
      expect(dbFile).toContain("idx_tasks_status");
      expect(dbFile).toContain("idx_tasks_position");
      expect(dbFile).toContain("idx_tasks_deleted_at");
      expect(dbFile).toContain("idx_columns_user_id");
    });

    it("should seed 3 default columns", () => {
      const dbFile = readFileSync(join(ROOT, "src/lib/db.ts"), "utf-8");
      expect(dbFile).toContain('"Todo"');
      expect(dbFile).toContain('"In Progress"');
      expect(dbFile).toContain('"Done"');
      expect(dbFile).toContain('"todo"');
      expect(dbFile).toContain('"in-progress"');
      expect(dbFile).toContain('"done"');
    });
  });

  describe("Auth Guard (JWT-based)", () => {
    it("should export getAuthenticatedUser and unauthorizedResponse", () => {
      const authFile = readFileSync(join(ROOT, "src/lib/auth-guard.ts"), "utf-8");
      expect(authFile).toContain("export async function getAuthenticatedUser");
      expect(authFile).toContain("export function unauthorizedResponse");
    });

    it("should verify JWT via verifyAccessToken", () => {
      const authFile = readFileSync(join(ROOT, "src/lib/auth-guard.ts"), "utf-8");
      expect(authFile).toContain("verifyAccessToken");
    });

    it("should use pulseo_access cookie for authentication", () => {
      const authFile = readFileSync(join(ROOT, "src/lib/auth-guard.ts"), "utf-8");
      expect(authFile.includes("pulseo_access") || authFile.includes("COOKIE_ACCESS")).toBe(true);
    });
  });

  describe("TypeScript Types", () => {
    it("should define Task interface with all required fields", () => {
      const types = readFileSync(join(ROOT, "src/lib/types.ts"), "utf-8");
      expect(types).toContain("export interface Task");
      expect(types).toContain("id: string");
      expect(types).toContain("userId: string");
      expect(types).toContain("title: string");
      expect(types).toContain("description: string | null");
      expect(types).toContain("status: string");
      expect(types).toContain("position: number");
      expect(types).toContain("deletedAt: number | null");
    });

    it("should define Column interface with all required fields", () => {
      const types = readFileSync(join(ROOT, "src/lib/types.ts"), "utf-8");
      expect(types).toContain("export interface Column");
      expect(types).toContain("statusValue: string");
      expect(types).toContain("color: string | null");
    });

    it("should define input types for CRUD operations", () => {
      const types = readFileSync(join(ROOT, "src/lib/types.ts"), "utf-8");
      expect(types).toContain("export interface CreateTaskInput");
      expect(types).toContain("export interface UpdateTaskInput");
      expect(types).toContain("export interface CreateColumnInput");
      expect(types).toContain("export interface UpdateColumnInput");
    });
  });

  describe("Input Sanitization", () => {
    it("should export sanitization functions", () => {
      const sanitize = readFileSync(join(ROOT, "src/lib/sanitize.ts"), "utf-8");
      expect(sanitize).toContain("export function stripHtmlTags");
      expect(sanitize).toContain("export function sanitizeTitle");
      expect(sanitize).toContain("export function sanitizeDescription");
      expect(sanitize).toContain("export function sanitizeColumnName");
      expect(sanitize).toContain("export function sanitizeStatusValue");
    });

    it("should enforce title max length of 200", () => {
      const sanitize = readFileSync(join(ROOT, "src/lib/sanitize.ts"), "utf-8");
      expect(sanitize).toContain("200");
    });

    it("should enforce description max length of 2000", () => {
      const sanitize = readFileSync(join(ROOT, "src/lib/sanitize.ts"), "utf-8");
      expect(sanitize).toContain("2000");
    });
  });

  describe("API Utilities", () => {
    it("should export jsonResponse and errorResponse helpers", () => {
      const utils = readFileSync(join(ROOT, "src/lib/api-utils.ts"), "utf-8");
      expect(utils).toContain("export function jsonResponse");
      expect(utils).toContain("export function errorResponse");
      expect(utils).toContain("export async function parseJsonBody");
    });
  });

  describe("Environment Declarations", () => {
    it("should declare JWT_SECRET in ProcessEnv", () => {
      const envDts = readFileSync(join(ROOT, "src/env.d.ts"), "utf-8");
      expect(envDts).toContain("JWT_SECRET");
    });
  });

  describe("File Structure", () => {
    const expectedFiles = [
      "src/lib/types.ts",
      "src/lib/db.ts",
      "src/lib/auth-guard.ts",
      "src/lib/sanitize.ts",
      "src/lib/api-utils.ts",
      "src/env.d.ts",
    ];

    for (const file of expectedFiles) {
      it(`should have ${file}`, () => {
        expect(existsSync(join(ROOT, file))).toBe(true);
      });
    }
  });
});
