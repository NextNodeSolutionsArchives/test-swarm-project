import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "../..");

describe("Iteration 2 — Task CRUD UI", () => {
  describe("File Structure", () => {
    const expectedFiles = [
      "src/pages/dashboard.astro",
      "src/components/dashboard/DashboardApp.tsx",
      "src/components/dashboard/TaskList.tsx",
      "src/components/dashboard/TaskCard.tsx",
      "src/components/dashboard/TaskForm.tsx",
      "src/components/dashboard/EmptyState.tsx",
      "src/components/dashboard/Toast.tsx",
      "src/components/dashboard/Toolbar.tsx",
      "src/components/dashboard/FilterTabs.tsx",
      "src/lib/api-client.ts",
    ];

    for (const file of expectedFiles) {
      it(`should have ${file}`, () => {
        expect(existsSync(join(ROOT, file))).toBe(true);
      });
    }
  });

  describe("Dashboard Page (FR-1)", () => {
    it("should be an Astro page at /dashboard", () => {
      const page = readFileSync(join(ROOT, "src/pages/dashboard.astro"), "utf-8");
      expect(page).toContain("BaseLayout");
      expect(page).toContain("DashboardApp");
      expect(page).toContain("client:only");
      expect(page).toContain("prerender = false");
    });
  });

  describe("DashboardApp Component", () => {
    it("should import and use all sub-components", () => {
      const app = readFileSync(join(ROOT, "src/components/dashboard/DashboardApp.tsx"), "utf-8");
      expect(app).toContain("Toolbar");
      expect(app).toContain("FilterTabs");
      expect(app).toContain("TaskForm");
      expect(app).toContain("EmptyState");
      expect(app).toContain("Toast");
      // TaskCard is used indirectly via SortableListView and KanbanBoard
      expect(app).toContain("SortableListView");
    });

    it("should fetch tasks and columns on mount", () => {
      const app = readFileSync(join(ROOT, "src/components/dashboard/DashboardApp.tsx"), "utf-8");
      expect(app).toContain("fetchTasks");
      expect(app).toContain("fetchColumns");
      expect(app).toContain("useEffect");
    });

    it("should implement debounced search with 300ms delay (FR-6)", () => {
      const app = readFileSync(join(ROOT, "src/components/dashboard/DashboardApp.tsx"), "utf-8");
      expect(app).toContain("300");
      expect(app).toContain("debouncedSearch");
      expect(app).toContain("setTimeout");
    });

    it("should persist view mode in localStorage (FR-11)", () => {
      const app = readFileSync(join(ROOT, "src/components/dashboard/DashboardApp.tsx"), "utf-8");
      expect(app).toContain("localStorage");
      expect(app).toContain("dashboard-view-mode");
    });

    it("should support URL params for view and status (FR-5, FR-11)", () => {
      const app = readFileSync(join(ROOT, "src/components/dashboard/DashboardApp.tsx"), "utf-8");
      expect(app).toContain("searchParams");
      expect(app).toContain('"view"');
      expect(app).toContain('"status"');
      expect(app).toContain("replaceState");
    });

    it("should handle search with special character escaping", () => {
      const app = readFileSync(join(ROOT, "src/components/dashboard/DashboardApp.tsx"), "utf-8");
      // Should escape regex special chars for search
      expect(app).toContain("replace(");
    });
  });

  describe("TaskCard Component (FR-1, FR-3)", () => {
    it("should display task title, description, status badge, and relative time", () => {
      const card = readFileSync(join(ROOT, "src/components/dashboard/TaskCard.tsx"), "utf-8");
      expect(card).toContain("task.title");
      expect(card).toContain("task.description");
      expect(card).toContain("task.status");
      expect(card).toContain("getRelativeTime");
    });

    it("should truncate description to 2 lines", () => {
      const card = readFileSync(join(ROOT, "src/components/dashboard/TaskCard.tsx"), "utf-8");
      expect(card).toContain("line-clamp-2");
    });

    it("should expand to edit form on click (FR-3)", () => {
      const card = readFileSync(join(ROOT, "src/components/dashboard/TaskCard.tsx"), "utf-8");
      expect(card).toContain("isEditing");
      expect(card).toContain("TaskForm");
      expect(card).toContain("onClick");
    });

    it("should show delete icon on hover", () => {
      const card = readFileSync(join(ROOT, "src/components/dashboard/TaskCard.tsx"), "utf-8");
      expect(card).toContain("group-hover:opacity-100");
      expect(card).toContain("onDelete");
    });

    it("should use glassmorphism card style", () => {
      const card = readFileSync(join(ROOT, "src/components/dashboard/TaskCard.tsx"), "utf-8");
      expect(card).toContain("glass");
    });
  });

  describe("TaskForm Component (FR-2, FR-3)", () => {
    it("should have title input, description textarea, status dropdown", () => {
      const form = readFileSync(join(ROOT, "src/components/dashboard/TaskForm.tsx"), "utf-8");
      expect(form).toContain('type="text"');
      expect(form).toContain("textarea");
      expect(form).toContain("select");
    });

    it("should auto-focus title input", () => {
      const form = readFileSync(join(ROOT, "src/components/dashboard/TaskForm.tsx"), "utf-8");
      expect(form).toContain("titleRef");
      expect(form).toContain("focus()");
    });

    it("should validate title as required with error display", () => {
      const form = readFileSync(join(ROOT, "src/components/dashboard/TaskForm.tsx"), "utf-8");
      expect(form).toContain("Title is required");
      expect(form).toContain("titleError");
      expect(form).toContain("border-red-500");
    });

    it("should support Escape to cancel and Cmd+Enter to save", () => {
      const form = readFileSync(join(ROOT, "src/components/dashboard/TaskForm.tsx"), "utf-8");
      expect(form).toContain("Escape");
      expect(form).toContain("metaKey");
      expect(form).toContain("Enter");
    });

    it("should have collapsible description", () => {
      const form = readFileSync(join(ROOT, "src/components/dashboard/TaskForm.tsx"), "utf-8");
      expect(form).toContain("showDescription");
      expect(form).toContain("Add description");
    });
  });

  describe("EmptyState Component (FR-13)", () => {
    it("should show message and CTA button", () => {
      const empty = readFileSync(join(ROOT, "src/components/dashboard/EmptyState.tsx"), "utf-8");
      expect(empty).toContain("No tasks yet");
      expect(empty).toContain("Create your first task");
      expect(empty).toContain("onCreateTask");
    });

    it("should have green gradient CTA button", () => {
      const empty = readFileSync(join(ROOT, "src/components/dashboard/EmptyState.tsx"), "utf-8");
      expect(empty).toContain("#00D67E");
    });
  });

  describe("Toast Component (FR-4)", () => {
    it("should render toast with undo button", () => {
      const toast = readFileSync(join(ROOT, "src/components/dashboard/Toast.tsx"), "utf-8");
      expect(toast).toContain("Undo");
      expect(toast).toContain("onUndo");
    });

    it("should have progress bar countdown", () => {
      const toast = readFileSync(join(ROOT, "src/components/dashboard/Toast.tsx"), "utf-8");
      expect(toast).toContain("progress");
      expect(toast).toContain("remaining");
    });

    it("should auto-dismiss and support stacking", () => {
      const toast = readFileSync(join(ROOT, "src/components/dashboard/Toast.tsx"), "utf-8");
      expect(toast).toContain("onDismiss");
      expect(toast).toContain("toasts.map");
    });

    it("should be fixed to bottom-right", () => {
      const toast = readFileSync(join(ROOT, "src/components/dashboard/Toast.tsx"), "utf-8");
      expect(toast).toContain("fixed");
      expect(toast).toContain("bottom-4");
      expect(toast).toContain("right-4");
    });

    it("should default to 10 second duration", () => {
      const toast = readFileSync(join(ROOT, "src/components/dashboard/Toast.tsx"), "utf-8");
      expect(toast).toContain("10000");
    });
  });

  describe("Delete with Undo (FR-4)", () => {
    it("should call deleteTaskApi then add toast with restore capability", () => {
      const app = readFileSync(join(ROOT, "src/components/dashboard/DashboardApp.tsx"), "utf-8");
      expect(app).toContain("deleteTaskApi");
      expect(app).toContain("restoreTaskApi");
      expect(app).toContain("Task deleted");
      expect(app).toContain("onUndo");
    });
  });

  describe("API Client", () => {
    it("should export functions for all task operations", () => {
      const client = readFileSync(join(ROOT, "src/lib/api-client.ts"), "utf-8");
      expect(client).toContain("export async function fetchTasks");
      expect(client).toContain("export async function createTaskApi");
      expect(client).toContain("export async function updateTaskApi");
      expect(client).toContain("export async function deleteTaskApi");
      expect(client).toContain("export async function restoreTaskApi");
      expect(client).toContain("export async function reorderTasksApi");
    });

    it("should export functions for all column operations", () => {
      const client = readFileSync(join(ROOT, "src/lib/api-client.ts"), "utf-8");
      expect(client).toContain("export async function fetchColumns");
      expect(client).toContain("export async function createColumnApi");
      expect(client).toContain("export async function updateColumnApi");
      expect(client).toContain("export async function deleteColumnApi");
      expect(client).toContain("export async function reorderColumnsApi");
    });
  });
});
