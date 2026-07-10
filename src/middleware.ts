import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  ADMIN_AUTH_BASE,
  ADMIN_GATE_INTERNAL,
} from "@/lib/admin-paths";

function noStoreHeaders(response: NextResponse) {
  response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
  return response;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Block direct access to the internal gate routes.
  if (
    pathname === `/${ADMIN_GATE_INTERNAL}` ||
    pathname.startsWith(`/${ADMIN_GATE_INTERNAL}/`)
  ) {
    return noStoreHeaders(new NextResponse(null, { status: 404 }));
  }

  // Old obvious admin auth URLs: pretend they do not exist.
  if (
    pathname === "/admin/login" ||
    pathname === "/admin/forgot-password" ||
    pathname === "/admin/reset-password" ||
    pathname.startsWith("/admin/reset-password/")
  ) {
    return noStoreHeaders(new NextResponse(null, { status: 404 }));
  }

  const authMatch = pathname.match(
    /^\/([^/]+)\/(login|forgot-password|reset-password)\/?$/,
  );
  if (authMatch && authMatch[1] === ADMIN_AUTH_BASE) {
    const segment = authMatch[2];
    const url = request.nextUrl.clone();
    url.pathname = `/${ADMIN_GATE_INTERNAL}/${segment}`;
    return noStoreHeaders(NextResponse.rewrite(url));
  }

  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    return noStoreHeaders(NextResponse.next());
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin",
    "/admin/:path*",
    "/admin-gate",
    "/admin-gate/:path*",
    "/:authBase/login",
    "/:authBase/forgot-password",
    "/:authBase/reset-password",
  ],
};
