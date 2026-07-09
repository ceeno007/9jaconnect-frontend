import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PageShell } from "@/components/ui/primitives";

const quickActions = [
  { href: "/admin/professionals", label: "Manage professionals" },
  { href: "/admin/users", label: "Manage users" },
  { href: "/admin/reviews", label: "Moderate reviews" },
  { href: "/admin/categories", label: "Manage categories" },
  { href: "/admin/communications", label: "Communications" },
];

export default function AdminDashboardPage() {
  return (
    <PageShell
      title="Admin dashboard"
      description="Quick Actions, Recent Activity feed, and Platform Health stats."
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
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
          <h2 className="text-2xl text-black">
            Platform health
          </h2>
          <div className="mt-4 grid grid-cols-3 gap-3">
            {[
              { label: "Professionals", value: "128" },
              { label: "Open tickets", value: "34" },
              { label: "Reviews", value: "512" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-[var(--radius-md)] bg-background p-4 text-center"
              >
                <p className="text-2xl text-black">
                  {stat.value}
                </p>
                <p className="mt-1 text-xs text-muted">{stat.label}</p>
              </div>
            ))}
          </div>
          <h3 className="mt-8 text-xl text-black">
            Recent activity
          </h3>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            <li>Professional listing submitted for review</li>
            <li>Customer review flagged for moderation</li>
            <li>New category draft created</li>
          </ul>
        </section>
      </div>
    </PageShell>
  );
}
