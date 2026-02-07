import { useState } from "react";
import { Trash2 } from "lucide-react";
import type { Task, Column } from "@/lib/types";
import Card from "@/components/ui/Card";
import StatusBadge from "@/components/ui/StatusBadge";
import { getRelativeTime } from "@/utils/date";
import { getColumnColor, getColumnName } from "@/utils/column-helpers";
import TaskForm from "./TaskForm";

interface TaskCardProps {
  task: Task;
  columns: Column[];
  onUpdate: (id: string, data: { title: string; description?: string; status: string }) => void;
  onDelete: (id: string) => void;
}

export default function TaskCard({ task, columns, onUpdate, onDelete }: TaskCardProps) {
  const [isEditing, setIsEditing] = useState(false);

  if (isEditing) {
    return (
      <TaskForm
        columns={columns}
        initialTitle={task.title}
        initialDescription={task.description || ""}
        initialStatus={task.status}
        onSave={(data) => {
          onUpdate(task.id, data);
          setIsEditing(false);
        }}
        onCancel={() => setIsEditing(false)}
        submitLabel="Update"
      />
    );
  }

  const color = getColumnColor(task.status, columns);

  return (
    <Card
      padding="sm"
      className="cursor-pointer group relative transition-colors hover:bg-surface-hover"
      onClick={() => setIsEditing(true)}
      role="button"
      tabIndex={0}
      onKeyDown={(e: React.KeyboardEvent) => {
        if (e.key === "Enter") setIsEditing(true);
      }}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(task.id);
        }}
        className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-surface text-text-secondary hover:text-red-400"
        aria-label="Delete task"
      >
        <Trash2 size={16} />
      </button>

      <h4 className="text-text-primary font-medium pr-8 break-words">{task.title}</h4>

      {task.description && (
        <p className="text-text-secondary text-sm mt-1 line-clamp-2">{task.description}</p>
      )}

      <div className="flex items-center gap-2 mt-3">
        <StatusBadge label={getColumnName(task.status, columns)} color={color} />
        <span className="text-xs text-text-secondary">{getRelativeTime(task.updatedAt)}</span>
      </div>
    </Card>
  );
}
