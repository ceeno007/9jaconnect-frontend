"use client";

import { useEffect } from "react";
import { notFound, usePathname, useRouter } from "next/navigation";
import { AdminShell } from "@/components/layout/admin-shell";
import {
  AdminAuthProvider,
  useAdminAuth,
} from "@/components/providers/admin-auth-provider";

function AdminGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAdminAuthenticated, loading } = useAdminAuth();

  useEffect(() => {
    if (loading) return;
    if (isAdminAuthenticated && pathname === "/admin") {
      router.replace("/admin/dashboard");
    }
  }, [isAdminAuthenticated, loading, pathname, router]);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 lg:px-6">
        <p className="text-base font-semibold text-muted">Loading…</p>
      </div>
    );
  }

  // Unauthenticated visitors get a normal 404 so /admin is not discoverable.
  if (!isAdminAuthenticated) {
    notFound();
  }

  if (pathname === "/admin") return null;

  return <AdminShell>{children}</AdminShell>;
}

export function AdminAreaClient({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthProvider>
      <AdminGate>{children}</AdminGate>
    </AdminAuthProvider>
  );
}
