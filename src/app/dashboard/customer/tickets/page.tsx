"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { EmptyState, PageShell } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { TicketListSkeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/components/providers/auth-provider";
import { listCustomerTickets } from "@/lib/api/auth-client";
import type { ServiceTicket } from "@/lib/api/types";

export default function CustomerTicketsPage() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [tickets, setTickets] = useState<ServiceTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!user?.id) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    void listCustomerTickets(user.id)
      .then((items) => {
        if (!cancelled) setTickets(items);
      })
      .catch(() => {
        if (!cancelled) setError("Could not load tickets.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [authLoading, user?.id]);

  if (authLoading || (isAuthenticated && loading)) {
    return (
      <PageShell title="My tickets">
        <TicketListSkeleton count={5} />
      </PageShell>
    );
  }

  if (!isAuthenticated) {
    return (
      <PageShell title="My tickets">
        <EmptyState
          title="Sign in required"
          description="Log in to view your service tickets."
        />
        <div className="mt-4">
          <Link href="/login?next=/dashboard/customer/tickets">
            <Button>Login</Button>
          </Link>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell title="My tickets">
      {error ? (
        <EmptyState title="Something went wrong" description={error} />
      ) : tickets.length === 0 ? (
        <EmptyState
          title="No tickets yet"
          description="When you request a service, tickets will list here with status and a link to detail."
        />
      ) : (
        <div className="space-y-3">
          {tickets.map((ticket) => (
            <Link
              key={ticket.id}
              href={`/tickets/${ticket.id}`}
              className="ui-card flex items-center justify-between gap-4 p-5 transition hover:bg-[#fafafa]"
            >
              <div>
                <p className="text-lg font-bold text-black">
                  {ticket.issue_summary ||
                    ticket.business_name ||
                    `Ticket ${ticket.id.slice(0, 8)}`}
                </p>
                <p className="mt-1 text-sm font-medium text-muted">
                  {ticket.category_name || "Service request"}
                </p>
              </div>
              <span className="rounded-full bg-[#f3f2f1] px-3 py-1 text-xs font-bold uppercase tracking-wide text-black">
                {String(ticket.status || "open").replaceAll("_", " ")}
              </span>
            </Link>
          ))}
        </div>
      )}
    </PageShell>
  );
}
