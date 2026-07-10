"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/auth-provider";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) {
      router.replace("/login?next=/admin/dashboard");
      return;
    }
    if (user?.user_type !== "admin") {
      router.replace(
        user?.user_type === "professional"
          ? "/dashboard/professional"
          : "/dashboard/customer",
      );
    }
  }, [isAuthenticated, loading, router, user?.user_type]);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 lg:px-6">
        <p className="text-base font-semibold text-muted">Loading admin…</p>
      </div>
    );
  }

  if (!isAuthenticated || user?.user_type !== "admin") {
    return null;
  }

  return (
    <div>
      <div className="border-b border-[#e4e2e0] bg-[#fafafa]">
        <div className="mx-auto max-w-7xl px-4 py-3 text-sm font-medium text-muted lg:px-6">
          Admin tools are not connected to the live API yet. Customer and
          professional flows are production-ready.
        </div>
      </div>
      {children}
    </div>
  );
}
