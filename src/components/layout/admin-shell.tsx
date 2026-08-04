"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAdminAuth } from "@/components/providers/admin-auth-provider";
import { cn } from "@/lib/utils";

const links = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/professionals", label: "Professionals" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/reviews", label: "Reviews" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/verifications", label: "Verifications" },
  { href: "/admin/kyc", label: "KYC" },
  { href: "/admin/referrals", label: "Referrals" },
  { href: "/admin/ads", label: "Ads" },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { admin, logout } = useAdminAuth();

  return (
    <div className="min-h-screen bg-[#f7f6f5]">
      <header className="border-b border-[#ececee] bg-white">
        <div className="page-x mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 py-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-muted">
              9jaconnect Admin
            </p>
            <p className="text-sm font-semibold text-black">
              {String(admin?.full_name || admin?.email || "Administrator")}
            </p>
          </div>
          <button
            type="button"
            onClick={() => void logout()}
            className="text-sm font-bold text-black hover:underline"
          >
            Log out
          </button>
        </div>
        <nav className="page-x mx-auto flex max-w-7xl gap-1 overflow-x-auto pb-3">
          {links.map((link) => {
            const active =
              pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "shrink-0 rounded-[8px] px-3 py-2 text-sm font-bold transition",
                  active
                    ? "bg-black text-white"
                    : "text-[#2d2d2d] hover:bg-[#f4f4f5]",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </header>
      <div className="page-x mx-auto max-w-7xl py-8">{children}</div>
    </div>
  );
}
