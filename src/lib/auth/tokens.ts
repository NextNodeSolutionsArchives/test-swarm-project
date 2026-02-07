import { SignJWT, jwtVerify } from "jose";
import { createHash, randomBytes } from "node:crypto";
import { v4 as uuidv4 } from "uuid";
import type { AccessTokenPayload, PublicUser } from "./types";
import { ACCESS_TOKEN_MAX_AGE, REFRESH_TOKEN_MAX_AGE } from "./types";

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("JWT_SECRET environment variable is required in production");
    }
    // Default for development only
    return new TextEncoder().encode("dev-secret-do-not-use-in-production");
  }
  return new TextEncoder().encode(secret);
}

export async function createAccessToken(user: PublicUser): Promise<string> {
  const secret = getJwtSecret();

  return new SignJWT({
    sub: user.id,
    username: user.username,
    email: user.email,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${ACCESS_TOKEN_MAX_AGE}s`)
    .sign(secret);
}

export async function verifyAccessToken(token: string): Promise<AccessTokenPayload | null> {
  try {
    const secret = getJwtSecret();
    const { payload } = await jwtVerify(token, secret);

    return {
      sub: payload.sub as string,
      username: payload.username as string,
      email: payload.email as string,
      iat: payload.iat as number,
      exp: payload.exp as number,
    };
  } catch {
    return null;
  }
}

export function generateRefreshToken(): { token: string; hash: string; id: string; expiresAt: string } {
  const token = randomBytes(48).toString("hex");
  const hash = hashToken(token);
  const id = uuidv4();
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_MAX_AGE * 1000).toISOString();

  return { token, hash, id, expiresAt };
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
