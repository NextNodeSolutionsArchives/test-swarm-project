import type { APIRoute } from "astro";
import { getUserIdFromRequest, unauthorizedResponse } from "@/lib/auth";
import { jsonResponse, errorResponse, parseJsonBody } from "@/lib/api-utils";
import { reorderTasks } from "@/lib/tasks-repository";

export const prerender = false;

interface ReorderBody {
  taskIds: string[];
  status?: string;
}

export const POST: APIRoute = async ({ request }) => {
  const userId = getUserIdFromRequest(request);
  if (!userId) return unauthorizedResponse();

  const body = await parseJsonBody<ReorderBody>(request);
  if (!body || !Array.isArray(body.taskIds)) {
    return errorResponse("taskIds array is required", 400);
  }

  reorderTasks(userId, body.taskIds, body.status);
  return jsonResponse({ success: true });
};
