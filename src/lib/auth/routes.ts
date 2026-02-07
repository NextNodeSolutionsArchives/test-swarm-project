import { Hono } from "hono";
import { getCookie } from "hono/cookie";
import { hashPassword, verifyPassword } from "./password";
import { createAccessToken, generateRefreshToken, hashToken, verifyAccessToken } from "./tokens";
import { createUser, findUserByEmail, findUserById, findUserByUsername, toPublicUser, toPublicUserWithTimestamp } from "./user-repository";
import { storeRefreshToken, findRefreshTokenByHash, deleteRefreshToken, deleteAllRefreshTokensForUser, deleteRefreshTokenByHash, isTokenExpired } from "./token-repository";
import { validateRegisterInput, validateUsername, validateEmail, validatePassword } from "./validation";
import { validateLoginInput } from "./validation";
import { successResponse, errorResponse } from "./response";
import { setAccessTokenCookie, setRefreshTokenCookie, clearAuthCookies } from "./cookies";
import { authMiddleware } from "./middleware";
import { COOKIE_ACCESS, COOKIE_REFRESH } from "./types";

const authRoutes = new Hono();

authRoutes.use("*", authMiddleware);

// POST /auth/register
authRoutes.post("/register", async (c) => {
  try {
    const body = await c.req.json();

    const validation = validateRegisterInput(body);
    if (!validation.valid) {
      // Determine specific error code
      const usernameCheck = validateUsername(body.username ?? "");
      if (!usernameCheck.valid) {
        return c.json(errorResponse("INVALID_USERNAME", usernameCheck.errors.join("; ")), 400);
      }

      const emailCheck = validateEmail(body.email ?? "");
      if (!emailCheck.valid) {
        return c.json(errorResponse("INVALID_EMAIL", emailCheck.errors.join("; ")), 400);
      }

      const passwordCheck = validatePassword(body.password ?? "");
      if (!passwordCheck.valid) {
        return c.json(errorResponse("WEAK_PASSWORD", passwordCheck.errors.join("; ")), 400);
      }

      return c.json(errorResponse("VALIDATION_ERROR", validation.errors.join("; ")), 400);
    }

    // Check uniqueness
    const existingUsername = findUserByUsername(body.username);
    if (existingUsername) {
      return c.json(errorResponse("USERNAME_TAKEN", "Username is already taken"), 409);
    }

    const existingEmail = findUserByEmail(body.email);
    if (existingEmail) {
      return c.json(errorResponse("EMAIL_TAKEN", "Email is already registered"), 409);
    }

    // Create user
    const hashedPw = await hashPassword(body.password);
    const user = createUser(body.username, body.email, hashedPw);

    // Generate tokens
    const publicUser = toPublicUser(user);
    const accessToken = await createAccessToken(publicUser);
    const refreshTokenData = generateRefreshToken();

    // Store refresh token hash
    storeRefreshToken(refreshTokenData.id, user.id, refreshTokenData.hash, refreshTokenData.expiresAt);

    // Set cookies
    setAccessTokenCookie(c, accessToken);
    setRefreshTokenCookie(c, refreshTokenData.token);

    return c.json(successResponse({ user: publicUser }), 201);
  } catch (error) {
    // Handle SQLite UNIQUE constraint violations
    if (error instanceof Error && error.message.includes("UNIQUE constraint failed")) {
      if (error.message.includes("users.username")) {
        return c.json(errorResponse("USERNAME_TAKEN", "Username is already taken"), 409);
      }
      if (error.message.includes("users.email")) {
        return c.json(errorResponse("EMAIL_TAKEN", "Email is already registered"), 409);
      }
    }
    return c.json(errorResponse("VALIDATION_ERROR", "Registration failed"), 500);
  }
});

