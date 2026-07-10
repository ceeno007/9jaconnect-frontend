"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { EmptyState, PageShell } from "@/components/ui/primitives";
import { TicketListSkeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/components/providers/auth-provider";
import {
  listCustomerTickets,
  listPendingReviews,
} from "@/lib/api/auth-client";
import type { ServiceTicket } from "@/lib/api/types";

function ticketTitle(ticket: ServiceTicket) {
  return (
    ticket.issue_summary ||
    ticket.business_name ||
    ticket.professional_name ||
    `Ticket ${String(ticket.id || "").slice(0, 8)}`
  );
}

function ticketId(ticket: ServiceTicket) {
  return String(
    ticket.id ||
      ticket.ticket_id ||
      ticket.service_ticket_id ||
      "",
  );
}

export default function CustomerDashboardPage() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [tickets, setTickets] = useState<ServiceTicket[]>([]);
  const [pendingReview, setPendingReview] = useState<ServiceTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated || !user?.id) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    void Promise.all([
      listCustomerTickets(user.id),
      listPendingReviews().catch(() => [] as ServiceTicket[]),
    ])
      .then(([ticketItems, pendingItems]) => {
        if (cancelled) return;
        setTickets(ticketItems);
        setPendingReview(
          pendingItems.length > 0
            ? pendingItems
            : ticketItems.filter(
                (ticket) =>
                  String(ticket.status || "").toLowerCase() === "completed" &&
                  (ticket.review_required === true ||
                    ticket.has_review === false ||
                    ticket.reviewed === false),
              ),
        );
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
  }, [authLoading, isAuthenticated, user?.id]);

  if (authLoading || (isAuthenticated && loading)) {
    return (
      <PageShell title="Customer dashboard">
        <div className="space-y-8">
          <section>
            <div className="mb-4 h-8 w-48 animate-pulse rounded-[8px] bg-[#f3f2f1]" />
            <TicketListSkeleton count={2} />
          </section>
          <section>
            <div className="mb-4 h-8 w-56 animate-pulse rounded-[8px] bg-[#f3f2f1]" />
            <TicketListSkeleton count={3} />
          </section>
        </div>
      </PageShell>
    );
  }

  if (!isAuthenticated) {
    return (
      <PageShell title="Customer dashboard">
        <EmptyState
          title="Sign in required"
          description="Log in as a customer to see tickets and pending reviews."
        >
          <Link href="/login?next=/dashboard/customer">
            <Button>Login</Button>
          </Link>
        </EmptyState>
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Customer dashboard"
      actions={
        <Link href="/find">
          <Button>Find professionals</Button>
        </Link>
      }
    >
      <div className="space-y-8">
        <section>
          <h2 className="text-2xl text-black">Pending reviews</h2>
          <div className="mt-4">
            {pendingReview.length === 0 ? (
              <EmptyState
                title="No pending reviews"
                description="Completed tickets that need a review will appear here."
              />
            ) : (
              <div className="space-y-3">
                {pendingReview.map((ticket) => {
                  const id = ticketId(ticket);
                  return (
                    <Link
                      key={id || ticketTitle(ticket)}
                      href={`/review/${id}`}
                      className="ui-card block p-5 transition hover:bg-[#fafafa]"
                    >
                      <p className="text-lg font-bold text-black">
                        {ticketTitle(ticket)}
                      </p>
                      <p className="mt-1 text-sm font-medium text-muted">
                        Leave a verified review
                      </p>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        <section>
          <h2 className="text-2xl text-black">My service tickets</h2>
          <div className="mt-4">
            {error ? (
              <EmptyState title="Something went wrong" description={error} />
            ) : tickets.length === 0 ? (
              <EmptyState
                title="No tickets yet"
                description="Request a service from a professional profile to create your first ticket."
              />
            ) : (
              <div className="space-y-3">
                {tickets.slice(0, 5).map((ticket) => (
                  <Link
                    key={ticket.id}
                    href={`/tickets/${ticket.id}`}
                    className="ui-card flex items-center justify-between gap-4 p-5 transition hover:bg-[#fafafa]"
                  >
                    <div>
                      <p className="text-lg font-bold text-black">
                        {ticketTitle(ticket)}
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
          </div>
        </section>
      </div>
    </PageShell>
  );
}
