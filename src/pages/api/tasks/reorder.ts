import type { APIRoute } from "astro";
import { getAuthenticatedUser, unauthorizedResponse } from "@/lib/auth-guard";
import { jsonResponse, errorResponse, parseJsonBody } from "@/lib/api-utils";
import { reorderTasks } from "@/lib/tasks-repository";

export const prerender = false;

interface ReorderBody {
  taskIds: string[];
  status?: string;
}

export const POST: APIRoute = async ({ request }) => {
  const auth = await getAuthenticatedUser(request);
  if (!auth) return unauthorizedResponse();

  const body = await parseJsonBody<ReorderBody>(request);
  if (!body || !Array.isArray(body.taskIds)) {
    return errorResponse("taskIds array is required", 400);
  }

  reorderTasks(auth.userId, body.taskIds, body.status);
  return jsonResponse({ success: true });
};
