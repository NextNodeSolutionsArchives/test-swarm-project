import type { APIRoute } from "astro";
import { getUserIdFromRequest, unauthorizedResponse } from "@/lib/auth";
import { jsonResponse, errorResponse, parseJsonBody } from "@/lib/api-utils";
import { getColumnById, updateColumn, deleteColumn } from "@/lib/columns-repository";
import { sanitizeColumnName, sanitizeStatusValue } from "@/lib/sanitize";
import type { UpdateColumnInput } from "@/lib/types";

export const prerender = false;

export const GET: APIRoute = async ({ params, request }) => {
  const userId = getUserIdFromRequest(request);
  if (!userId) return unauthorizedResponse();

  const column = getColumnById(params.id!, userId);
  if (!column) return errorResponse("Column not found", 404);

  return jsonResponse({ column });
};

export const PUT: APIRoute = async ({ params, request }) => {
  const userId = getUserIdFromRequest(request);
  if (!userId) return unauthorizedResponse();

  const existing = getColumnById(params.id!, userId);
  if (!existing) return errorResponse("Column not found", 404);

  const body = await parseJsonBody<UpdateColumnInput>(request);
  if (!body) return errorResponse("Invalid JSON body", 400);

  // Validate name if provided
  if (body.name !== undefined) {
    const nameResult = sanitizeColumnName(body.name);
    if (!nameResult.valid) return errorResponse(nameResult.error!, 400);
    body.name = nameResult.value;
  }

  // Validate statusValue if provided
  if (body.statusValue !== undefined) {
    const statusResult = sanitizeStatusValue(body.statusValue);
    if (!statusResult.valid) return errorResponse(statusResult.error!, 400);
    body.statusValue = statusResult.value;
  }

  try {
    const column = updateColumn(params.id!, userId, body);
    if (!column) return errorResponse("Column not found", 404);
    return jsonResponse({ column });
  } catch (err) {
    return errorResponse((err as Error).message, 400);
  }
};

export const DELETE: APIRoute = async ({ params, request }) => {
  const userId = getUserIdFromRequest(request);
  if (!userId) return unauthorizedResponse();

  const result = deleteColumn(params.id!, userId);
  if (!result.success) {
    const status = result.error === "Column not found" ? 404 : 400;
    return errorResponse(result.error!, status);
  }

  return jsonResponse({ success: true });
};
