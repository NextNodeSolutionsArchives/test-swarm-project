/** Input sanitization utilities */

/** Strip HTML tags from a string */
export function stripHtmlTags(input: string): string {
  return input.replace(/<[^>]*>/g, "");
}

/** Validate and sanitize task title */
export function sanitizeTitle(title: unknown): { valid: boolean; value: string; error?: string } {
  if (typeof title !== "string" || title.trim().length === 0) {
    return { valid: false, value: "", error: "Title is required" };
  }
  const cleaned = stripHtmlTags(title.trim());
  if (cleaned.length > 200) {
    return { valid: false, value: cleaned, error: "Title must be 200 characters or less" };
  }
  return { valid: true, value: cleaned };
}

/** Validate and sanitize task description */
export function sanitizeDescription(
  description: unknown
): { valid: boolean; value: string | null; error?: string } {
  if (description === null || description === undefined || description === "") {
    return { valid: true, value: null };
  }
  if (typeof description !== "string") {
    return { valid: false, value: null, error: "Description must be a string" };
  }
  const cleaned = stripHtmlTags(description.trim());
  if (cleaned.length > 2000) {
    return { valid: false, value: cleaned, error: "Description must be 2000 characters or less" };
  }
  return { valid: true, value: cleaned || null };
}

/** Validate column name */
export function sanitizeColumnName(
  name: unknown
): { valid: boolean; value: string; error?: string } {
  if (typeof name !== "string" || name.trim().length === 0) {
    return { valid: false, value: "", error: "Column name is required" };
  }
  const cleaned = stripHtmlTags(name.trim());
  if (cleaned.length > 50) {
    return { valid: false, value: cleaned, error: "Column name must be 50 characters or less" };
  }
  return { valid: true, value: cleaned };
}

/** Validate status value (kebab-case) */
export function sanitizeStatusValue(
  value: unknown
): { valid: boolean; value: string; error?: string } {
  if (typeof value !== "string" || value.trim().length === 0) {
    return { valid: false, value: "", error: "Status value is required" };
  }
  const cleaned = value.trim().toLowerCase();
  if (cleaned.length > 50) {
    return { valid: false, value: cleaned, error: "Status value must be 50 characters or less" };
  }
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(cleaned)) {
    return {
      valid: false,
      value: cleaned,
      error: "Status value must be kebab-case (lowercase letters, numbers, hyphens)",
    };
  }
  return { valid: true, value: cleaned };
}
