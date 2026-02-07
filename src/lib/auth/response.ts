import type { ApiSuccess, ApiError, AuthErrorCode } from "./types";

export function successResponse<T>(data: T): ApiSuccess<T> {
  return { success: true, data };
}

export function errorResponse(code: AuthErrorCode, message: string): ApiError {
  return { success: false, error: { code, message } };
}
