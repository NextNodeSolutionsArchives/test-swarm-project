/** Shared TypeScript types for the Dashboard feature */

export interface Column {
  id: string;
  userId: string;
  name: string;
  statusValue: string;
  position: number;
  color: string | null;
  createdAt: number;
}

export interface Task {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  status: string;
  position: number;
  createdAt: number;
  updatedAt: number;
  deletedAt: number | null;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  status?: string;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  status?: string;
  position?: number;
}

export interface CreateColumnInput {
  name: string;
  statusValue: string;
  color?: string;
}

export interface UpdateColumnInput {
  name?: string;
  statusValue?: string;
  color?: string;
  position?: number;
}

export interface ReorderInput {
  taskIds?: string[];
  columnIds?: string[];
  status?: string;
}

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
}
