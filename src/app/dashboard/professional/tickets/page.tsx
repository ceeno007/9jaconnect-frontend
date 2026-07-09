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
  updateTicketStatus,
} from "@/lib/api/auth-client";
import type { ServiceTicket } from "@/lib/api/types";
import { ApiError } from "@/lib/api/types";

export default function ProfessionalTicketsPage() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [tickets, setTickets] = useState<ServiceTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState("");

  async function load() {
    const professionalId =
      user?.professional_id || (await getMyProfessional()).id;
    const items = await listProfessionalTickets(professionalId);
    setTickets(items);
  }

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    void load()
      .catch(() => {
        if (!cancelled) setError("Could not load tickets.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, isAuthenticated, user?.professional_id]);

  async function setStatus(
    ticketId: string,
    status: "in_progress" | "completed",
  ) {
    setBusyId(ticketId);
    setError("");
    try {
      await updateTicketStatus(ticketId, status);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not update status.");
    } finally {
      setBusyId("");
    }
  }

  if (!authLoading && !isAuthenticated) {
    return (
      <PageShell title="Professional tickets">
        <EmptyState
          title="Sign in required"
          description="Log in as a professional to manage tickets."
        />
        <div className="mt-4">
          <Link href="/login?next=/dashboard/professional/tickets">
            <Button>Login</Button>
          </Link>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell title="Professional tickets">
      {error ? (
        <p className="mb-4 text-base font-semibold text-danger">{error}</p>
      ) : null}
      {loading ? (
        <TicketListSkeleton count={5} />
      ) : tickets.length === 0 ? (
        <EmptyState
          title="No tickets yet"
          description="When customers request your services, manage statuses from this list."
        />
      ) : (
        <div className="space-y-3">
          {tickets.map((ticket) => (
            <div key={ticket.id} className="ui-card p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <Link href={`/tickets/${ticket.id}`} className="min-w-0">
                  <p className="text-lg font-bold text-black">
                    {ticket.issue_summary ||
                      ticket.customer_name ||
                      `Ticket ${ticket.id.slice(0, 8)}`}
                  </p>
                  <p className="mt-1 text-sm font-medium text-muted">
                    {String(ticket.status || "open").replaceAll("_", " ")}
                  </p>
                </Link>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    disabled={busyId === ticket.id}
                    onClick={() => void setStatus(ticket.id, "in_progress")}
                  >
                    Mark in progress
                  </Button>
                  <Button
                    variant="outline"
                    disabled={busyId === ticket.id}
                    onClick={() => void setStatus(ticket.id, "completed")}
                  >
                    Mark completed
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </PageShell>
  );
}
