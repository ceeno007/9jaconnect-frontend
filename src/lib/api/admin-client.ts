"use client";

import { getApiBaseUrl } from "@/lib/api/config";
import { httpRequest } from "@/lib/api/http";
import { ApiError, type AuthTokens } from "@/lib/api/types";

const ACCESS_KEY = "9jaconnect.admin.access_token";
const REFRESH_KEY = "9jaconnect.admin.refresh_token";
const ADMIN_KEY = "9jaconnect.admin.user";

export type AdminUser = {
  id?: string;
  email?: string;
  full_name?: string;
  role?: string;
  [key: string]: unknown;
};

export type AdminProfessionalStatus = "pending_review" | "active" | "suspended";

function canUseStorage() {
  return typeof window !== "undefined";
}

export function getAdminAccessToken() {
  if (!canUseStorage()) return null;
  return localStorage.getItem(ACCESS_KEY);
}

export function getAdminRefreshToken() {
  if (!canUseStorage()) return null;
  return localStorage.getItem(REFRESH_KEY);
}

export function setAdminTokens(tokens: Partial<AuthTokens> | null) {
  if (!canUseStorage()) return;
  if (!tokens?.access_token) localStorage.removeItem(ACCESS_KEY);
  else localStorage.setItem(ACCESS_KEY, tokens.access_token);
  if (!tokens?.refresh_token) localStorage.removeItem(REFRESH_KEY);
  else localStorage.setItem(REFRESH_KEY, tokens.refresh_token);
}

export function clearAdminSession() {
  if (!canUseStorage()) return;
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(ADMIN_KEY);
}

export function saveAdminUser(user: unknown) {
  if (!canUseStorage()) return;
  if (!user) {
    localStorage.removeItem(ADMIN_KEY);
    return;
  }
  localStorage.setItem(ADMIN_KEY, JSON.stringify(user));
}

export function getStoredAdminUser(): AdminUser | null {
  if (!canUseStorage()) return null;
  const raw = localStorage.getItem(ADMIN_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AdminUser;
  } catch {
    return null;
  }
}

function extractTokens(payload: unknown): AuthTokens | null {
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
  return { access_token: access, refresh_token: refresh };
}

function asRecord(data: unknown): Record<string, unknown> {
  return data && typeof data === "object"
    ? (data as Record<string, unknown>)
    : {};
}

export function asAdminList<T>(data: unknown, keys: string[] = []): T[] {
  if (Array.isArray(data)) return data as T[];
  const record = asRecord(data);
  for (const key of [
    ...keys,
    "items",
    "results",
    "data",
    "users",
    "professionals",
    "reviews",
    "flags",
    "categories",
    "ads",
    "verifications",
    "kyc",
  ]) {
    const value = record[key];
    if (Array.isArray(value)) return value as T[];
  }
  return [];
}

function pickUser(data: unknown): AdminUser | null {
  const record = asRecord(data);
  if (record.admin && typeof record.admin === "object") {
    return record.admin as AdminUser;
  }
  if (record.user && typeof record.user === "object") {
    return record.user as AdminUser;
  }
  if (record.email || record.full_name || record.id) {
    return record as AdminUser;
  }
  return null;
}

let refreshPromise: Promise<boolean> | null = null;

async function refreshAdminAccessToken(): Promise<boolean> {
  const refreshToken = getAdminRefreshToken();
  if (!refreshToken) return false;
  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const data = await httpRequest<unknown>("/api/v1/admin/auth/refresh", {
          method: "POST",
          body: { refresh_token: refreshToken },
        });
        const tokens = extractTokens(data);
        if (!tokens) return false;
        setAdminTokens(tokens);
        const user = pickUser(data);
        if (user) saveAdminUser(user);
        return true;
      } catch {
        clearAdminSession();
        return false;
      } finally {
        refreshPromise = null;
      }
    })();
  }
  return refreshPromise;
}

export async function adminRequest<T>(
  path: string,
  options: {
    method?: string;
    body?: unknown;
    formData?: FormData;
    auth?: boolean;
  } = {},
): Promise<T> {
  const useAuth = options.auth !== false;
  const token = useAuth ? getAdminAccessToken() : null;

  try {
    const data = await httpRequest<T>(path, {
      method: options.method,
      body: options.body,
      formData: options.formData,
      token,
    });
    const tokens = extractTokens(data);
    if (tokens) setAdminTokens(tokens);
    return data;
  } catch (error) {
    if (
      error instanceof ApiError &&
      error.status === 401 &&
      useAuth &&
      getAdminRefreshToken()
    ) {
      const refreshed = await refreshAdminAccessToken();
      if (refreshed) {
        return adminRequest<T>(path, { ...options, auth: true });
      }
    }
    throw error;
  }
}

export async function adminLogin(email: string, password: string) {
  const data = await adminRequest<unknown>("/api/v1/admin/auth/login", {
    method: "POST",
    auth: false,
    body: { email, password },
  });
  const tokens = extractTokens(data);
  if (!tokens) {
    throw new ApiError(500, "admin_auth_invalid", "Admin login response missing tokens.");
  }
  setAdminTokens(tokens);
  const user = pickUser(data) || { email };
  saveAdminUser(user);
  return user;
}

