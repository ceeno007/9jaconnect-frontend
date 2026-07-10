"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/toast";
import {
  displayName,
  listAdminReviewFlags,
  removeAdminReview,
} from "@/lib/api/admin-client";
import { ApiError } from "@/lib/api/types";

export default function AdminReviewsPage() {
  const toast = useToast();
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pendingId, setPendingId] = useState("");

  async function refresh() {
    setLoading(true);
    setError("");
    try {
      setItems(await listAdminReviewFlags());
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Could not load review flags.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  async function onRemove(reviewId: string) {
    const reason = window.prompt("Reason for removing this review");
    if (!reason?.trim()) return;
    setPendingId(reviewId);
    try {
      await removeAdminReview(reviewId, reason.trim());
      toast.success("Review removed");
      await refresh();
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : "Could not remove review.",
      );
    } finally {
      setPendingId("");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-black">Review moderation</h1>
        <p className="mt-2 text-base font-medium text-muted">
          Review flagged content and remove reviews that break the rules.
        </p>
      </div>

      {loading ? (
        <p className="text-sm font-medium text-muted">Loading…</p>
      ) : error ? (
        <EmptyState title="Could not load flags" description={error}>
          <Button onClick={() => void refresh()}>Retry</Button>
        </EmptyState>
      ) : items.length === 0 ? (
        <EmptyState
          title="No flagged reviews"
          description="Flagged reviews will appear here for moderation."
        />
      ) : (
        <div className="space-y-4">
          {items.map((item) => {
            const reviewId = String(
              item.review_id || item.id || item.entity_id || "",
            );
            return (
              <article key={reviewId || displayName(item)} className="ui-card p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-black">
                      {displayName(item)}
                    </h2>
                    <p className="mt-1 text-sm text-muted">
                      {String(item.reason || item.flag_reason || "Flagged")}
                    </p>
                    <p className="mt-3 text-sm font-medium text-black">
                      {String(
                        item.comment ||
                          item.excerpt ||
                          item.body ||
                          item.review_text ||
                          "",
                      )}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="danger"
                    disabled={!reviewId || pendingId === reviewId}
                    onClick={() => void onRemove(reviewId)}
                  >
                    Remove
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
