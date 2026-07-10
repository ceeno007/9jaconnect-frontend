"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge, EmptyState, PageShell } from "@/components/ui/primitives";
import { PageBlockSkeleton, Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/components/providers/auth-provider";
import {
  confirmTicketQuote,
  disputeTicket,
  getTicket,
  listMessages,
  sendTicketMessage,
  submitTicketQuote,
  updateTicketStatus,
} from "@/lib/api/auth-client";
import type { ChatMessage, ServiceTicket } from "@/lib/api/types";
import { ApiError } from "@/lib/api/types";
import { nairaToKobo } from "@/lib/api/mappers";

export default function TicketDetailPage() {
  const { ticketId } = useParams<{ ticketId: string }>();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [ticket, setTicket] = useState<ServiceTicket | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [message, setMessage] = useState("");
  const [quoteNaira, setQuoteNaira] = useState("");
  const [quoteNote, setQuoteNote] = useState("");
  const [disputeReason, setDisputeReason] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const isPro = user?.user_type === "professional";
  const conversationId = useMemo(
    () =>
      (ticket?.conversation_id as string | undefined) ||
      (typeof ticket?.conversation === "object" &&
      ticket.conversation &&
      "id" in (ticket.conversation as object)
        ? String((ticket.conversation as { id: string }).id)
        : ""),
    [ticket],
  );

  async function reload() {
    const next = await getTicket(ticketId);
    setTicket(next);
    const convId =
      (next.conversation_id as string | undefined) ||
      (typeof next.conversation === "object" &&
      next.conversation &&
      "id" in (next.conversation as object)
        ? String((next.conversation as { id: string }).id)
        : "");
    if (convId) {
      const thread = await listMessages(convId);
      setMessages(thread);
    } else {
      setMessages([]);
    }
  }

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    void reload()
      .catch(() => {
        if (!cancelled) setError("Could not load ticket.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, isAuthenticated, ticketId]);

  async function onSend(event: FormEvent) {
    event.preventDefault();
    if (!message.trim()) return;
    setPending(true);
    setError("");
    try {
      await sendTicketMessage(ticketId, message.trim());
      setMessage("");
      await reload();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not send message.");
    } finally {
      setPending(false);
    }
  }

  if (!authLoading && !isAuthenticated) {
    return (
      <PageShell title="Ticket">
        <EmptyState
          title="Sign in required"
          description="Log in to view this ticket and message thread."
        />
        <div className="mt-4">
          <Link href={`/login?next=/tickets/${ticketId}`}>
            <Button>Login</Button>
          </Link>
        </div>
      </PageShell>
    );
  }

  if (loading) {
    return (
      <PageShell title="Ticket">
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <PageBlockSkeleton />
          <div className="ui-card space-y-4 p-7">
            <Skeleton className="h-7 w-32" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </PageShell>
    );
  }

  if (!ticket) {
    return (
      <PageShell title="Ticket">
        <EmptyState
          title="Ticket not found"
          description={error || "This ticket may have been removed."}
        />
      </PageShell>
    );
  }

  const status = String(ticket.status || "open");

  return (
    <PageShell
      title={ticket.issue_summary || `Ticket ${ticket.id.slice(0, 8)}`}
      actions={
        <Badge className="bg-neutral-100 text-black">
          {status.replaceAll("_", " ")}
        </Badge>
      }
    >
      {error ? (
        <p className="mb-4 text-base font-semibold text-danger">{error}</p>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="space-y-6">
          <div className="ui-card p-7">
            <h2 className="text-2xl font-bold text-foreground">Ticket details</h2>
            <dl className="mt-5 space-y-4 text-base">
              <div>
                <dt className="font-semibold text-muted">Status</dt>
                <dd className="mt-1 font-bold">{status.replaceAll("_", " ")}</dd>
              </div>
              <div>
                <dt className="font-semibold text-muted">Summary</dt>
                <dd className="mt-1 font-bold">
                  {ticket.issue_summary || "-"}
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-muted">Description</dt>
                <dd className="mt-1 font-medium text-muted">
                  {ticket.issue_description || "-"}
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-muted">Category</dt>
                <dd className="mt-1 font-bold">
                  {ticket.category_name || "-"}
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-muted">Location</dt>
                <dd className="mt-1 font-bold">
                  {[ticket.state_name, ticket.lga_name]
                    .filter(Boolean)
                    .join(", ") || "-"}
                </dd>
              </div>
              {ticket.quote_amount_kobo ? (
                <div>
                  <dt className="font-semibold text-muted">Quote</dt>
                  <dd className="mt-1 font-bold">
                    ₦{Math.round(Number(ticket.quote_amount_kobo) / 100).toLocaleString()}
                  </dd>
                </div>
              ) : null}
            </dl>
          </div>

          {isPro ? (
            <div className="ui-card space-y-4 p-7">
              <h2 className="text-2xl font-bold">Manage ticket</h2>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  disabled={pending}
                  onClick={() =>
                    void updateTicketStatus(ticketId, "in_progress")
                      .then(reload)
                      .catch((err) =>
                        setError(
                          err instanceof ApiError
                            ? err.message
                            : "Could not update status.",
                        ),
                      )
                  }
                >
                  Mark in progress
                </Button>
                <Button
                  variant="outline"
                  disabled={pending}
                  onClick={() =>
                    void updateTicketStatus(ticketId, "completed")
                      .then(reload)
                      .catch((err) =>
                        setError(
                          err instanceof ApiError
                            ? err.message
                            : "Could not update status.",
                        ),
                      )
                  }
                >
                  Mark completed
                </Button>
              </div>
              <form
                className="space-y-3"
                onSubmit={(event) => {
                  event.preventDefault();
                  const amount = Number(quoteNaira);
                  if (!amount) return;
                  setPending(true);
                  void submitTicketQuote(
                    ticketId,
                    nairaToKobo(amount),
                    quoteNote,
                  )
                    .then(reload)
                    .catch((err) =>
                      setError(
                        err instanceof ApiError
                          ? err.message
                          : "Could not submit quote.",
                      ),
                    )
                    .finally(() => setPending(false));
                }}
              >
                <Input
                  label="Quote amount (₦)"
                  type="number"
                  min={1}
                  value={quoteNaira}
                  onChange={(e) => setQuoteNaira(e.target.value)}
                  required
                />
                <Textarea
                  label="Quote note"
                  value={quoteNote}
                  onChange={(e) => setQuoteNote(e.target.value)}
                />
                <Button type="submit" disabled={pending}>
                  Send quote
                </Button>
              </form>
            </div>
          ) : (
            <div className="ui-card space-y-4 p-7">
              <h2 className="text-2xl font-bold">Customer actions</h2>
              {ticket.quote_amount_kobo ? (
                <Button
                  disabled={pending}
                  onClick={() => {
                    setPending(true);
                    void confirmTicketQuote(ticketId)
                      .then(reload)
                      .catch((err) =>
                        setError(
                          err instanceof ApiError
                            ? err.message
                            : "Could not confirm quote.",
                        ),
                      )
                      .finally(() => setPending(false));
                  }}
                >
                  Confirm quote
                </Button>
              ) : null}
              {status.toLowerCase() === "completed" ? (
                <Link href={`/review/${ticketId}`}>
                  <Button variant="outline">Leave a review</Button>
                </Link>
              ) : null}
              <form
                className="space-y-3"
                onSubmit={(event) => {
                  event.preventDefault();
                  if (!disputeReason.trim()) return;
                  setPending(true);
                  void disputeTicket(ticketId, disputeReason.trim())
                    .then(reload)
                    .catch((err) =>
                      setError(
                        err instanceof ApiError
                          ? err.message
                          : "Could not dispute ticket.",
                      ),
                    )
                    .finally(() => setPending(false));
                }}
              >
                <Textarea
                  label="Dispute reason"
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  required
                />
                <Button type="submit" variant="danger" disabled={pending}>
                  Open dispute
                </Button>
              </form>
            </div>
          )}
        </section>

        <section className="ui-card p-7">
          <h2 className="text-2xl font-bold text-foreground">Messages</h2>
          {!conversationId ? (
            <p className="mt-4 text-sm font-medium text-muted">
              Send the first message to start this conversation.
            </p>
          ) : null}
          <div className="mt-5 space-y-3">
            {messages.length === 0 ? (
              <p className="text-base font-medium text-muted">No messages yet.</p>
            ) : (
              messages.map((item) => (
                <div
                  key={item.id}
                  className="rounded-[var(--radius-lg)] bg-neutral-100 px-5 py-4"
                >
                  <p className="text-sm font-bold uppercase tracking-wide text-black">
                    {item.sender_name ||
                      (item.sender_id === user?.id ? "You" : "Participant")}
                  </p>
                  <p className="mt-2 text-base font-medium text-foreground">
                    {item.body}
                  </p>
                </div>
              ))
            )}
          </div>
          <form className="mt-5 flex gap-3" onSubmit={onSend}>
            <Input
              name="message"
              placeholder="Type a message and press Enter"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
            />
            <Button type="submit" size="lg" disabled={pending}>
              Send
            </Button>
          </form>
        </section>
      </div>
    </PageShell>
  );
}