export async function adminLogout() {
  const refreshToken = getAdminRefreshToken();
  try {
    if (refreshToken) {
      await adminRequest("/api/v1/admin/auth/logout", {
        method: "POST",
        auth: false,
        body: { refresh_token: refreshToken },
      });
    }
  } finally {
    clearAdminSession();
  }
}

export async function adminForgotPassword(email: string) {
  return adminRequest("/api/v1/admin/auth/forgot-password", {
    method: "POST",
    auth: false,
    body: { email },
  });
}

export async function adminResetPassword(token: string, newPassword: string) {
  return adminRequest("/api/v1/admin/auth/reset-password", {
    method: "POST",
    auth: false,
    body: { token, new_password: newPassword },
  });
}

export async function getAdminDashboardStats() {
  return adminRequest<Record<string, unknown>>("/api/v1/admin/dashboard/stats");
}

export async function listAdminProfessionals() {
  const data = await adminRequest<unknown>("/api/v1/admin/professionals");
  return asAdminList<Record<string, unknown>>(data, ["professionals"]);
}

export async function updateAdminProfessionalStatus(
  professionalId: string,
  status: AdminProfessionalStatus,
) {
  return adminRequest(
    `/api/v1/admin/professionals/${professionalId}/status`,
    { method: "PUT", body: { status } },
  );
}

export async function updateAdminProfessionalTrustBadge(
  professionalId: string,
  payload: { is_awarded: boolean; reason: string },
) {
  return adminRequest(
    `/api/v1/admin/professionals/${professionalId}/trust-badge`,
    { method: "PUT", body: payload },
  );
}

export async function listAdminUsers() {
  const data = await adminRequest<unknown>("/api/v1/admin/users");
  return asAdminList<Record<string, unknown>>(data, ["users"]);
}

export async function inviteAdminUser(payload: {
  email: string;
  full_name: string;
}) {
  return adminRequest("/api/v1/admin/users/admins", {
    method: "POST",
    body: payload,
  });
}

export async function resendAdminInvite(userId: string) {
  return adminRequest(`/api/v1/admin/users/admins/${userId}/resend-invite`, {
    method: "POST",
  });
}

export async function deactivateAdminUser(userId: string) {
  return adminRequest(`/api/v1/admin/users/${userId}`, { method: "DELETE" });
}

export async function suspendAdminUser(userId: string, reason: string) {
  return adminRequest(`/api/v1/admin/users/${userId}/suspend`, {
    method: "PUT",
    body: { reason },
  });
}

export async function unsuspendAdminUser(userId: string, reason?: string) {
  return adminRequest(`/api/v1/admin/users/${userId}/unsuspend`, {
    method: "PUT",
    body: { reason: reason || null },
  });
}

export async function listUserAuditLogs(userId: string) {
  const data = await adminRequest<unknown>(
    `/api/v1/admin/audit/users/${userId}`,
  );
  return asAdminList<Record<string, unknown>>(data, ["logs", "audit_logs"]);
}

export async function listAdminReviewFlags() {
  const data = await adminRequest<unknown>("/api/v1/admin/reviews/flags");
  return asAdminList<Record<string, unknown>>(data, ["flags", "reviews"]);
}

export async function flagAdminReview(reviewId: string, reason: string) {
  return adminRequest(`/api/v1/admin/reviews/${reviewId}/flag`, {
    method: "POST",
    body: { reason },
  });
}

export async function removeAdminReview(reviewId: string, reason: string) {
  return adminRequest(`/api/v1/admin/reviews/${reviewId}`, {
    method: "DELETE",
    body: { reason },
  });
}

export async function getAdminReviewHistory(reviewId: string) {
  const data = await adminRequest<unknown>(
    `/api/v1/admin/reviews/${reviewId}/history`,
  );
  return asAdminList<Record<string, unknown>>(data, ["history", "items"]);
}

export async function createAdminCategory(payload: {
  slug: string;
  name: string;
  display_order: number;
  icon_key?: string | null;
  icon_url?: string | null;
  is_active?: boolean;
}) {
  return adminRequest("/api/v1/admin/categories", {
    method: "POST",
    body: payload,
  });
}

export async function updateAdminCategory(
  categoryId: string,
  payload: {
    slug: string;
    name: string;
    display_order: number;
    icon_key?: string | null;
    icon_url?: string | null;
    is_active?: boolean;
  },
) {
  return adminRequest(`/api/v1/admin/categories/${categoryId}`, {
    method: "PUT",
    body: payload,
  });
}

export async function deleteAdminCategory(categoryId: string) {
  return adminRequest(`/api/v1/admin/categories/${categoryId}`, {
    method: "DELETE",
  });
}

export async function uploadAdminCategoryImage(
  categoryId: string,
  file: File,
) {
  const form = new FormData();
  form.append("file", file);
  return adminRequest(`/api/v1/admin/categories/${categoryId}/image`, {
    method: "POST",
    formData: form,
  });
}

