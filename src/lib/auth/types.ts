export interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  createdAt: string;
  updatedAt: string;
}

export interface PublicUser {
  id: string;
  username: string;
  email: string;
}

export interface PublicUserWithTimestamp extends PublicUser {
  createdAt: string;
}

export interface RefreshToken {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: string;
  createdAt: string;
}

export interface AccessTokenPayload {
  sub: string;
  username: string;
  email: string;
  iat: number;
  exp: number;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

export type AuthErrorCode =
  | "USERNAME_TAKEN"
  | "EMAIL_TAKEN"
  | "INVALID_USERNAME"
  | "INVALID_EMAIL"
  | "WEAK_PASSWORD"
  | "VALIDATION_ERROR"
  | "INVALID_CREDENTIALS"
  | "INVALID_REFRESH_TOKEN"
  | "TOKEN_REUSE_DETECTED"
  | "UNAUTHORIZED";

export interface RegisterInput {
  username: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export const COOKIE_ACCESS = "pulseo_access";
export const COOKIE_REFRESH = "pulseo_refresh";

export const ACCESS_TOKEN_MAX_AGE = 3600; // 1 hour
export const REFRESH_TOKEN_MAX_AGE = 2592000; // 30 days
