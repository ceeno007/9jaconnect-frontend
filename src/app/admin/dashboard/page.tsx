"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/primitives";
import {
  getAdminDashboardStats,
  readStatNumber,
} from "@/lib/api/admin-client";
import { ApiError } from "@/lib/api/types";

const quickActions = [
  { href: "/admin/professionals", label: "Manage professionals" },
  { href: "/admin/users", label: "Manage users" },
  { href: "/admin/reviews", label: "Moderate reviews" },
  { href: "/admin/categories", label: "Manage categories" },
  { href: "/admin/verifications", label: "Verifications" },
  { href: "/admin/kyc", label: "Customer KYC" },
  { href: "/admin/referrals", label: "Referrals" },
  { href: "/admin/ads", label: "Ads" },
];

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    void getAdminDashboardStats()
      .then((data) => {
        if (!cancelled) setStats(data || {});
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err instanceof ApiError
              ? err.message
              : "Could not load dashboard stats.",
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const cards = useMemo(
    () => [
      {
        label: "Professionals",
        value: readStatNumber(stats, [
          "professionals",
          "professional_count",
          "total_professionals",
        ]),
      },
      {
        label: "Users",
        value: readStatNumber(stats, ["users", "user_count", "total_users"]),
      },
      {
        label: "Open tickets",
        value: readStatNumber(stats, [
          "open_tickets",
          "tickets_open",
          "ticket_count",
        ]),
      },
      {
        label: "Reviews",
        value: readStatNumber(stats, [
          "reviews",
          "review_count",
          "total_reviews",
        ]),
      },
      {
        label: "Pending verifications",
        value: readStatNumber(stats, [
          "pending_verifications",
          "verifications_pending",
        ]),
      },
      {
        label: "Pending KYC",
        value: readStatNumber(stats, ["pending_kyc", "kyc_pending"]),
      },
    ],
    [stats],
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-black">
          Admin dashboard
        </h1>
        <p className="mt-2 text-base font-medium text-muted">
          Live platform controls for professionals, users, reviews, and more.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <section className="ui-card p-6">
          <h2 className="text-2xl text-black">Quick actions</h2>
          <div className="mt-4 grid gap-2">
            {quickActions.map((action) => (
              <Link key={action.href} href={action.href}>
                <Button variant="outline" className="w-full justify-start">
                  {action.label}
                </Button>
              </Link>
            ))}
          </div>
        </section>

        <section className="ui-card p-6">
          <h2 className="text-2xl text-black">Platform health</h2>
          {loading ? (
            <p className="mt-4 text-sm font-medium text-muted">Loading stats…</p>
          ) : error ? (
            <div className="mt-4">
              <EmptyState title="Stats unavailable" description={error} />
            </div>
          ) : (
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {cards.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-[12px] bg-[#fafafa] p-4 text-center"
                >
                  <p className="text-2xl font-bold text-black">
                    {stat.value == null ? "—" : stat.value.toLocaleString()}
                  </p>
                  <p className="mt-1 text-xs font-semibold text-muted">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
