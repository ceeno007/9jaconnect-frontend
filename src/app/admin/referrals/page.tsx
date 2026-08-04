"use client";

import { FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/toast";
import {
  getReferralSummary,
  getReferralTree,
  markReferralPaid,
  readStatNumber,
} from "@/lib/api/admin-client";
import { ApiError } from "@/lib/api/types";

export default function AdminReferralsPage() {
  const toast = useToast();
  const [summary, setSummary] = useState<Record<string, unknown>>({});
  const [tree, setTree] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void getReferralSummary()
      .then((data) => {
        if (!cancelled) setSummary(data || {});
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err instanceof ApiError
              ? err.message
              : "Could not load referral summary.",
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

  async function onLoadTree(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    const form = new FormData(event.currentTarget);
    const professionalId = String(form.get("professional_id") || "").trim();
    try {
      setTree(await getReferralTree(professionalId));
      toast.success("Referral tree loaded");
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : "Could not load tree.",
      );
    } finally {
      setPending(false);
    }
  }

  async function onMarkPaid(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    const form = new FormData(event.currentTarget);
    const professionalId = String(form.get("professional_id") || "").trim();
    try {
      await markReferralPaid(professionalId);
      toast.success("Marked as paid");
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : "Could not mark paid.",
      );
    } finally {
      setPending(false);
    }
  }

  const cards = [
    {
      label: "Total referrals",
      value: readStatNumber(summary, [
        "total_referrals",
        "referrals",
        "count",
      ]),
    },
    {
      label: "Pending payouts",
      value: readStatNumber(summary, [
        "pending_payouts",
        "unpaid",
        "pending",
      ]),
    },
    {
      label: "Paid",
      value: readStatNumber(summary, ["paid", "paid_count"]),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-black">Referrals</h1>
        <p className="mt-2 text-base font-medium text-muted">
          Summary, referral trees, and payout marking.
        </p>
      </div>

      {loading ? (
        <p className="text-sm font-medium text-muted">Loading summary…</p>
      ) : error ? (
        <EmptyState title="Summary unavailable" description={error} />
      ) : (
        <div className="grid gap-3 sm:grid-cols-3">
          {cards.map((card) => (
            <div key={card.label} className="ui-card p-5 text-center">
              <p className="text-2xl font-bold text-black">
                {card.value == null ? "-" : card.value.toLocaleString()}
              </p>
              <p className="mt-1 text-xs font-semibold text-muted">
                {card.label}
              </p>
            </div>
          ))}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="ui-card p-6">
          <h2 className="text-xl font-bold text-black">Referral tree</h2>
          <form className="mt-4 space-y-4" onSubmit={onLoadTree}>
            <Input
              label="Professional ID"
              name="professional_id"
              required
            />
            <Button type="submit" disabled={pending}>
              Load tree
            </Button>
          </form>
          {tree ? (
            <pre className="mt-4 overflow-auto rounded-[12px] bg-[#fafafa] p-4 text-xs">
              {JSON.stringify(tree, null, 2)}
            </pre>
          ) : null}
        </section>

        <section className="ui-card p-6">
          <h2 className="text-xl font-bold text-black">Mark paid</h2>
          <form className="mt-4 space-y-4" onSubmit={onMarkPaid}>
            <Input
              label="Professional ID"
              name="professional_id"
              required
            />
            <Button type="submit" disabled={pending}>
              Mark paid
            </Button>
          </form>
        </section>
      </div>
    </div>
  );
}
