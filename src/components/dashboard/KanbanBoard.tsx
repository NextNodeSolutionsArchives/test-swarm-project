import { useState, useCallback } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from "@dnd-kit/core";
import { Plus } from "lucide-react";
import type { Task, Column } from "@/lib/types";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Card from "@/components/ui/Card";
import KanbanColumn from "./KanbanColumn";
import TaskCard from "./TaskCard";
import { createColumnApi, updateColumnApi, deleteColumnApi, reorderTasksApi } from "@/lib/api-client";

interface KanbanBoardProps {
  tasks: Task[];
  columns: Column[];
  onCreateTask: (data: { title: string; description?: string; status: string }) => void;
  onUpdateTask: (id: string, data: { title: string; description?: string; status: string }) => void;
  onDeleteTask: (id: string) => void;
  onColumnsChange: (columns: Column[]) => void;
  onTasksChange: (tasks: Task[]) => void;
}

export default function KanbanBoard({
  tasks,
  columns,
  onCreateTask,
  onUpdateTask,
  onDeleteTask,
  onColumnsChange,
  onTasksChange,
}: KanbanBoardProps) {
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColumnName, setNewColumnName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } })
  );

  function getTasksForColumn(statusValue: string): Task[] {
    return tasks
      .filter((t) => t.status === statusValue)
      .sort((a, b) => a.position - b.position);
  }

  function handleDragStart(event: DragStartEvent) {
    const { active } = event;
    const task = tasks.find((t) => t.id === active.id);
    if (task) setActiveTask(task);
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeTaskObj = tasks.find((t) => t.id === activeId);
    if (!activeTaskObj) return;

    let targetStatus: string | null = null;
    if (overId.startsWith("column-")) {
      targetStatus = overId.replace("column-", "");
    } else {
      const overTask = tasks.find((t) => t.id === overId);
      if (overTask) targetStatus = overTask.status;
    }

    if (targetStatus && targetStatus !== activeTaskObj.status) {
      onTasksChange(
        tasks.map((t) =>
          t.id === activeId ? { ...t, status: targetStatus! } : t
        )
      );
    }
  }

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      setActiveTask(null);
      const { active, over } = event;
      if (!over) return;

      const activeId = active.id as string;
      const overId = over.id as string;

      const activeTaskObj = tasks.find((t) => t.id === activeId);
      if (!activeTaskObj) return;

      let targetStatus = activeTaskObj.status;
      if (overId.startsWith("column-")) {
        targetStatus = overId.replace("column-", "");
      } else {
        const overTask = tasks.find((t) => t.id === overId);
        if (overTask) targetStatus = overTask.status;
      }

      const columnTasks = tasks
        .filter((t) => t.status === targetStatus && t.id !== activeId)
        .sort((a, b) => a.position - b.position);

      let insertIndex = columnTasks.length;
      if (!overId.startsWith("column-")) {
        const overIndex = columnTasks.findIndex((t) => t.id === overId);
        if (overIndex >= 0) insertIndex = overIndex;
      }

      const reordered = [...columnTasks];
      reordered.splice(insertIndex, 0, { ...activeTaskObj, status: targetStatus });
      const newIds = reordered.map((t) => t.id);

      const updatedTasks = tasks.map((t) => {
        if (t.id === activeId) {
          return { ...t, status: targetStatus, position: insertIndex };
        }
        const idx = newIds.indexOf(t.id);
        if (idx >= 0 && t.status === targetStatus) {
          return { ...t, position: idx };
        }
        return t;
      });
      onTasksChange(updatedTasks);

      try {
        await reorderTasksApi(newIds, targetStatus);
      } catch (err) {
        setError((err as Error).message);
      }
    },
    [tasks, onTasksChange]
  );

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

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4 kanban-scroll">
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
              <Card padding="sm" className="space-y-2">
                <Input
                  type="text"
                  value={newColumnName}
                  onChange={(e) => setNewColumnName(e.target.value)}
                  placeholder="Column name..."
                  maxLength={50}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAddColumn();
                    if (e.key === "Escape") {
                      setIsAddingColumn(false);
                      setNewColumnName("");
                    }
                  }}
                  autoFocus
                />
                <div className="flex gap-2">
                  <Button variant="primary" size="sm" onClick={handleAddColumn}>
                    Add
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setIsAddingColumn(false);
                      setNewColumnName("");
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </Card>
            </div>
          ) : (
            <button
              onClick={() => setIsAddingColumn(true)}
              className="min-w-[280px] h-[44px] shrink-0 glass flex items-center justify-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors rounded-xl"
            >
              <Plus size={16} />
              Add Column
            </button>
          )}
        </div>

        <DragOverlay>
          {activeTask ? (
            <div className="opacity-80 rotate-2">
              <TaskCard
                task={activeTask}
                columns={columns}
                onUpdate={() => {}}
                onDelete={() => {}}
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
