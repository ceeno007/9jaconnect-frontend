"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { EmptyState, PageShell } from "@/components/ui/primitives";
import { TicketListSkeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/components/providers/auth-provider";
import {
  getMyProfessional,
  listProfessionalTickets,
} from "@/lib/api/auth-client";
import type { ServiceTicket } from "@/lib/api/types";

export default function ProfessionalDashboardPage() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [tickets, setTickets] = useState<ServiceTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    void (async () => {
      try {
        const professionalId =
          user?.professional_id || (await getMyProfessional()).id;
        if (!professionalId) throw new Error("No professional profile");
        const items = await listProfessionalTickets(professionalId);
        if (!cancelled) setTickets(items);
      } catch {
        if (!cancelled) setError("Could not load tickets.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [authLoading, isAuthenticated, user?.professional_id]);

  if (!authLoading && !isAuthenticated) {
    return (
      <PageShell title="Professional dashboard">
        <EmptyState
          title="Sign in required"
          description="Log in as a professional to manage service tickets."
        />
        <div className="mt-4">
          <Link href="/login?next=/dashboard/professional">
            <Button>Login</Button>
          </Link>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Professional dashboard"
      actions={
        <Link href="/dashboard/professional/profile">
          <Button variant="outline">Edit profile</Button>
        </Link>
      }
    >
      <section>
        <h2 className="mb-4 text-2xl text-black">Service tickets</h2>
        {error ? (
          <EmptyState title="Something went wrong" description={error} />
        ) : loading ? (
          <TicketListSkeleton count={4} />
        ) : tickets.length === 0 ? (
          <EmptyState
            title="No tickets yet"
            description="Incoming service requests will appear here for status updates."
          />
        ) : (
          <div className="space-y-3">
            {tickets.slice(0, 8).map((ticket) => (
              <Link
                key={ticket.id}
                href={`/tickets/${ticket.id}`}
                className="ui-card flex items-center justify-between gap-4 p-5 transition hover:bg-[#fafafa]"
              >
                <div>
                  <p className="text-lg font-bold text-black">
                    {ticket.issue_summary ||
                      ticket.customer_name ||
                      `Ticket ${ticket.id.slice(0, 8)}`}
                  </p>
                  <p className="mt-1 text-sm font-medium text-muted">
                    {ticket.customer_name || "Customer request"}
                  </p>
                </div>
                <span className="rounded-full bg-[#f3f2f1] px-3 py-1 text-xs font-bold uppercase tracking-wide text-black">
                  {String(ticket.status || "open").replaceAll("_", " ")}
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </PageShell>
  );
}
