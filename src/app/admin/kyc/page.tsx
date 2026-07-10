"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/toast";
import {
  adminKycDocumentUrl,
  approveCustomerKyc,
  displayName,
  getAdminAccessToken,
  listPendingKyc,
  rejectCustomerKyc,
} from "@/lib/api/admin-client";
import { ApiError } from "@/lib/api/types";

export default function AdminKycPage() {
  const toast = useToast();
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pendingId, setPendingId] = useState("");

  async function refresh() {
    setLoading(true);
    setError("");
    try {
      setItems(await listPendingKyc({ page: 1, page_size: 50 }));
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Could not load KYC queue.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  async function openDocument(userId: string) {
    const token = getAdminAccessToken();
    try {
      const response = await fetch(adminKycDocumentUrl(userId), {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (!response.ok) throw new Error("Download failed");
      const blob = await response.blob();
      window.open(URL.createObjectURL(blob), "_blank", "noopener,noreferrer");
    } catch {
      toast.error("Could not open KYC document.");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-black">Customer KYC</h1>
        <p className="mt-2 text-base font-medium text-muted">
          Approve or reject pending customer identity checks.
        </p>
      </div>

      {loading ? (
        <p className="text-sm font-medium text-muted">Loading…</p>
      ) : error ? (
        <EmptyState title="Could not load KYC" description={error}>
          <Button onClick={() => void refresh()}>Retry</Button>
        </EmptyState>
      ) : items.length === 0 ? (
        <EmptyState title="No pending KYC" />
      ) : (
        <div className="space-y-4">
          {items.map((item) => {
            const userId = String(item.user_id || item.id || "");
            return (
              <article key={userId || displayName(item)} className="ui-card p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-black">
                      {displayName(item)}
                    </h2>
                    <p className="mt-1 text-sm text-muted">
                      {String(item.email || item.status || "")}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={!userId}
                      onClick={() => void openDocument(userId)}
                    >
                      View document
                    </Button>
                    <Button
                      size="sm"
                      disabled={!userId || pendingId === userId}
                      onClick={() => {
                        setPendingId(userId);
                        void approveCustomerKyc(userId)
                          .then(async () => {
                            toast.success("KYC approved");
                            await refresh();
                          })
                          .catch((err) =>
                            toast.error(
                              err instanceof ApiError
                                ? err.message
                                : "Approve failed.",
                            ),
                          )
                          .finally(() => setPendingId(""));
                      }}
                    >
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      disabled={!userId || pendingId === userId}
                      onClick={() => {
                        const reason = window.prompt("Reject reason");
                        if (!reason?.trim()) return;
                        setPendingId(userId);
                        void rejectCustomerKyc(userId, reason.trim())
                          .then(async () => {
                            toast.success("KYC rejected");
                            await refresh();
                          })
                          .catch((err) =>
                            toast.error(
                              err instanceof ApiError
                                ? err.message
                                : "Reject failed.",
                            ),
                          )
                          .finally(() => setPendingId(""));
                      }}
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
