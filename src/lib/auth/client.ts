/**
 * Client-side auth utilities for React islands.
 * These functions call the API endpoints and manage auth state.
 */

import type { PublicUser, PublicUserWithTimestamp, ApiResponse } from "./types";

export type { PublicUser, PublicUserWithTimestamp };

export interface AuthState {
  user: PublicUser | null;
  loading: boolean;
}

async function apiCall<T>(url: string, options?: RequestInit): Promise<ApiResponse<T>> {
  const response = await fetch(url, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  return response.json();
}

export async function register(username: string, email: string, password: string): Promise<ApiResponse<{ user: PublicUser }>> {
  return apiCall("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ username, email, password }),
  });
}

export async function login(email: string, password: string): Promise<ApiResponse<{ user: PublicUser }>> {
  return apiCall("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function logout(): Promise<ApiResponse<null>> {
  return apiCall("/api/auth/logout", {
    method: "POST",
  });
}

export async function getCurrentUser(): Promise<ApiResponse<{ user: PublicUserWithTimestamp }>> {
  return apiCall("/api/auth/me");
}

export async function refreshToken(): Promise<ApiResponse<{ user: PublicUser }>> {
  return apiCall("/api/auth/refresh", {
    method: "POST",
  });
}

/**
 * Attempts to get current user; if token expired, silently refreshes.
 * Returns the user or null.
 */
export async function getAuthenticatedUser(): Promise<PublicUser | null> {
  const meResult = await getCurrentUser();
  if (meResult.success) {
    return meResult.data.user;
  }

  // Try refresh
  const refreshResult = await refreshToken();
  if (refreshResult.success) {
    return refreshResult.data.user;
  }

  return null;
}
