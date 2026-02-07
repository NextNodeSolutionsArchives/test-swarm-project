import { useState } from "react";
import type { Task, Column } from "@/lib/types";
import TaskForm from "./TaskForm";

interface TaskCardProps {
  task: Task;
  columns: Column[];
  onUpdate: (id: string, data: { title: string; description?: string; status: string }) => void;
  onDelete: (id: string) => void;
}

function getRelativeTime(timestamp: number): string {
  const now = Math.floor(Date.now() / 1000);
  const diff = now - timestamp;

  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(timestamp * 1000).toLocaleDateString();
}

function getColumnColor(status: string, columns: Column[]): string {
  const col = columns.find((c) => c.statusValue === status);
  return col?.color || "#6B7280";
}

function getColumnName(status: string, columns: Column[]): string {
  const col = columns.find((c) => c.statusValue === status);
  return col?.name || status;
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
    <div
      className="glass p-4 cursor-pointer group relative transition-colors hover:bg-surface-hover"
      onClick={() => setIsEditing(true)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
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
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
        </svg>
      </button>

      <h4 className="text-text-primary font-medium pr-8 break-words">{task.title}</h4>

      {task.description && (
        <p className="text-text-secondary text-sm mt-1 line-clamp-2">{task.description}</p>
      )}

      <div className="flex items-center gap-2 mt-3">
        <span
          className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
          style={{ backgroundColor: `${color}20`, color }}
        >
          {getColumnName(task.status, columns)}
        </span>
        <span className="text-xs text-text-secondary">{getRelativeTime(task.updatedAt)}</span>
      </div>
    </div>
  );
}
