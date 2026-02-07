import { verifyAccessToken } from "./auth/tokens";
import { COOKIE_ACCESS } from "./auth/types";

export interface AuthUser {
  userId: string;
  username: string;
  email: string;
}

/**
 * Extract and verify the authenticated user from the request cookies.
 * Returns null if no valid JWT is present.
 */
export async function getAuthenticatedUser(request: Request): Promise<AuthUser | null> {
  const cookieHeader = request.headers.get("cookie") || "";
  const match = cookieHeader.match(new RegExp(`${COOKIE_ACCESS}=([^;]+)`));
  if (!match) return null;

  const payload = await verifyAccessToken(match[1]);
  if (!payload) return null;

  return {
    userId: payload.sub,
    username: payload.username,
    email: payload.email,
  };
}

/**
 * Create a 401 Unauthorized JSON response.
 */
export function unauthorizedResponse(): Response {
  return new Response(JSON.stringify({ error: "Unauthorized" }), {
    status: 401,
    headers: { "Content-Type": "application/json" },
  });
}
