import type { APIRoute } from "astro";
import { getAuthenticatedUser, unauthorizedResponse } from "@/lib/auth-guard";
import { jsonResponse, errorResponse, parseJsonBody } from "@/lib/api-utils";
import { getTasks, createTask } from "@/lib/tasks-repository";
import { getColumns } from "@/lib/columns-repository";
import { sanitizeTitle, sanitizeDescription } from "@/lib/sanitize";
import { seedColumnsForUser } from "@/lib/db";
import type { CreateTaskInput } from "@/lib/types";

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  const auth = await getAuthenticatedUser(request);
  if (!auth) return unauthorizedResponse();

  const url = new URL(request.url);
  const status = url.searchParams.get("status") || undefined;

  const tasks = getTasks(auth.userId, status);
  return jsonResponse({ tasks });
};

export const POST: APIRoute = async ({ request }) => {
  const auth = await getAuthenticatedUser(request);
  if (!auth) return unauthorizedResponse();

  const body = await parseJsonBody<CreateTaskInput>(request);
  if (!body) return errorResponse("Invalid JSON body", 400);

  // Validate title
  const titleResult = sanitizeTitle(body.title);
  if (!titleResult.valid) return errorResponse(titleResult.error!, 400);

  // Validate description
  const descResult = sanitizeDescription(body.description);
  if (!descResult.valid) return errorResponse(descResult.error!, 400);

  // Determine status
  seedColumnsForUser(auth.userId);
  const columns = getColumns(auth.userId);
  let status = body.status;
  if (!status) {
    if (columns.length === 0) return errorResponse("No columns exist", 400);
    status = columns[0].statusValue;
  } else {
    const validColumn = columns.find((c) => c.statusValue === status);
    if (!validColumn) return errorResponse("Status does not match any column", 400);
  }

  const task = createTask(auth.userId, titleResult.value, descResult.value, status);
  return jsonResponse({ task }, 201);
};