// POST /auth/login
authRoutes.post("/login", async (c) => {
  try {
    const body = await c.req.json();

    const validation = validateLoginInput(body);
    if (!validation.valid) {
      return c.json(errorResponse("INVALID_CREDENTIALS", "Invalid email or password"), 401);
    }

    const user = findUserByEmail(body.email);
    if (!user) {
      return c.json(errorResponse("INVALID_CREDENTIALS", "Invalid email or password"), 401);
    }

    const passwordMatch = await verifyPassword(user.password, body.password);
    if (!passwordMatch) {
      return c.json(errorResponse("INVALID_CREDENTIALS", "Invalid email or password"), 401);
    }

    const publicUser = toPublicUser(user);
    const accessToken = await createAccessToken(publicUser);
    const refreshTokenData = generateRefreshToken();

    storeRefreshToken(refreshTokenData.id, user.id, refreshTokenData.hash, refreshTokenData.expiresAt);

    setAccessTokenCookie(c, accessToken);
    setRefreshTokenCookie(c, refreshTokenData.token);

    return c.json(successResponse({ user: publicUser }), 200);
  } catch {
    return c.json(errorResponse("INVALID_CREDENTIALS", "Invalid email or password"), 401);
  }
});

// POST /auth/refresh
authRoutes.post("/refresh", async (c) => {
  const refreshToken = getCookie(c, COOKIE_REFRESH);

  if (!refreshToken) {
    return c.json(errorResponse("INVALID_REFRESH_TOKEN", "Refresh token is missing"), 401);
  }

  const tokenHash = hashToken(refreshToken);
  const storedToken = findRefreshTokenByHash(tokenHash);

  if (!storedToken) {
    // Potential token reuse: try to identify user from the access token
    const accessToken = getCookie(c, COOKIE_ACCESS);
    if (accessToken) {
      const payload = await verifyAccessToken(accessToken);
      if (payload) {
        deleteAllRefreshTokensForUser(payload.sub);
        clearAuthCookies(c);
        return c.json(errorResponse("TOKEN_REUSE_DETECTED", "Potential token theft detected. All sessions have been revoked."), 401);
      }
    }
    return c.json(errorResponse("INVALID_REFRESH_TOKEN", "Invalid refresh token"), 401);
  }

  if (isTokenExpired(storedToken.expires_at)) {
    deleteRefreshToken(storedToken.id);
    clearAuthCookies(c);
    return c.json(errorResponse("INVALID_REFRESH_TOKEN", "Refresh token has expired"), 401);
  }

  // Delete old token
  deleteRefreshToken(storedToken.id);

  // Find user
  const user = findUserById(storedToken.user_id);
  if (!user) {
    clearAuthCookies(c);
    return c.json(errorResponse("INVALID_REFRESH_TOKEN", "User not found"), 401);
  }

  // Issue new tokens
  const publicUser = toPublicUser(user);
  const newAccessToken = await createAccessToken(publicUser);
  const newRefreshTokenData = generateRefreshToken();

  storeRefreshToken(newRefreshTokenData.id, user.id, newRefreshTokenData.hash, newRefreshTokenData.expiresAt);

  setAccessTokenCookie(c, newAccessToken);
  setRefreshTokenCookie(c, newRefreshTokenData.token);

  return c.json(successResponse({ user: publicUser }), 200);
});

// POST /auth/logout
authRoutes.post("/logout", async (c) => {
  const refreshToken = getCookie(c, COOKIE_REFRESH);

  if (refreshToken) {
    const tokenHash = hashToken(refreshToken);
    deleteRefreshTokenByHash(tokenHash);
  }

  clearAuthCookies(c);

  return c.json(successResponse(null), 200);
});

// GET /auth/me
authRoutes.get("/me", async (c) => {
  const userPayload = c.get("user");

  if (!userPayload) {
    return c.json(errorResponse("UNAUTHORIZED", "Authentication required"), 401);
  }

  const user = findUserById(userPayload.sub);
  if (!user) {
    return c.json(errorResponse("UNAUTHORIZED", "User not found"), 401);
  }

  return c.json(successResponse({ user: toPublicUserWithTimestamp(user) }), 200);
});

export { authRoutes };
