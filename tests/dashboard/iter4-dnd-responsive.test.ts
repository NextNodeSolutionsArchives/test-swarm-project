import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "../..");

describe("Iteration 4 — Drag-and-Drop & Responsive Layout", () => {
  describe("File Structure", () => {
    const expectedFiles = [
      "src/components/dashboard/SortableTaskCard.tsx",
      "src/components/dashboard/SortableListView.tsx",
    ];

    for (const file of expectedFiles) {
      it(`should have ${file}`, () => {
        expect(existsSync(join(ROOT, file))).toBe(true);
      });
    }
  });

  describe("SortableTaskCard (DnD wrapper)", () => {
    it("should use useSortable from @dnd-kit/sortable", () => {
      const card = readFileSync(join(ROOT, "src/components/dashboard/SortableTaskCard.tsx"), "utf-8");
      expect(card).toContain("useSortable");
      expect(card).toContain("@dnd-kit/sortable");
    });

    it("should pass transform and transition styles", () => {
      const card = readFileSync(join(ROOT, "src/components/dashboard/SortableTaskCard.tsx"), "utf-8");
      expect(card).toContain("CSS.Transform");
      expect(card).toContain("transform");
      expect(card).toContain("transition");
    });

    it("should reduce opacity while dragging", () => {
      const card = readFileSync(join(ROOT, "src/components/dashboard/SortableTaskCard.tsx"), "utf-8");
      expect(card).toContain("isDragging");
      expect(card).toContain("opacity");
    });

    it("should set touchAction none for mobile DnD", () => {
      const card = readFileSync(join(ROOT, "src/components/dashboard/SortableTaskCard.tsx"), "utf-8");
      expect(card).toContain("touchAction");
    });
  });

  describe("Kanban Board DnD (FR-8)", () => {
    it("should use DndContext with sensors", () => {
      const board = readFileSync(join(ROOT, "src/components/dashboard/KanbanBoard.tsx"), "utf-8");
      expect(board).toContain("DndContext");
      expect(board).toContain("useSensors");
      expect(board).toContain("PointerSensor");
    });

    it("should use TouchSensor for mobile drag support", () => {
      const board = readFileSync(join(ROOT, "src/components/dashboard/KanbanBoard.tsx"), "utf-8");
      expect(board).toContain("TouchSensor");
      expect(board).toContain("delay: 200");
    });

    it("should handle drag start, over, and end events", () => {
      const board = readFileSync(join(ROOT, "src/components/dashboard/KanbanBoard.tsx"), "utf-8");
      expect(board).toContain("handleDragStart");
      expect(board).toContain("handleDragOver");
      expect(board).toContain("handleDragEnd");
    });

    it("should have a DragOverlay for visual feedback", () => {
      const board = readFileSync(join(ROOT, "src/components/dashboard/KanbanBoard.tsx"), "utf-8");
      expect(board).toContain("DragOverlay");
      expect(board).toContain("activeTask");
    });

    it("should call reorderTasksApi on drag end", () => {
      const board = readFileSync(join(ROOT, "src/components/dashboard/KanbanBoard.tsx"), "utf-8");
      expect(board).toContain("reorderTasksApi");
    });

    it("should use closestCorners collision detection", () => {
      const board = readFileSync(join(ROOT, "src/components/dashboard/KanbanBoard.tsx"), "utf-8");
      expect(board).toContain("closestCorners");
    });
  });

  describe("KanbanColumn DnD Integration", () => {
    it("should use useDroppable for column drop zones", () => {
      const col = readFileSync(join(ROOT, "src/components/dashboard/KanbanColumn.tsx"), "utf-8");
      expect(col).toContain("useDroppable");
      expect(col).toContain("@dnd-kit/core");
    });

    it("should use SortableContext for within-column sorting", () => {
      const col = readFileSync(join(ROOT, "src/components/dashboard/KanbanColumn.tsx"), "utf-8");
      expect(col).toContain("SortableContext");
      expect(col).toContain("verticalListSortingStrategy");
    });

    it("should highlight drop zone on drag over", () => {
      const col = readFileSync(join(ROOT, "src/components/dashboard/KanbanColumn.tsx"), "utf-8");
      expect(col).toContain("isOver");
      expect(col).toContain("ring-1");
    });

    it("should render SortableTaskCard instead of plain TaskCard", () => {
      const col = readFileSync(join(ROOT, "src/components/dashboard/KanbanColumn.tsx"), "utf-8");
      expect(col).toContain("SortableTaskCard");
    });
  });

  describe("List View DnD (FR-9)", () => {
    it("should use DndContext with sortable context", () => {
      const list = readFileSync(join(ROOT, "src/components/dashboard/SortableListView.tsx"), "utf-8");
      expect(list).toContain("DndContext");
      expect(list).toContain("SortableContext");
      expect(list).toContain("verticalListSortingStrategy");
    });

    it("should use arrayMove for reordering", () => {
      const list = readFileSync(join(ROOT, "src/components/dashboard/SortableListView.tsx"), "utf-8");
      expect(list).toContain("arrayMove");
    });

    it("should call reorderTasksApi on drag end", () => {
      const list = readFileSync(join(ROOT, "src/components/dashboard/SortableListView.tsx"), "utf-8");
      expect(list).toContain("reorderTasksApi");
    });

    it("should have DragOverlay for visual feedback", () => {
      const list = readFileSync(join(ROOT, "src/components/dashboard/SortableListView.tsx"), "utf-8");
      expect(list).toContain("DragOverlay");
    });

    it("should support touch sensor for mobile", () => {
      const list = readFileSync(join(ROOT, "src/components/dashboard/SortableListView.tsx"), "utf-8");
      expect(list).toContain("TouchSensor");
    });
  });

  describe("DashboardApp Integration", () => {
    it("should use SortableListView for list mode", () => {
      const app = readFileSync(join(ROOT, "src/components/dashboard/DashboardApp.tsx"), "utf-8");
      expect(app).toContain("SortableListView");
    });

    it("should pass onTasksChange to both views", () => {
      const app = readFileSync(join(ROOT, "src/components/dashboard/DashboardApp.tsx"), "utf-8");
      expect(app).toContain("onTasksChange");
    });
  });

  describe("Responsive Layout (FR-12)", () => {
    it("should have responsive CSS for kanban scroll", () => {
      const css = readFileSync(join(ROOT, "src/styles/global.css"), "utf-8");
      expect(css).toContain("kanban-scroll");
      expect(css).toContain("scroll-snap");
    });

    it("should have mobile breakpoint (<640px) with stacked layout", () => {
      const css = readFileSync(join(ROOT, "src/styles/global.css"), "utf-8");
      expect(css).toContain("max-width: 639px");
      expect(css).toContain("flex-direction: column");
    });

    it("should have tablet breakpoint (640-1024px) with 2-column kanban", () => {
      const css = readFileSync(join(ROOT, "src/styles/global.css"), "utf-8");
      expect(css).toContain("min-width: 640px");
      expect(css).toContain("max-width: 1024px");
      expect(css).toContain("50%");
    });

    it("should have desktop breakpoint (>1024px) with full kanban", () => {
      const css = readFileSync(join(ROOT, "src/styles/global.css"), "utf-8");
      expect(css).toContain("min-width: 1025px");
    });

    it("should have toast slide-in animation", () => {
      const css = readFileSync(join(ROOT, "src/styles/global.css"), "utf-8");
      expect(css).toContain("@keyframes slide-in");
      expect(css).toContain("animate-slide-in");
    });
  });
});
