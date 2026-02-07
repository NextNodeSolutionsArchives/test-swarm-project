import { useState, useCallback } from "react";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { arrayMove } from "@dnd-kit/sortable";
import type { Task, Column } from "@/lib/types";
import SortableTaskCard from "./SortableTaskCard";
import TaskCard from "./TaskCard";
import { reorderTasksApi } from "@/lib/api-client";

interface SortableListViewProps {
  tasks: Task[];
  columns: Column[];
  onUpdateTask: (id: string, data: { title: string; description?: string; status: string }) => void;
  onDeleteTask: (id: string) => void;
  onTasksChange: (tasks: Task[]) => void;
}

export default function SortableListView({
  tasks,
  columns,
  onUpdateTask,
  onDeleteTask,
  onTasksChange,
}: SortableListViewProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } })
  );

  function handleDragStart(event: DragStartEvent) {
    const task = tasks.find((t) => t.id === event.active.id);
    if (task) setActiveTask(task);
  }

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      setActiveTask(null);
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const oldIndex = tasks.findIndex((t) => t.id === active.id);
      const newIndex = tasks.findIndex((t) => t.id === over.id);
      if (oldIndex < 0 || newIndex < 0) return;

      const reordered = arrayMove(tasks, oldIndex, newIndex).map((t, i) => ({
        ...t,
        position: i,
      }));

      onTasksChange(reordered);

      try {
        await reorderTasksApi(reordered.map((t) => t.id));
      } catch {
        // Revert on error — reload will fix
      }
    },
    [tasks, onTasksChange]
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2">
          {tasks.map((task) => (
            <SortableTaskCard
              key={task.id}
              task={task}
              columns={columns}
              onUpdate={onUpdateTask}
              onDelete={onDeleteTask}
            />
          ))}
        </div>
      </SortableContext>

      <DragOverlay>
        {activeTask ? (
          <div className="opacity-80 rotate-1">
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
  );
}
