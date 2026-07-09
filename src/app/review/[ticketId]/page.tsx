"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState, PageShell } from "@/components/ui/primitives";
import { useAuth } from "@/components/providers/auth-provider";
import { createOneOffReview } from "@/lib/api/auth-client";
import { ApiError } from "@/lib/api/types";

export default function ReviewPage() {
  const { ticketId } = useParams<{ ticketId: string }>();
  const { isAuthenticated, loading } = useAuth();
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [proof, setProof] = useState<File | null>(null);

  const ratings = useMemo(
    () =>
      [
        { key: "price", label: "Price" },
        { key: "time", label: "Time" },
        { key: "quality", label: "Quality" },
      ] as const,
    [],
  );

  if (!loading && !isAuthenticated) {
    return (
      <PageShell title="Leave a verified review">
        <EmptyState
          title="Sign in required"
          description="Log in as a customer to leave a review for this ticket."
        />
        <div className="mt-4">
          <Link href={`/login?next=/review/${ticketId}`}>
            <Button>Login</Button>
          </Link>
        </div>
      </PageShell>
    );
  }

  if (submitted) {
    return (
      <PageShell title="Review submitted">
        <div className="mx-auto max-w-md ui-card p-8 text-center">
          <h2 className="text-2xl text-black">Review submitted</h2>
          <p className="mt-3 text-sm text-muted">
            Thanks — your review is linked to this completed ticket.
          </p>
          <Link href="/dashboard/customer" className="mt-6 inline-block">
            <Button>Back to dashboard</Button>
          </Link>
        </div>
      </PageShell>
    );
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);
    const price = Number(form.get("price") || 0);
    const time = Number(form.get("time") || 0);
    const quality = Number(form.get("quality") || 0);
    const comment = String(form.get("review") || "").trim();

    if (!price || !time || !quality) {
      setError("Please rate price, time, and quality.");
      return;
    }

    // API currently accepts a single overall rating — average the three.
    const rating = Math.round((price + time + quality) / 3);

    setPending(true);
    try {
      await createOneOffReview({
        ticketId,
        rating,
        comment,
        proof,
      });
      setSubmitted(true);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Could not submit review. Please try again.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <PageShell title="Leave a verified review">
      <div className="mx-auto max-w-xl ui-card p-6 sm:p-8">
        <form className="space-y-4" onSubmit={onSubmit}>
          {ratings.map((item) => (
            <label key={item.key} className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium">
                {item.label} rating <span className="text-danger">*</span>
              </span>
              <select
                name={item.key}
                required
                className="field-surface w-full text-foreground outline-none"
                defaultValue=""
              >
                <option value="" disabled>
                  Select 1–5
                </option>
                {[1, 2, 3, 4, 5].map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </label>
          ))}
          <Textarea
            label="Written review"
            name="review"
            required
            placeholder="Share your experience..."
          />
          <div>
            <p className="mb-1.5 text-sm font-medium">Proof upload</p>
            <input
              type="file"
              accept="image/*,application/pdf"
              onChange={(event) =>
                setProof(event.target.files?.[0] || null)
              }
              className="block w-full text-sm"
            />
          </div>
          {error ? (
            <p className="text-base font-semibold text-danger">{error}</p>
          ) : null}
          <Button type="submit" className="w-full" size="lg" disabled={pending}>
            {pending ? "Submitting…" : "Submit review"}
          </Button>
        </form>
      </div>
    </PageShell>
  );
}
