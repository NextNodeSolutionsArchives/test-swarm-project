import type { MiddlewareHandler } from "hono";
import { getCookie } from "hono/cookie";
import { verifyAccessToken } from "./tokens";
import { COOKIE_ACCESS } from "./types";
import type { AccessTokenPayload } from "./types";

declare module "hono" {
  interface ContextVariableMap {
    user: AccessTokenPayload | null;
  }
}

/**
 * Auth middleware: extracts and validates JWT access token from cookies.
 * Sets `user` in context if valid. Does NOT reject unauthenticated requests.
 * Routes decide whether auth is required.
 */
export const authMiddleware: MiddlewareHandler = async (c, next) => {
  const accessToken = getCookie(c, COOKIE_ACCESS);

  if (accessToken) {
    const payload = await verifyAccessToken(accessToken);
    c.set("user", payload);
  } else {
    c.set("user", null);
  }

  await next();
};
