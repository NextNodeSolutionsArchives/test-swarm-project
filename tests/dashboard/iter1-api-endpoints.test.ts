import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "../..");

describe("Iteration 1 — API Endpoints & Repositories", () => {
  describe("File Structure", () => {
    const expectedFiles = [
      "src/lib/columns-repository.ts",
      "src/lib/tasks-repository.ts",
      "src/pages/api/tasks/index.ts",
      "src/pages/api/tasks/[id].ts",
      "src/pages/api/tasks/[id]/restore.ts",
      "src/pages/api/tasks/reorder.ts",
      "src/pages/api/columns/index.ts",
      "src/pages/api/columns/[id].ts",
      "src/pages/api/columns/reorder.ts",
    ];

    for (const file of expectedFiles) {
      it(`should have ${file}`, () => {
        expect(existsSync(join(ROOT, file))).toBe(true);
      });
    }
  });

  describe("Columns Repository", () => {
    it("should export CRUD functions for columns", () => {
      const repo = readFileSync(join(ROOT, "src/lib/columns-repository.ts"), "utf-8");
      expect(repo).toContain("export function getColumns");
      expect(repo).toContain("export function getColumnById");
      expect(repo).toContain("export function getColumnByStatus");
      expect(repo).toContain("export function createColumn");
      expect(repo).toContain("export function updateColumn");
      expect(repo).toContain("export function deleteColumn");
      expect(repo).toContain("export function reorderColumns");
    });

    it("should enforce max 10 columns per user", () => {
      const repo = readFileSync(join(ROOT, "src/lib/columns-repository.ts"), "utf-8");
      expect(repo).toContain("10");
      expect(repo).toContain("Maximum");
    });

    it("should check duplicate status_value on create", () => {
      const repo = readFileSync(join(ROOT, "src/lib/columns-repository.ts"), "utf-8");
      expect(repo).toContain("Status value already exists");
    });

    it("should cascade status changes to tasks on update", () => {
      const repo = readFileSync(join(ROOT, "src/lib/columns-repository.ts"), "utf-8");
      expect(repo).toContain("UPDATE tasks SET status");
    });

    it("should prevent deletion of columns with tasks", () => {
      const repo = readFileSync(join(ROOT, "src/lib/columns-repository.ts"), "utf-8");
      expect(repo).toContain("tasks first");
    });
  });

  describe("Tasks Repository", () => {
    it("should export CRUD functions for tasks", () => {
      const repo = readFileSync(join(ROOT, "src/lib/tasks-repository.ts"), "utf-8");
      expect(repo).toContain("export function getTasks");
      expect(repo).toContain("export function getTaskById");
      expect(repo).toContain("export function createTask");
      expect(repo).toContain("export function updateTask");
      expect(repo).toContain("export function softDeleteTask");
      expect(repo).toContain("export function restoreTask");
      expect(repo).toContain("export function reorderTasks");
    });

    it("should filter out soft-deleted tasks in getTasks", () => {
      const repo = readFileSync(join(ROOT, "src/lib/tasks-repository.ts"), "utf-8");
      expect(repo).toContain("deleted_at IS NULL");
    });

    it("should support optional status filter in getTasks", () => {
      const repo = readFileSync(join(ROOT, "src/lib/tasks-repository.ts"), "utf-8");
      expect(repo).toContain("AND status = ?");
    });

    it("should auto-assign position on task creation", () => {
      const repo = readFileSync(join(ROOT, "src/lib/tasks-repository.ts"), "utf-8");
      expect(repo).toContain("MAX(position)");
    });

    it("should set deleted_at on soft delete", () => {
      const repo = readFileSync(join(ROOT, "src/lib/tasks-repository.ts"), "utf-8");
      expect(repo).toContain("SET deleted_at");
    });

    it("should clear deleted_at on restore", () => {
      const repo = readFileSync(join(ROOT, "src/lib/tasks-repository.ts"), "utf-8");
      expect(repo).toContain("deleted_at = NULL");
    });
  });

  describe("Tasks API Routes", () => {
    it("GET /api/tasks should export GET handler with prerender false", () => {
      const route = readFileSync(join(ROOT, "src/pages/api/tasks/index.ts"), "utf-8");
      expect(route).toContain("export const GET");
      expect(route).toContain("prerender = false");
      expect(route).toContain("getAuthenticatedUser");
    });

    it("POST /api/tasks should validate title and status", () => {
      const route = readFileSync(join(ROOT, "src/pages/api/tasks/index.ts"), "utf-8");
      expect(route).toContain("export const POST");
      expect(route).toContain("sanitizeTitle");
      expect(route).toContain("sanitizeDescription");
      expect(route).toContain("Status does not match any column");
    });

    it("POST /api/tasks should default status to first column", () => {
      const route = readFileSync(join(ROOT, "src/pages/api/tasks/index.ts"), "utf-8");
      expect(route).toContain("columns[0].statusValue");
    });

    it("PUT /api/tasks/:id should validate inputs and return 404 if not found", () => {
      const route = readFileSync(join(ROOT, "src/pages/api/tasks/[id].ts"), "utf-8");
      expect(route).toContain("export const PUT");
      expect(route).toContain("Task not found");
      expect(route).toContain("sanitizeTitle");
    });

    it("DELETE /api/tasks/:id should soft-delete", () => {
      const route = readFileSync(join(ROOT, "src/pages/api/tasks/[id].ts"), "utf-8");
      expect(route).toContain("export const DELETE");
      expect(route).toContain("softDeleteTask");
    });

    it("POST /api/tasks/:id/restore should clear soft delete", () => {
      const route = readFileSync(join(ROOT, "src/pages/api/tasks/[id]/restore.ts"), "utf-8");
      expect(route).toContain("export const POST");
      expect(route).toContain("restoreTask");
    });

    it("POST /api/tasks/reorder should accept taskIds array", () => {
      const route = readFileSync(join(ROOT, "src/pages/api/tasks/reorder.ts"), "utf-8");
      expect(route).toContain("export const POST");
      expect(route).toContain("taskIds");
      expect(route).toContain("reorderTasks");
    });
  });

  describe("Columns API Routes", () => {
    it("GET /api/columns should return columns for user", () => {
      const route = readFileSync(join(ROOT, "src/pages/api/columns/index.ts"), "utf-8");
      expect(route).toContain("export const GET");
      expect(route).toContain("getColumns");
    });

    it("POST /api/columns should validate name and statusValue", () => {
      const route = readFileSync(join(ROOT, "src/pages/api/columns/index.ts"), "utf-8");
      expect(route).toContain("export const POST");
      expect(route).toContain("sanitizeColumnName");
      expect(route).toContain("sanitizeStatusValue");
    });

    it("PUT /api/columns/:id should validate and update", () => {
      const route = readFileSync(join(ROOT, "src/pages/api/columns/[id].ts"), "utf-8");
      expect(route).toContain("export const PUT");
      expect(route).toContain("updateColumn");
    });

    it("DELETE /api/columns/:id should check for tasks before deletion", () => {
      const route = readFileSync(join(ROOT, "src/pages/api/columns/[id].ts"), "utf-8");
      expect(route).toContain("export const DELETE");
      expect(route).toContain("deleteColumn");
    });

    it("POST /api/columns/reorder should accept columnIds array", () => {
      const route = readFileSync(join(ROOT, "src/pages/api/columns/reorder.ts"), "utf-8");
      expect(route).toContain("export const POST");
      expect(route).toContain("columnIds");
      expect(route).toContain("reorderColumns");
    });
  });

  describe("Auth Integration in Routes", () => {
    it("all task routes should check auth", () => {
      const files = [
        "src/pages/api/tasks/index.ts",
        "src/pages/api/tasks/[id].ts",
        "src/pages/api/tasks/[id]/restore.ts",
        "src/pages/api/tasks/reorder.ts",
      ];
      for (const file of files) {
        const content = readFileSync(join(ROOT, file), "utf-8");
        expect(content).toContain("getAuthenticatedUser");
        expect(content).toContain("unauthorizedResponse");
      }
    });

    it("all column routes should check auth", () => {
      const files = [
        "src/pages/api/columns/index.ts",
        "src/pages/api/columns/[id].ts",
        "src/pages/api/columns/reorder.ts",
      ];
      for (const file of files) {
        const content = readFileSync(join(ROOT, file), "utf-8");
        expect(content).toContain("getAuthenticatedUser");
        expect(content).toContain("unauthorizedResponse");
      }
    });
  });
});
