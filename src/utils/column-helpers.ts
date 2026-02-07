/**
 * Column helper functions extracted from TaskCard.tsx.
 */
import type { Column } from "@/lib/types";

/** Get the color for a given status value from the columns list. */
export function getColumnColor(status: string, columns: Column[]): string {
  const col = columns.find((c) => c.statusValue === status);
  return col?.color || "#6B7280";
}

/** Get the display name for a given status value from the columns list. */
export function getColumnName(status: string, columns: Column[]): string {
  const col = columns.find((c) => c.statusValue === status);
  return col?.name || status;
}
