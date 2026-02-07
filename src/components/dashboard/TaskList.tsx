import { useState, useEffect, useCallback } from "react";
import type { Task, Column } from "@/lib/types";
import { fetchTasks, fetchColumns, createTaskApi, updateTaskApi, deleteTaskApi, restoreTaskApi } from "@/lib/api-client";
import Spinner from "@/components/ui/Spinner";
import TaskCard from "./TaskCard";
import TaskForm from "./TaskForm";
import EmptyState from "./EmptyState";
import Toast, { type ToastItem } from "./Toast";

export default function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [columns, setColumns] = useState<Column[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setError(null);
      const [tasksRes, colsRes] = await Promise.all([fetchTasks(), fetchColumns()]);
      setTasks(tasksRes.tasks);
      setColumns(colsRes.columns);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleCreate(data: { title: string; description?: string; status: string }) {
    try {
      const { task } = await createTaskApi(data);
      setTasks((prev) => [...prev, task]);
      setIsCreating(false);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function handleUpdate(id: string, data: { title: string; description?: string; status: string }) {
    try {
      const { task } = await updateTaskApi(id, data);
      setTasks((prev) => prev.map((t) => (t.id === id ? task : t)));
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteTaskApi(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));

      const toastId = `delete-${id}-${Date.now()}`;
      setToasts((prev) => [
        ...prev,
        {
          id: toastId,
          message: "Task deleted",
          onUndo: async () => {
            try {
              const { task } = await restoreTaskApi(id);
              setTasks((prev) => [...prev, task].sort((a, b) => a.position - b.position));
            } catch {
              // Task may have been permanently deleted
            }
          },
        },
      ]);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  function dismissToast(id: string) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="md" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="glass p-3 border-red-500/30 text-red-400 text-sm">{error}</div>
      )}

      {isCreating && (
        <TaskForm
          columns={columns}
          onSave={handleCreate}
          onCancel={() => setIsCreating(false)}
          submitLabel="Create"
        />
      )}

      {!isCreating && tasks.length === 0 ? (
        <EmptyState onCreateTask={() => setIsCreating(true)} />
      ) : (
        <div className="space-y-2">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              columns={columns}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <Toast toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
