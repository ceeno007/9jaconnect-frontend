"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/toast";
import {
  adminVerificationFileUrl,
  approveVerification,
  displayName,
  getAdminAccessToken,
  listPendingVerifications,
  rejectVerification,
} from "@/lib/api/admin-client";
import { ApiError } from "@/lib/api/types";

export default function AdminVerificationsPage() {
  const toast = useToast();
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pendingId, setPendingId] = useState("");

  async function refresh() {
    setLoading(true);
    setError("");
    try {
      setItems(await listPendingVerifications());
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Could not load verifications.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  async function openFile(id: string) {
    const token = getAdminAccessToken();
    const url = adminVerificationFileUrl(id);
    try {
      const response = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (!response.ok) throw new Error("Download failed");
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      window.open(objectUrl, "_blank", "noopener,noreferrer");
    } catch {
      toast.error("Could not open verification file.");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-black">Pending verifications</h1>
        <p className="mt-2 text-base font-medium text-muted">
          Review professional verification documents.
        </p>
      </div>

      {loading ? (
        <p className="text-sm font-medium text-muted">Loading…</p>
      ) : error ? (
        <EmptyState title="Could not load verifications" description={error}>
          <Button onClick={() => void refresh()}>Retry</Button>
        </EmptyState>
      ) : items.length === 0 ? (
        <EmptyState title="No pending verifications" />
      ) : (
        <div className="space-y-4">
          {items.map((item) => {
            const id = String(item.id || item.verification_id || "");
            return (
              <article key={id || displayName(item)} className="ui-card p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-black">
                      {displayName(item)}
                    </h2>
                    <p className="mt-1 text-sm text-muted">
                      {String(
                        item.document_type ||
                          item.doc_type ||
                          item.type ||
                          "Document",
                      )}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={!id}
                      onClick={() => void openFile(id)}
                    >
                      View file
                    </Button>
                    <Button
                      size="sm"
                      disabled={!id || pendingId === id}
                      onClick={() => {
                        setPendingId(id);
                        void approveVerification(id)
                          .then(async () => {
                            toast.success("Verification approved");
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
                      disabled={!id || pendingId === id}
                      onClick={() => {
                        const reason = window.prompt("Reject reason");
                        if (!reason?.trim()) return;
                        setPendingId(id);
                        void rejectVerification(id, reason.trim())
                          .then(async () => {
                            toast.success("Verification rejected");
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
