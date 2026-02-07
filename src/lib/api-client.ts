/** Client-side API helpers for dashboard with silent token refresh */

import type { Task, Column, CreateTaskInput, UpdateTaskInput, CreateColumnInput, UpdateColumnInput } from "./types";

let isRetry = false;

async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  // Handle 401 with silent token refresh (only one retry to prevent loops)
  if (res.status === 401 && !isRetry) {
    isRetry = true;
    try {
      const refreshRes = await fetch("/api/auth/refresh", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });

      if (refreshRes.ok) {
        // Retry the original request with the new access token
        const retryRes = await fetch(url, {
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          ...options,
        });
        const retryData = await retryRes.json();
        if (!retryRes.ok) throw new Error(retryData.error || `API error ${retryRes.status}`);
        return retryData as T;
      } else {
        // Refresh failed — session expired, redirect to /auth
        window.location.href = "/auth";
        throw new Error("Session expired — please log in again");
      }
    } finally {
      isRetry = false;
    }
  }

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
