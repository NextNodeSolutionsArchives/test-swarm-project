import type { Context } from "hono";
import { setCookie, deleteCookie } from "hono/cookie";
import { COOKIE_ACCESS, COOKIE_REFRESH, ACCESS_TOKEN_MAX_AGE, REFRESH_TOKEN_MAX_AGE } from "./types";

const isProduction = () => process.env.NODE_ENV === "production";

export function setAccessTokenCookie(c: Context, token: string): void {
  setCookie(c, COOKIE_ACCESS, token, {
    httpOnly: true,
    secure: isProduction(),
    sameSite: "Lax",
    path: "/",
    maxAge: ACCESS_TOKEN_MAX_AGE,
  });
}

export function setRefreshTokenCookie(c: Context, token: string): void {
  setCookie(c, COOKIE_REFRESH, token, {
    httpOnly: true,
    secure: isProduction(),
    sameSite: "Lax",
    path: "/api/auth",
    maxAge: REFRESH_TOKEN_MAX_AGE,
  });
}

export function clearAuthCookies(c: Context): void {
  deleteCookie(c, COOKIE_ACCESS, { path: "/" });
  deleteCookie(c, COOKIE_REFRESH, { path: "/api/auth" });
}
