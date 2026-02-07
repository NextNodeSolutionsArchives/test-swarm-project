/** Auth feature flag middleware utilities */

const MOCK_USER_ID = "mock-user-001";

export function isAuthEnabled(): boolean {
  return import.meta.env.AUTH_ENABLED === "true";
}

export function getMockUserId(): string {
  return MOCK_USER_ID;
}

/**
 * Get the authenticated user ID from the request.
 * When AUTH_ENABLED=false (default), returns mock user ID.
 * When AUTH_ENABLED=true, extracts user ID from JWT cookie.
 */
export function getUserIdFromRequest(request: Request): string | null {
  if (!isAuthEnabled()) {
    return MOCK_USER_ID;
  }

  // Real auth: extract from cookie (compatible with auth.spec.md)
  const cookies = request.headers.get("cookie") || "";
  const tokenMatch = cookies.match(/auth_token=([^;]+)/);
  if (!tokenMatch) return null;

  try {
    // JWT payload is base64-encoded in the second segment
    const payload = JSON.parse(atob(tokenMatch[1].split(".")[1]));
    return payload.sub || payload.userId || null;
  } catch {
    return null;
  }
}

/**
 * Create a JSON error response for unauthorized requests
 */
export function unauthorizedResponse(): Response {
  return new Response(JSON.stringify({ error: "Unauthorized" }), {
    status: 401,
    headers: { "Content-Type": "application/json" },
  });
}
