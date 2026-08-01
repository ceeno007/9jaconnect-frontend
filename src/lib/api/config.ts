/**
 * API URL helpers.
 *
 * Browser traffic goes same-origin (`/api/v1/...`) and Next.js rewrites
 * proxy to the real backend. The backend host stays server-side only.
 */

function stripTrailingSlash(value: string) {
  return value.replace(/\/$/, "");
}

/** Real backend origin. Server-only env preferred. */
export function getBackendOrigin() {
  return stripTrailingSlash(
    process.env.API_BASE_URL ||
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      "https://api.9jaconnet.com",
  );
}

/**
 * Base URL for API fetches.
 * - Browser: empty string → `/api/v1/...` on this app (proxied)
 * - Server: direct backend origin
 */
export function getApiBaseUrl() {
  return getBackendOrigin();
}

export const GOOGLE_CLIENT_ID =
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim() || "";

/** Hostnames whose media should be rewritten through the same-origin proxy. */
export const BACKEND_MEDIA_HOSTS = new Set([
  "api.9jaconnet.com",
  "localhost",
  "127.0.0.1",
]);
