import type { APIRoute } from "astro";
import { getUserIdFromRequest, unauthorizedResponse } from "@/lib/auth";
import { jsonResponse, errorResponse } from "@/lib/api-utils";
import { restoreTask } from "@/lib/tasks-repository";

export const prerender = false;

export const POST: APIRoute = async ({ params, request }) => {
  const userId = getUserIdFromRequest(request);
  if (!userId) return unauthorizedResponse();

  const task = restoreTask(params.id!, userId);
  if (!task) return errorResponse("Task not found or already permanently deleted", 404);

  return jsonResponse({ task });
};
