import type { APIRoute } from "astro";
import { getUserIdFromRequest, unauthorizedResponse } from "@/lib/auth";
import { jsonResponse, errorResponse, parseJsonBody } from "@/lib/api-utils";
import { getTaskById, updateTask, softDeleteTask } from "@/lib/tasks-repository";
import { getColumnByStatus } from "@/lib/columns-repository";
import { sanitizeTitle, sanitizeDescription } from "@/lib/sanitize";
import type { UpdateTaskInput } from "@/lib/types";

export const prerender = false;

export const GET: APIRoute = async ({ params, request }) => {
  const userId = getUserIdFromRequest(request);
  if (!userId) return unauthorizedResponse();

  const task = getTaskById(params.id!, userId);
  if (!task) return errorResponse("Task not found", 404);

  return jsonResponse({ task });
};

export const PUT: APIRoute = async ({ params, request }) => {
  const userId = getUserIdFromRequest(request);
  if (!userId) return unauthorizedResponse();

  const existing = getTaskById(params.id!, userId);
  if (!existing) return errorResponse("Task not found", 404);

  const body = await parseJsonBody<UpdateTaskInput>(request);
  if (!body) return errorResponse("Invalid JSON body", 400);

  // Validate title if provided
  if (body.title !== undefined) {
    const titleResult = sanitizeTitle(body.title);
    if (!titleResult.valid) return errorResponse(titleResult.error!, 400);
    body.title = titleResult.value;
  }

  // Validate description if provided
  if (body.description !== undefined) {
    const descResult = sanitizeDescription(body.description);
    if (!descResult.valid) return errorResponse(descResult.error!, 400);
    body.description = descResult.value ?? undefined;
  }

  // Validate status if provided
  if (body.status !== undefined) {
    const column = getColumnByStatus(body.status, userId);
    if (!column) return errorResponse("Status does not match any column", 400);
  }

  const task = updateTask(params.id!, userId, body);
  if (!task) return errorResponse("Task not found", 404);

  return jsonResponse({ task });
};

export const DELETE: APIRoute = async ({ params, request }) => {
  const userId = getUserIdFromRequest(request);
  if (!userId) return unauthorizedResponse();

  const result = softDeleteTask(params.id!, userId);
  if (!result) return errorResponse("Task not found", 404);

  return jsonResponse(result);
};
