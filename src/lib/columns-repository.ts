import { getDb, seedColumnsForUser } from "./db";
import type { Column } from "./types";
import { v4 as uuidv4 } from "uuid";

interface ColumnRow {
  id: string;
  user_id: string;
  name: string;
  status_value: string;
  position: number;
  color: string | null;
  created_at: number;
}

function rowToColumn(row: ColumnRow): Column {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    statusValue: row.status_value,
    position: row.position,
    color: row.color,
    createdAt: row.created_at,
  };
}

export function getColumns(userId: string): Column[] {
  const db = getDb();
  seedColumnsForUser(userId);
  const rows = db
    .prepare("SELECT * FROM columns WHERE user_id = ? ORDER BY position ASC")
    .all(userId) as ColumnRow[];
  return rows.map(rowToColumn);
}

export function getColumnById(id: string, userId: string): Column | null {
  const db = getDb();
  const row = db
    .prepare("SELECT * FROM columns WHERE id = ? AND user_id = ?")
    .get(id, userId) as ColumnRow | undefined;
  return row ? rowToColumn(row) : null;
}

export function getColumnByStatus(statusValue: string, userId: string): Column | null {
  const db = getDb();
  const row = db
    .prepare("SELECT * FROM columns WHERE status_value = ? AND user_id = ?")
    .get(statusValue, userId) as ColumnRow | undefined;
  return row ? rowToColumn(row) : null;
}

export function createColumn(
  userId: string,
  name: string,
  statusValue: string,
  color?: string
): Column {
  const db = getDb();

  // Check max 10 columns
  const count = db
    .prepare("SELECT COUNT(*) as count FROM columns WHERE user_id = ?")
    .get(userId) as { count: number };
  if (count.count >= 10) {
    throw new Error("Maximum of 10 columns per user");
  }

  // Check duplicate status_value
  const existing = db
    .prepare("SELECT id FROM columns WHERE user_id = ? AND status_value = ?")
    .get(userId, statusValue) as { id: string } | undefined;
  if (existing) {
    throw new Error("Status value already exists");
  }

  // Get max position
  const maxPos = db
    .prepare("SELECT MAX(position) as maxPos FROM columns WHERE user_id = ?")
    .get(userId) as { maxPos: number | null };

  const id = uuidv4();
  const now = Math.floor(Date.now() / 1000);
  const position = (maxPos.maxPos ?? -1) + 1;

  db.prepare(
    "INSERT INTO columns (id, user_id, name, status_value, position, color, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)"
  ).run(id, userId, name, statusValue, position, color || null, now);

  return {
    id,
    userId,
    name,
    statusValue,
    position,
    color: color || null,
    createdAt: now,
  };
}

export function updateColumn(
  id: string,
  userId: string,
  updates: { name?: string; statusValue?: string; color?: string; position?: number }
): Column | null {
  const db = getDb();
  const column = getColumnById(id, userId);
  if (!column) return null;

  // If statusValue is changing, check uniqueness and cascade to tasks
  if (updates.statusValue && updates.statusValue !== column.statusValue) {
    const existing = db
      .prepare("SELECT id FROM columns WHERE user_id = ? AND status_value = ? AND id != ?")
      .get(userId, updates.statusValue, id) as { id: string } | undefined;
    if (existing) {
      throw new Error("Status value already exists");
    }

    // Cascade: update all tasks with old status to new status
    db.prepare("UPDATE tasks SET status = ? WHERE user_id = ? AND status = ?").run(
      updates.statusValue,
      userId,
      column.statusValue
    );
  }

  const newName = updates.name ?? column.name;
  const newStatusValue = updates.statusValue ?? column.statusValue;
  const newColor = updates.color !== undefined ? updates.color : column.color;
  const newPosition = updates.position ?? column.position;

  db.prepare(
    "UPDATE columns SET name = ?, status_value = ?, color = ?, position = ? WHERE id = ? AND user_id = ?"
  ).run(newName, newStatusValue, newColor, newPosition, id, userId);

  return {
    ...column,
    name: newName,
    statusValue: newStatusValue,
    color: newColor,
    position: newPosition,
  };
}

export function deleteColumn(id: string, userId: string): { success: boolean; error?: string } {
  const db = getDb();
  const column = getColumnById(id, userId);
  if (!column) return { success: false, error: "Column not found" };

  // Check if column has tasks
  const taskCount = db
    .prepare("SELECT COUNT(*) as count FROM tasks WHERE user_id = ? AND status = ? AND deleted_at IS NULL")
    .get(userId, column.statusValue) as { count: number };
  if (taskCount.count > 0) {
    return {
      success: false,
      error: `Move or delete ${taskCount.count} tasks first`,
    };
  }

  db.prepare("DELETE FROM columns WHERE id = ? AND user_id = ?").run(id, userId);
  return { success: true };
}

export function reorderColumns(userId: string, columnIds: string[]): void {
  const db = getDb();
  const update = db.prepare("UPDATE columns SET position = ? WHERE id = ? AND user_id = ?");
  const transaction = db.transaction(() => {
    columnIds.forEach((colId, index) => {
      update.run(index, colId, userId);
    });
  });
  transaction();
}
