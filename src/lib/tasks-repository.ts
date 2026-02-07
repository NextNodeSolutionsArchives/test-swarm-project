import { getDb } from "./db";
import type { Task } from "./types";
import { v4 as uuidv4 } from "uuid";

interface TaskRow {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  status: string;
  position: number;
  created_at: number;
  updated_at: number;
  deleted_at: number | null;
}

function rowToTask(row: TaskRow): Task {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    description: row.description,
    status: row.status,
    position: row.position,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at,
  };
}

export function getTasks(userId: string, status?: string): Task[] {
  const db = getDb();
  let query = "SELECT * FROM tasks WHERE user_id = ? AND deleted_at IS NULL";
  const params: unknown[] = [userId];

  if (status) {
    query += " AND status = ?";
    params.push(status);
  }

  query += " ORDER BY position ASC";
  const rows = db.prepare(query).all(...params) as TaskRow[];
  return rows.map(rowToTask);
}

export function getTaskById(id: string, userId: string): Task | null {
  const db = getDb();
  const row = db
    .prepare("SELECT * FROM tasks WHERE id = ? AND user_id = ?")
    .get(id, userId) as TaskRow | undefined;
  return row ? rowToTask(row) : null;
}

export function createTask(
  userId: string,
  title: string,
  description: string | null,
  status: string
): Task {
  const db = getDb();
  const now = Math.floor(Date.now() / 1000);

  // Get max position for the target status
  const maxPos = db
    .prepare(
      "SELECT MAX(position) as maxPos FROM tasks WHERE user_id = ? AND status = ? AND deleted_at IS NULL"
    )
    .get(userId, status) as { maxPos: number | null };

  const id = uuidv4();
  const position = (maxPos.maxPos ?? -1) + 1;

  db.prepare(
    "INSERT INTO tasks (id, user_id, title, description, status, position, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
  ).run(id, userId, title, description, status, position, now, now);

  return {
    id,
    userId,
    title,
    description,
    status,
    position,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
  };
}

export function updateTask(
  id: string,
  userId: string,
  updates: { title?: string; description?: string; status?: string; position?: number }
): Task | null {
  const db = getDb();
  const task = getTaskById(id, userId);
  if (!task) return null;
  if (task.deletedAt) return null;

  const now = Math.floor(Date.now() / 1000);
  const newTitle = updates.title ?? task.title;
  const newDescription =
    updates.description !== undefined ? updates.description : task.description;
  const newStatus = updates.status ?? task.status;
  const newPosition = updates.position ?? task.position;

  db.prepare(
    "UPDATE tasks SET title = ?, description = ?, status = ?, position = ?, updated_at = ? WHERE id = ? AND user_id = ?"
  ).run(newTitle, newDescription, newStatus, newPosition, now, id, userId);

  return {
    ...task,
    title: newTitle,
    description: newDescription,
    status: newStatus,
    position: newPosition,
    updatedAt: now,
  };
}

export function softDeleteTask(id: string, userId: string): { deletedAt: number } | null {
  const db = getDb();
  const task = getTaskById(id, userId);
  if (!task) return null;
  if (task.deletedAt) return null;

  const now = Math.floor(Date.now() / 1000);
  db.prepare("UPDATE tasks SET deleted_at = ? WHERE id = ? AND user_id = ?").run(now, id, userId);
  return { deletedAt: now };
}

export function restoreTask(id: string, userId: string): Task | null {
  const db = getDb();
  const row = db
    .prepare("SELECT * FROM tasks WHERE id = ? AND user_id = ?")
    .get(id, userId) as TaskRow | undefined;
  if (!row) return null;
  if (!row.deleted_at) return null;

  const now = Math.floor(Date.now() / 1000);
  db.prepare("UPDATE tasks SET deleted_at = NULL, updated_at = ? WHERE id = ? AND user_id = ?").run(
    now,
    id,
    userId
  );

  return rowToTask({ ...row, deleted_at: null, updated_at: now });
}

export function reorderTasks(userId: string, taskIds: string[], status?: string): void {
  const db = getDb();
  const updateStmt = status
    ? db.prepare(
        "UPDATE tasks SET position = ?, status = ? WHERE id = ? AND user_id = ?"
      )
    : db.prepare("UPDATE tasks SET position = ? WHERE id = ? AND user_id = ?");

  const transaction = db.transaction(() => {
    taskIds.forEach((taskId, index) => {
      if (status) {
        updateStmt.run(index, status, taskId, userId);
      } else {
        updateStmt.run(index, taskId, userId);
      }
    });
  });
  transaction();
}
