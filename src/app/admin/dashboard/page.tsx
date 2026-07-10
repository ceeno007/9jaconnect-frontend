import Link from "next/link";
import { Button } from "@/components/ui/button";
import { EmptyState, PageShell } from "@/components/ui/primitives";

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
      description="Admin APIs are not connected yet. Use the links below to preview planned tools."
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
          <EmptyState
            title="Platform stats unavailable"
            description="Live admin metrics will appear here once backend admin endpoints are deployed."
          />
        </section>
      </div>
    </PageShell>
  );
}
