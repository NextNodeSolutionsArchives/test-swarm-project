import type { APIRoute } from "astro";
import { getAuthenticatedUser, unauthorizedResponse } from "@/lib/auth-guard";
import { jsonResponse, errorResponse, parseJsonBody } from "@/lib/api-utils";
import { getColumns, createColumn } from "@/lib/columns-repository";
import { sanitizeColumnName, sanitizeStatusValue } from "@/lib/sanitize";
import { seedColumnsForUser } from "@/lib/db";
import type { CreateColumnInput } from "@/lib/types";

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  const auth = await getAuthenticatedUser(request);
  if (!auth) return unauthorizedResponse();

  // Auto-seed default columns for new users (idempotent)
  seedColumnsForUser(auth.userId);

  const columns = getColumns(auth.userId);
  return jsonResponse({ columns });
};

export const POST: APIRoute = async ({ request }) => {
  const auth = await getAuthenticatedUser(request);
  if (!auth) return unauthorizedResponse();

  const body = await parseJsonBody<CreateColumnInput>(request);
  if (!body) return errorResponse("Invalid JSON body", 400);

  const nameResult = sanitizeColumnName(body.name);
  if (!nameResult.valid) return errorResponse(nameResult.error!, 400);

  const statusResult = sanitizeStatusValue(body.statusValue);
  if (!statusResult.valid) return errorResponse(statusResult.error!, 400);

  try {
    const column = createColumn(auth.userId, nameResult.value, statusResult.value, body.color);
    return jsonResponse({ column }, 201);
  } catch (err) {
    return errorResponse((err as Error).message, 400);
  }
};
