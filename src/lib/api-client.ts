/** Client-side API helpers for dashboard */

import type { Task, Column, CreateTaskInput, UpdateTaskInput, CreateColumnInput, UpdateColumnInput } from "./types";

async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `API error ${res.status}`);
  return data as T;
}

// Tasks
export async function fetchTasks(status?: string): Promise<{ tasks: Task[] }> {
  const params = status ? `?status=${encodeURIComponent(status)}` : "";
  return apiFetch(`/api/tasks${params}`);
}

export async function createTaskApi(input: CreateTaskInput): Promise<{ task: Task }> {
  return apiFetch("/api/tasks", { method: "POST", body: JSON.stringify(input) });
}

export async function updateTaskApi(id: string, input: UpdateTaskInput): Promise<{ task: Task }> {
  return apiFetch(`/api/tasks/${id}`, { method: "PUT", body: JSON.stringify(input) });
}

export async function deleteTaskApi(id: string): Promise<{ deletedAt: number }> {
  return apiFetch(`/api/tasks/${id}`, { method: "DELETE" });
}

export async function restoreTaskApi(id: string): Promise<{ task: Task }> {
  return apiFetch(`/api/tasks/${id}/restore`, { method: "POST" });
}

export async function reorderTasksApi(taskIds: string[], status?: string): Promise<{ success: boolean }> {
  return apiFetch("/api/tasks/reorder", {
    method: "POST",
    body: JSON.stringify({ taskIds, status }),
  });
}

// Columns
export async function fetchColumns(): Promise<{ columns: Column[] }> {
  return apiFetch("/api/columns");
}

export async function createColumnApi(input: CreateColumnInput): Promise<{ column: Column }> {
  return apiFetch("/api/columns", { method: "POST", body: JSON.stringify(input) });
}

export async function updateColumnApi(id: string, input: UpdateColumnInput): Promise<{ column: Column }> {
  return apiFetch(`/api/columns/${id}`, { method: "PUT", body: JSON.stringify(input) });
}

export async function deleteColumnApi(id: string): Promise<{ success: boolean }> {
  return apiFetch(`/api/columns/${id}`, { method: "DELETE" });
}

export async function reorderColumnsApi(columnIds: string[]): Promise<{ success: boolean }> {
  return apiFetch("/api/columns/reorder", {
    method: "POST",
    body: JSON.stringify({ columnIds }),
  });
}