export async function deleteAdminCategoryImage(categoryId: string) {
  return adminRequest(`/api/v1/admin/categories/${categoryId}/image`, {
    method: "DELETE",
  });
}

export async function createAdminSubcategory(
  categoryId: string,
  payload: {
    slug: string;
    name: string;
    display_order: number;
    is_active?: boolean;
    risk_level: "standard" | "sensitive";
    trust_badge_eligible: boolean;
  },
) {
  return adminRequest(
    `/api/v1/admin/categories/${categoryId}/subcategories`,
    { method: "POST", body: payload },
  );
}

export async function updateAdminSubcategory(
  subcategoryId: string,
  payload: {
    slug: string;
    name: string;
    display_order: number;
    is_active?: boolean;
    risk_level: "standard" | "sensitive";
    trust_badge_eligible: boolean;
  },
) {
  return adminRequest(`/api/v1/admin/subcategories/${subcategoryId}`, {
    method: "PUT",
    body: payload,
  });
}

export async function deleteAdminSubcategory(subcategoryId: string) {
  return adminRequest(`/api/v1/admin/subcategories/${subcategoryId}`, {
    method: "DELETE",
  });
}

export async function listPendingVerifications() {
  const data = await adminRequest<unknown>(
    "/api/v1/admin/verifications/pending",
  );
  return asAdminList<Record<string, unknown>>(data, ["verifications"]);
}

export function adminVerificationFileUrl(verificationId: string) {
  return `${getApiBaseUrl()}/api/v1/admin/verifications/${verificationId}/file`;
}

export async function approveVerification(
  verificationId: string,
  reason?: string | null,
) {
  return adminRequest(
    `/api/v1/admin/verifications/${verificationId}/approve`,
    { method: "PUT", body: { reason: reason || null } },
  );
}

export async function rejectVerification(
  verificationId: string,
  reason: string,
) {
  return adminRequest(
    `/api/v1/admin/verifications/${verificationId}/reject`,
    { method: "PUT", body: { reason } },
  );
}

export async function listPendingKyc(params?: {
  status?: string;
  page?: number;
  page_size?: number;
}) {
  const search = new URLSearchParams();
  if (params?.status) search.set("status", params.status);
  if (params?.page) search.set("page", String(params.page));
  if (params?.page_size) search.set("page_size", String(params.page_size));
  const qs = search.toString();
  const data = await adminRequest<unknown>(
    `/api/v1/admin/kyc/pending${qs ? `?${qs}` : ""}`,
  );
  return asAdminList<Record<string, unknown>>(data, ["kyc", "items"]);
}

export function adminKycDocumentUrl(userId: string) {
  return `${getApiBaseUrl()}/api/v1/admin/kyc/${userId}/document`;
}

export async function approveCustomerKyc(userId: string) {
  return adminRequest(`/api/v1/admin/kyc/${userId}/approve`, {
    method: "PUT",
  });
}

export async function rejectCustomerKyc(userId: string, reason: string) {
  return adminRequest(`/api/v1/admin/kyc/${userId}/reject`, {
    method: "PUT",
    body: { reason },
  });
}

export async function getReferralSummary() {
  return adminRequest<Record<string, unknown>>(
    "/api/v1/admin/referrals/summary",
  );
}

export async function getReferralTree(professionalId: string) {
  return adminRequest<unknown>(
    `/api/v1/admin/referrals/tree/${professionalId}`,
  );
}

export async function markReferralPaid(professionalId: string) {
  return adminRequest(
    `/api/v1/admin/referrals/${professionalId}/mark-paid`,
    { method: "PUT" },
  );
}

export async function listAdminAds(params?: {
  page_context?: string;
  is_active?: string;
}) {
  const search = new URLSearchParams();
  if (params?.page_context) search.set("page_context", params.page_context);
  if (params?.is_active) search.set("is_active", params.is_active);
  const qs = search.toString();
  const data = await adminRequest<unknown>(
    `/api/v1/admin/ads${qs ? `?${qs}` : ""}`,
  );
  return asAdminList<Record<string, unknown>>(data, ["ads", "slots"]);
}

export async function updateAdminAd(
  adSlotId: string,
  payload: {
    adsense_slot_id?: string | null;
    is_active?: boolean | null;
    display_order?: number | null;
    category_id?: string | null;
    state_id?: string | null;
  },
) {
  return adminRequest(`/api/v1/admin/ads/${adSlotId}`, {
    method: "PUT",
    body: payload,
  });
}

export function readStatNumber(
  stats: Record<string, unknown>,
  keys: string[],
) {
  for (const key of keys) {
    const value = stats[key];
    if (typeof value === "number") return value;
    if (typeof value === "string" && value.trim() && !Number.isNaN(Number(value))) {
      return Number(value);
    }
  }
  return null;
}

export function displayName(record: Record<string, unknown>) {
  return (
    String(
      record.full_name ||
        record.business_name ||
        record.name ||
        record.email ||
        record.id ||
        "Unknown",
    )
  );
}
