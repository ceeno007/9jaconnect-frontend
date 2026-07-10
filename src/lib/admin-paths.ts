/**
 * Obscure admin auth entry paths. Not linked from the public site.
 * Override with NEXT_PUBLIC_ADMIN_AUTH_BASE (no leading slash), e.g. "x7k-m2q9-ops".
 */
export const ADMIN_AUTH_BASE = (
  process.env.NEXT_PUBLIC_ADMIN_AUTH_BASE || "nc-x8f3k2m9"
).replace(/^\/+|\/+$/g, "");

/** Internal App Router segment; never visit this URL directly (middleware 404s it). */
export const ADMIN_GATE_INTERNAL = "admin-gate";

export const adminAuthPaths = {
  login: `/${ADMIN_AUTH_BASE}/login`,
  forgotPassword: `/${ADMIN_AUTH_BASE}/forgot-password`,
  resetPassword: `/${ADMIN_AUTH_BASE}/reset-password`,
} as const;

export function isAdminAuthPath(pathname: string | null | undefined) {
  if (!pathname) return false;
  return (
    pathname === adminAuthPaths.login ||
    pathname === adminAuthPaths.forgotPassword ||
    pathname === adminAuthPaths.resetPassword ||
    pathname.startsWith(`${adminAuthPaths.resetPassword}/`)
  );
}

export function isAdminAreaPath(pathname: string | null | undefined) {
  if (!pathname) return false;
  return pathname === "/admin" || pathname.startsWith("/admin/");
}
