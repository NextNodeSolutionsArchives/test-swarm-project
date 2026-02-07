import { useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import type { Task, Column } from "@/lib/types";
import SortableTaskCard from "./SortableTaskCard";
import TaskForm from "./TaskForm";

interface KanbanColumnProps {
  column: Column;
  tasks: Task[];
  allColumns: Column[];
  onCreateTask: (data: { title: string; description?: string; status: string }) => void;
  onUpdateTask: (id: string, data: { title: string; description?: string; status: string }) => void;
  onDeleteTask: (id: string) => void;
  onRenameColumn: (id: string, name: string) => void;
  onChangeColumnColor: (id: string, color: string) => void;
  onDeleteColumn: (id: string) => void;
}

const COLOR_PRESETS = [
  "#3B82F6", "#F59E0B", "#00D67E", "#EF4444", "#8B5CF6",
  "#EC4899", "#14B8A6", "#F97316", "#06B6D4", "#6366F1",
];

export default function KanbanColumn({
  column,
  tasks,
  allColumns,
  onCreateTask,
  onUpdateTask,
  onDeleteTask,
  onRenameColumn,
  onChangeColumnColor,
  onDeleteColumn,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `column-${column.statusValue}`,
    data: { type: "column", statusValue: column.statusValue },
  });

  const [isAdding, setIsAdding] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState(column.name);
  const [showMenu, setShowMenu] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);

  function handleNameSubmit() {
    const trimmed = editName.trim();
    if (trimmed && trimmed !== column.name) {
      onRenameColumn(column.id, trimmed);
    }
    setIsEditingName(false);
  }

  return (
    <div className="flex flex-col min-w-[280px] max-w-[320px] w-full shrink-0">
      {/* Column Header */}
      <div className="flex items-center gap-2 px-2 py-2 mb-2">
        <div
          className="w-3 h-3 rounded-full shrink-0"
          style={{ backgroundColor: column.color || "#6B7280" }}
        />

        {isEditingName ? (
          <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onBlur={handleNameSubmit}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleNameSubmit();
              if (e.key === "Escape") {
                setEditName(column.name);
                setIsEditingName(false);
              }
            }}
            className="bg-transparent border border-border rounded px-1 py-0.5 text-sm font-semibold text-text-primary outline-none focus:ring-1 focus:ring-green-primary flex-1"
            autoFocus
            maxLength={50}
          />
        ) : (
          <span
            className="text-sm font-semibold text-text-primary cursor-pointer flex-1"
            onDoubleClick={() => {
              setEditName(column.name);
              setIsEditingName(true);
            }}
          >
            {column.name}
          </span>
        )}

        <span className="text-xs text-text-secondary">{tasks.length}</span>

        <button
          onClick={() => setIsAdding(true)}
          className="text-text-secondary hover:text-green-primary p-1"
          aria-label="Add task"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>

        {/* Menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="text-text-secondary hover:text-text-primary p-1"
            aria-label="Column menu"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="5" r="2" />
              <circle cx="12" cy="12" r="2" />
              <circle cx="12" cy="19" r="2" />
            </svg>
          </button>

          {showMenu && (
            <div className="absolute right-0 top-full mt-1 glass rounded-lg py-1 min-w-[140px] z-20">
              <button
                onClick={() => {
                  setEditName(column.name);
                  setIsEditingName(true);
                  setShowMenu(false);
                }}
                className="w-full text-left px-3 py-1.5 text-sm text-text-primary hover:bg-surface-hover"
              >
                Rename
              </button>
              <button
                onClick={() => {
                  setShowColorPicker(true);
                  setShowMenu(false);
                }}
                className="w-full text-left px-3 py-1.5 text-sm text-text-primary hover:bg-surface-hover"
              >
                Change color
              </button>
              <button
                onClick={() => {
                  onDeleteColumn(column.id);
                  setShowMenu(false);
                }}
                className="w-full text-left px-3 py-1.5 text-sm text-red-400 hover:bg-surface-hover"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Color Picker */}
      {showColorPicker && (
        <div className="glass p-2 mb-2 flex flex-wrap gap-2">
          {COLOR_PRESETS.map((color) => (
            <button
              key={color}
              onClick={() => {
                onChangeColumnColor(column.id, color);
                setShowColorPicker(false);
              }}
              className="w-6 h-6 rounded-full border-2 hover:scale-110 transition-transform"
              style={{
                backgroundColor: color,
                borderColor: color === column.color ? "#fff" : "transparent",
              }}
              aria-label={`Color ${color}`}
            />
          ))}
        </div>
      )}

      {/* Add Task Form */}
      {isAdding && (
        <div className="mb-2">
          <TaskForm
            columns={allColumns}
            initialStatus={column.statusValue}
            onSave={(data) => {
              onCreateTask({ ...data, status: column.statusValue });
              setIsAdding(false);
            }}
            onCancel={() => setIsAdding(false)}
            submitLabel="Create"
          />
        </div>
      )}

      {/* Task Cards — droppable + sortable */}
      <div
        ref={setNodeRef}
        className={`space-y-2 flex-1 min-h-[100px] rounded-lg p-1 transition-colors ${
          isOver ? "bg-green-primary/10 ring-1 ring-green-primary/30" : ""
        }`}
      >
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <SortableTaskCard
              key={task.id}
              task={task}
              columns={allColumns}
              onUpdate={onUpdateTask}
              onDelete={onDeleteTask}
            />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}
