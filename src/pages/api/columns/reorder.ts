import type { APIRoute } from "astro";
import { getUserIdFromRequest, unauthorizedResponse } from "@/lib/auth";
import { jsonResponse, errorResponse, parseJsonBody } from "@/lib/api-utils";
import { reorderColumns } from "@/lib/columns-repository";

export const prerender = false;

interface ReorderBody {
  columnIds: string[];
}

export const POST: APIRoute = async ({ request }) => {
  const userId = getUserIdFromRequest(request);
  if (!userId) return unauthorizedResponse();

  const body = await parseJsonBody<ReorderBody>(request);
  if (!body || !Array.isArray(body.columnIds)) {
    return errorResponse("columnIds array is required", 400);
  }

  reorderColumns(userId, body.columnIds);
  return jsonResponse({ success: true });
};
