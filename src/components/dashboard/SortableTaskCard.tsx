import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Task, Column } from "@/lib/types";
import TaskCard from "./TaskCard";

interface SortableTaskCardProps {
  task: Task;
  columns: Column[];
  onUpdate: (id: string, data: { title: string; description?: string; status: string }) => void;
  onDelete: (id: string) => void;
}

export default function SortableTaskCard({
  task,
  columns,
  onUpdate,
  onDelete,
}: SortableTaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: { type: "task", task },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    touchAction: "none",
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TaskCard
        task={task}
        columns={columns}
        onUpdate={onUpdate}
        onDelete={onDelete}
      />
    </div>
  );
}
