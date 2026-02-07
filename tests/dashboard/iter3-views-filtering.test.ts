import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "../..");

describe("Iteration 3 — Views, Filtering, Kanban Display", () => {
  describe("File Structure", () => {
    const expectedFiles = [
      "src/components/dashboard/KanbanBoard.tsx",
      "src/components/dashboard/KanbanColumn.tsx",
    ];

    for (const file of expectedFiles) {
      it(`should have ${file}`, () => {
        expect(existsSync(join(ROOT, file))).toBe(true);
      });
    }
  });

  describe("KanbanBoard Component (FR-8 display)", () => {
    it("should render columns side by side with horizontal scroll", () => {
      const board = readFileSync(join(ROOT, "src/components/dashboard/KanbanBoard.tsx"), "utf-8");
      expect(board).toContain("overflow-x-auto");
      expect(board).toContain("flex");
      expect(board).toContain("gap-4");
    });

    it("should group tasks by column status", () => {
      const board = readFileSync(join(ROOT, "src/components/dashboard/KanbanBoard.tsx"), "utf-8");
      expect(board).toContain("getTasksForColumn");
      expect(board).toContain("statusValue");
    });

    it("should have an Add Column button at the end", () => {
      const board = readFileSync(join(ROOT, "src/components/dashboard/KanbanBoard.tsx"), "utf-8");
      expect(board).toContain("Add Column");
      expect(board).toContain("isAddingColumn");
    });

    it("should support creating new columns (FR-10)", () => {
      const board = readFileSync(join(ROOT, "src/components/dashboard/KanbanBoard.tsx"), "utf-8");
      expect(board).toContain("createColumnApi");
      expect(board).toContain("handleAddColumn");
    });

    it("should support renaming and deleting columns (FR-10)", () => {
      const board = readFileSync(join(ROOT, "src/components/dashboard/KanbanBoard.tsx"), "utf-8");
      expect(board).toContain("handleRenameColumn");
      expect(board).toContain("handleDeleteColumn");
      expect(board).toContain("handleChangeColumnColor");
    });
  });

  describe("KanbanColumn Component", () => {
    it("should display column header with name, task count, and color indicator", () => {
      const col = readFileSync(join(ROOT, "src/components/dashboard/KanbanColumn.tsx"), "utf-8");
      expect(col).toContain("column.name");
      expect(col).toContain("tasks.length");
      expect(col).toContain("column.color");
    });

    it("should support double-click to edit column name", () => {
      const col = readFileSync(join(ROOT, "src/components/dashboard/KanbanColumn.tsx"), "utf-8");
      expect(col).toContain("onDoubleClick");
      expect(col).toContain("isEditingName");
    });

    it("should have plus button to add task in column", () => {
      const col = readFileSync(join(ROOT, "src/components/dashboard/KanbanColumn.tsx"), "utf-8");
      expect(col).toContain("isAdding");
      expect(col).toContain("TaskForm");
    });

    it("should have three-dot menu with rename, color, delete options", () => {
      const col = readFileSync(join(ROOT, "src/components/dashboard/KanbanColumn.tsx"), "utf-8");
      expect(col).toContain("showMenu");
      expect(col).toContain("Rename");
      expect(col).toContain("Change color");
      expect(col).toContain("Delete");
    });

    it("should have color picker with presets", () => {
      const col = readFileSync(join(ROOT, "src/components/dashboard/KanbanColumn.tsx"), "utf-8");
      expect(col).toContain("showColorPicker");
      expect(col).toContain("COLOR_PRESETS");
      expect(col).toContain("#3B82F6");
    });

    it("should render task cards for the column", () => {
      const col = readFileSync(join(ROOT, "src/components/dashboard/KanbanColumn.tsx"), "utf-8");
      expect(col).toContain("TaskCard");
      expect(col).toContain("tasks.map");
    });
  });

  describe("View Toggle Integration (FR-7)", () => {
    it("DashboardApp should conditionally render KanbanBoard or list", () => {
      const app = readFileSync(join(ROOT, "src/components/dashboard/DashboardApp.tsx"), "utf-8");
      expect(app).toContain("KanbanBoard");
      expect(app).toContain('viewMode === "kanban"');
    });
  });

  describe("Filter Tabs (FR-5)", () => {
    it("should render All tab plus one per column", () => {
      const tabs = readFileSync(join(ROOT, "src/components/dashboard/FilterTabs.tsx"), "utf-8");
      expect(tabs).toContain("All");
      expect(tabs).toContain("columns.map");
      expect(tabs).toContain("activeFilter");
    });

    it("should highlight active filter", () => {
      const tabs = readFileSync(join(ROOT, "src/components/dashboard/FilterTabs.tsx"), "utf-8");
      expect(tabs).toContain("activeFilter === null");
      expect(tabs).toContain("activeFilter === col.statusValue");
    });

    it("should use column color for active status tabs", () => {
      const tabs = readFileSync(join(ROOT, "src/components/dashboard/FilterTabs.tsx"), "utf-8");
      expect(tabs).toContain("col.color");
      expect(tabs).toContain("backgroundColor");
    });
  });

  describe("Search (FR-6)", () => {
    it("Toolbar should have search input", () => {
      const toolbar = readFileSync(join(ROOT, "src/components/dashboard/Toolbar.tsx"), "utf-8");
      expect(toolbar).toContain("searchQuery");
      expect(toolbar).toContain("onSearchChange");
      expect(toolbar).toContain("Search tasks");
    });

    it("DashboardApp should filter by search query case-insensitively", () => {
      const app = readFileSync(join(ROOT, "src/components/dashboard/DashboardApp.tsx"), "utf-8");
      expect(app).toContain("toLowerCase");
      expect(app).toContain("includes(query)");
    });
  });

  describe("View Toggle UI (FR-7)", () => {
    it("Toolbar should have list and kanban toggle buttons", () => {
      const toolbar = readFileSync(join(ROOT, "src/components/dashboard/Toolbar.tsx"), "utf-8");
      expect(toolbar).toContain("List view");
      expect(toolbar).toContain("Kanban view");
      expect(toolbar).toContain("onViewModeChange");
    });

    it("should visually indicate active view mode", () => {
      const toolbar = readFileSync(join(ROOT, "src/components/dashboard/Toolbar.tsx"), "utf-8");
      expect(toolbar).toContain('viewMode === "list"');
      expect(toolbar).toContain('viewMode === "kanban"');
      expect(toolbar).toContain("bg-green-primary");
    });
  });
});
