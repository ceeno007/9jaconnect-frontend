"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState, PageShell } from "@/components/ui/primitives";
import { PageBlockSkeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/components/providers/auth-provider";
import {
  endArrangement,
  getArrangement,
  listMessages,
  sendArrangementMessage,
  updateArrangementInterval,
} from "@/lib/api/auth-client";
import type { ChatMessage, ProfessionalArrangement } from "@/lib/api/types";
import { ApiError } from "@/lib/api/types";

const INTERVAL_OPTIONS = [
  { label: "Weekly", value: "weekly" },
  { label: "Biweekly", value: "biweekly" },
  { label: "Monthly", value: "monthly" },
  { label: "Quarterly", value: "quarterly" },
];

export default function ArrangementDetailPage() {
  const { arrangementId } = useParams<{ arrangementId: string }>();
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [arrangement, setArrangement] = useState<ProfessionalArrangement | null>(
    null,
  );
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [message, setMessage] = useState("");
  const [interval, setIntervalValue] = useState("monthly");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const conversationId = useMemo(
    () =>
      (arrangement?.conversation_id as string | undefined) ||
      (typeof arrangement?.conversation === "object" &&
      arrangement.conversation &&
      "id" in (arrangement.conversation as object)
        ? String((arrangement.conversation as { id: string }).id)
        : ""),
    [arrangement],
  );

  const isCustomer = user?.user_type === "customer";
  const ended = String(arrangement?.status || "").toLowerCase() === "ended";

  async function reload() {
    const next = await getArrangement(arrangementId);
    setArrangement(next);
    setIntervalValue(String(next.review_interval || "monthly"));
    const convId =
      (next.conversation_id as string | undefined) ||
      (typeof next.conversation === "object" &&
      next.conversation &&
      "id" in (next.conversation as object)
        ? String((next.conversation as { id: string }).id)
        : "");
    if (convId) {
      setMessages(await listMessages(convId));
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
        if (!cancelled) setError("Could not load arrangement.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, isAuthenticated, arrangementId]);

  async function onSend(event: FormEvent) {
    event.preventDefault();
    if (!message.trim()) return;
    setPending(true);
    setError("");
    try {
      await sendArrangementMessage(arrangementId, message.trim());
      setMessage("");
      await reload();
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Could not send message.",
      );
    } finally {
      setPending(false);
    }
  }

  async function onUpdateInterval(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setError("");
    try {
      await updateArrangementInterval(arrangementId, interval);
      await reload();
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Could not update interval.",
      );
    } finally {
      setPending(false);
    }
  }

  async function onEnd() {
    if (!window.confirm("End this recurring arrangement?")) return;
    setPending(true);
    setError("");
    try {
      await endArrangement(arrangementId);
      await reload();
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Could not end arrangement.",
      );
    } finally {
      setPending(false);
    }
  }

  if (!authLoading && !isAuthenticated) {
    return (
      <PageShell title="Arrangement">
        <EmptyState
          title="Sign in required"
          description="Log in to view this arrangement."
        >
          <Link href={`/login?next=/arrangements/${arrangementId}`}>
            <Button>Login</Button>
          </Link>
        </EmptyState>
      </PageShell>
    );
  }

  if (loading) {
    return (
      <PageShell title="Arrangement">
        <PageBlockSkeleton />
      </PageShell>
    );
  }

  if (!arrangement) {
    return (
      <PageShell title="Arrangement">
        <EmptyState
          title="Arrangement not found"
          description={error || "This arrangement may have been removed."}
        />
      </PageShell>
    );
  }

  const title =
    arrangement.service_summary ||
    arrangement.title ||
    arrangement.service_name ||
    arrangement.business_name ||
    "Recurring arrangement";

  return (
    <PageShell
      title={title}
      description={
        arrangement.business_name ||
        arrangement.professional_name ||
        "Recurring service arrangement"
      }
      actions={
        <Button variant="outline" onClick={() => router.back()}>
          Back
        </Button>
      }
    >
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="ui-card space-y-4 p-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-[#f4f4f5] px-3 py-1 text-xs font-bold uppercase tracking-wide text-black">
              {String(arrangement.status || "active").replaceAll("_", " ")}
            </span>
            {arrangement.review_interval ? (
              <span className="text-sm font-medium text-muted">
                Review every {String(arrangement.review_interval)}
              </span>
            ) : null}
          </div>
          <p className="text-base font-medium leading-relaxed text-muted">
            {arrangement.service_description || "No description provided."}
          </p>
          {arrangement.start_date ? (
            <p className="text-sm font-medium text-muted">
              Started {String(arrangement.start_date).slice(0, 10)}
            </p>
          ) : null}

          {isCustomer && !ended ? (
            <div className="space-y-4 border-t border-[#ececee] pt-4">
              <form className="space-y-3" onSubmit={onUpdateInterval}>
                <Select
                  label="Review interval"
                  name="interval"
                  value={interval}
                  onChange={(e) => setIntervalValue(e.target.value)}
                  options={INTERVAL_OPTIONS}
                />
                <Button type="submit" disabled={pending}>
                  Update interval
                </Button>
              </form>
              <Button
                type="button"
                variant="outline"
                disabled={pending}
                onClick={() => void onEnd()}
              >
                End arrangement
              </Button>
              <Link
                href={`/review/arrangement/${arrangementId}`}
                className="inline-block text-sm font-bold text-black hover:underline"
              >
                Leave a recurring review
              </Link>
            </div>
          ) : null}
        </section>

        <section className="ui-card flex min-h-[420px] flex-col p-6">
          <h2 className="text-xl font-bold text-black">Messages</h2>
          <div className="mt-4 flex-1 space-y-3 overflow-y-auto">
            {messages.length === 0 ? (
              <p className="text-sm font-medium text-muted">
                No messages yet.
                {!conversationId
                  ? " Send a message to start the conversation."
                  : ""}
              </p>
            ) : (
              messages.map((item) => (
                <div
                  key={item.id}
                  className="rounded-[12px] bg-[#fafafa] px-4 py-3"
                >
                  <p className="text-sm font-bold text-black">
                    {item.sender_name || "Participant"}
                  </p>
                  <p className="mt-1 text-sm font-medium text-muted">
                    {item.body}
                  </p>
                </div>
              ))
            )}
          </div>
          {!ended ? (
            <form className="mt-4 space-y-3" onSubmit={onSend}>
              <Textarea
                label="Message"
                name="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
              />
              {error ? (
                <p className="text-sm font-semibold text-danger">{error}</p>
              ) : null}
              <Button type="submit" disabled={pending} className="w-full">
                {pending ? "Sending…" : "Send message"}
              </Button>
            </form>
          ) : null}
        </section>
      </div>
    </PageShell>
  );
}
