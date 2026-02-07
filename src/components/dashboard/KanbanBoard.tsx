import { useState } from "react";
import type { Task, Column } from "@/lib/types";
import KanbanColumn from "./KanbanColumn";
import { createColumnApi, updateColumnApi, deleteColumnApi } from "@/lib/api-client";

interface KanbanBoardProps {
  tasks: Task[];
  columns: Column[];
  onCreateTask: (data: { title: string; description?: string; status: string }) => void;
  onUpdateTask: (id: string, data: { title: string; description?: string; status: string }) => void;
  onDeleteTask: (id: string) => void;
  onColumnsChange: (columns: Column[]) => void;
}

export default function KanbanBoard({
  tasks,
  columns,
  onCreateTask,
  onUpdateTask,
  onDeleteTask,
  onColumnsChange,
}: KanbanBoardProps) {
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColumnName, setNewColumnName] = useState("");
  const [error, setError] = useState<string | null>(null);

  function getTasksForColumn(statusValue: string): Task[] {
    return tasks
      .filter((t) => t.status === statusValue)
      .sort((a, b) => a.position - b.position);
  }

  async function handleRenameColumn(id: string, name: string) {
    try {
      const { column } = await updateColumnApi(id, { name });
      onColumnsChange(columns.map((c) => (c.id === id ? column : c)));
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function handleChangeColumnColor(id: string, color: string) {
    try {
      const { column } = await updateColumnApi(id, { color });
      onColumnsChange(columns.map((c) => (c.id === id ? column : c)));
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function handleDeleteColumn(id: string) {
    try {
      await deleteColumnApi(id);
      onColumnsChange(columns.filter((c) => c.id !== id));
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function handleAddColumn() {
    const name = newColumnName.trim();
    if (!name) return;

    const statusValue = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    try {
      const { column } = await createColumnApi({ name, statusValue });
      onColumnsChange([...columns, column]);
      setNewColumnName("");
      setIsAddingColumn(false);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <div>
      {error && (
        <div className="glass p-3 border-red-500/30 text-red-400 text-sm mb-4">{error}</div>
      )}

      <div className="flex gap-4 overflow-x-auto pb-4">
        {columns.map((column) => (
          <KanbanColumn
            key={column.id}
            column={column}
            tasks={getTasksForColumn(column.statusValue)}
            allColumns={columns}
            onCreateTask={onCreateTask}
            onUpdateTask={onUpdateTask}
            onDeleteTask={onDeleteTask}
            onRenameColumn={handleRenameColumn}
            onChangeColumnColor={handleChangeColumnColor}
            onDeleteColumn={handleDeleteColumn}
          />
        ))}

        {/* Add Column */}
        {isAddingColumn ? (
          <div className="min-w-[280px] shrink-0">
            <div className="glass p-3 space-y-2">
              <input
                type="text"
                value={newColumnName}
                onChange={(e) => setNewColumnName(e.target.value)}
                placeholder="Column name..."
                className="w-full bg-transparent border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary outline-none focus:ring-1 focus:ring-green-primary"
                autoFocus
                maxLength={50}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddColumn();
                  if (e.key === "Escape") {
                    setIsAddingColumn(false);
                    setNewColumnName("");
                  }
                }}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleAddColumn}
                  className="px-3 py-1 text-sm font-semibold text-dark-base rounded-lg"
                  style={{ background: "linear-gradient(135deg, #00D67E, #00B468)" }}
                >
                  Add
                </button>
                <button
                  onClick={() => {
                    setIsAddingColumn(false);
                    setNewColumnName("");
                  }}
                  className="px-3 py-1 text-sm text-text-secondary hover:text-text-primary"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsAddingColumn(true)}
            className="min-w-[280px] h-[44px] shrink-0 glass flex items-center justify-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors rounded-xl"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Column
          </button>
        )}
      </div>
    </div>
  );
}
