import type { APIRoute } from "astro";
import { getAuthenticatedUser, unauthorizedResponse } from "@/lib/auth-guard";
import { jsonResponse, errorResponse, parseJsonBody } from "@/lib/api-utils";
import { reorderColumns } from "@/lib/columns-repository";

export const prerender = false;

interface ReorderBody {
  columnIds: string[];
}

export const POST: APIRoute = async ({ request }) => {
  const auth = await getAuthenticatedUser(request);
  if (!auth) return unauthorizedResponse();

  const body = await parseJsonBody<ReorderBody>(request);
  if (!body || !Array.isArray(body.columnIds)) {
    return errorResponse("columnIds array is required", 400);
  }

  reorderColumns(auth.userId, body.columnIds);
  return jsonResponse({ success: true });
};
