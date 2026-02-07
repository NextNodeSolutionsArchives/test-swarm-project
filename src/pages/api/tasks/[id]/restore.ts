import type { APIRoute } from "astro";
import { getAuthenticatedUser, unauthorizedResponse } from "@/lib/auth-guard";
import { jsonResponse, errorResponse } from "@/lib/api-utils";
import { restoreTask } from "@/lib/tasks-repository";

export const prerender = false;

export const POST: APIRoute = async ({ params, request }) => {
  const auth = await getAuthenticatedUser(request);
  if (!auth) return unauthorizedResponse();

  const task = restoreTask(params.id!, auth.userId);
  if (!task) return errorResponse("Task not found or already permanently deleted", 404);

  return jsonResponse({ task });
};
