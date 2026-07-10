"use client";

import { httpRequest } from "@/lib/api/http";
import { ApiError, type AuthTokens } from "@/lib/api/types";
import { getApiBaseUrl } from "@/lib/api/config";

const ACCESS_KEY = "9jaconnect.access_token";
const REFRESH_KEY = "9jaconnect.refresh_token";
const USER_KEY = "9jaconnect.user";

type RequestOptions = {
  method?: string;
  body?: unknown;
  auth?: boolean;
  formData?: FormData;
  signal?: AbortSignal;
};

function canUseStorage() {
  return typeof window !== "undefined";
}

export function getAccessToken() {
  if (!canUseStorage()) return null;
  return localStorage.getItem(ACCESS_KEY);
}

export function getRefreshToken() {
  if (!canUseStorage()) return null;
  return localStorage.getItem(REFRESH_KEY);
}

export function setAuthTokens(tokens: Partial<AuthTokens> | null) {
  if (!canUseStorage()) return;
  if (!tokens?.access_token) {
    localStorage.removeItem(ACCESS_KEY);
  } else {
    localStorage.setItem(ACCESS_KEY, tokens.access_token);
  }
  if (!tokens?.refresh_token) {
    localStorage.removeItem(REFRESH_KEY);
  } else {
    localStorage.setItem(REFRESH_KEY, tokens.refresh_token);
  }
}

export function clearAuthSession() {
  if (!canUseStorage()) return;
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(USER_KEY);
}

export function saveStoredUser(user: unknown) {
  if (!canUseStorage()) return;
  if (!user) {
    localStorage.removeItem(USER_KEY);
    return;
  }
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getStoredUser<T>() {
  if (!canUseStorage()) return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function extractTokens(payload: unknown): AuthTokens | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const nested =
    root.tokens && typeof root.tokens === "object"
      ? (root.tokens as Record<string, unknown>)
      : root;

  const access =
    (typeof nested.access_token === "string" && nested.access_token) ||
    (typeof nested.accessToken === "string" && nested.accessToken) ||
    null;
  const refresh =
    (typeof nested.refresh_token === "string" && nested.refresh_token) ||
    (typeof nested.refreshToken === "string" && nested.refreshToken) ||
    null;

  if (!access || !refresh) return null;
  return {
    access_token: access,
    refresh_token: refresh,
    token_type:
      typeof nested.token_type === "string" ? nested.token_type : undefined,
    expires_in:
      typeof nested.expires_in === "number" ? nested.expires_in : undefined,
  };
}

let refreshPromise: Promise<boolean> | null = null;

async function refreshAccessToken(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;

  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const data = await httpRequest<unknown>("/api/v1/auth/refresh", {
          method: "POST",
          body: { refresh_token: refreshToken },
        });
        const tokens = extractTokens(data);
        if (!tokens) return false;
        setAuthTokens(tokens);
        return true;
      } catch {
        clearAuthSession();
        return false;
      } finally {
        refreshPromise = null;
      }
    })();
  }

  return refreshPromise;
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const useAuth = options.auth !== false;
  const token = useAuth ? getAccessToken() : null;

  try {
    const data = await httpRequest<T>(path, {
      method: options.method,
      body: options.body,
      formData: options.formData,
      signal: options.signal,
      token,
    });
    const tokens = extractTokens(data);
    if (tokens) setAuthTokens(tokens);
    return data;
  } catch (error) {
    if (
      error instanceof ApiError &&
      error.status === 401 &&
      useAuth &&
      getRefreshToken()
    ) {
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        return apiRequest<T>(path, { ...options, auth: true });
      }
    }
    throw error;
  }
}

export { getApiBaseUrl };
