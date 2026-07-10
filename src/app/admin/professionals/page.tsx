"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/toast";
import {
  displayName,
  listAdminProfessionals,
  updateAdminProfessionalStatus,
  updateAdminProfessionalTrustBadge,
  type AdminProfessionalStatus,
} from "@/lib/api/admin-client";
import { ApiError } from "@/lib/api/types";

function statusOf(item: Record<string, unknown>) {
  return String(item.status || item.listing_status || "unknown");
}

export default function AdminProfessionalsPage() {
  const toast = useToast();
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pendingId, setPendingId] = useState("");

  async function refresh() {
    setLoading(true);
    setError("");
    try {
      setItems(await listAdminProfessionals());
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Could not load professionals.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) =>
      JSON.stringify(item).toLowerCase().includes(q),
    );
  }, [items, query]);

  async function setStatus(id: string, status: AdminProfessionalStatus) {
    setPendingId(id);
    try {
      await updateAdminProfessionalStatus(id, status);
      toast.success(`Professional marked ${status.replace("_", " ")}`);
      await refresh();
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : "Could not update status.",
      );
    } finally {
      setPendingId("");
    }
  }

  async function setTrust(id: string, isAwarded: boolean) {
    const reason = window.prompt(
      isAwarded ? "Reason for awarding trust badge" : "Reason for removing trust badge",
    );
    if (!reason?.trim()) return;
    setPendingId(id);
    try {
      await updateAdminProfessionalTrustBadge(id, {
        is_awarded: isAwarded,
        reason: reason.trim(),
      });
      toast.success(isAwarded ? "Trust badge awarded" : "Trust badge removed");
      await refresh();
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : "Could not update trust badge.",
      );
    } finally {
      setPendingId("");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-black">Manage professionals</h1>
        <p className="mt-2 text-base font-medium text-muted">
          Approve, suspend, or award trust badges.
        </p>
      </div>

      <div className="max-w-sm">
        <Input
          label="Search professionals"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Name, trade, category..."
        />
      </div>

      {loading ? (
        <p className="text-sm font-medium text-muted">Loading…</p>
      ) : error ? (
        <EmptyState title="Could not load professionals" description={error}>
          <Button onClick={() => void refresh()}>Retry</Button>
        </EmptyState>
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No professionals found"
          description="Try another search or check back later."
        />
      ) : (
        <div className="overflow-hidden ui-card">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#fafafa] text-muted">
              <tr>
                <th className="px-4 py-3 font-bold">Professional</th>
                <th className="px-4 py-3 font-bold">Status</th>
                <th className="px-4 py-3 font-bold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => {
                const id = String(item.id || "");
                const busy = pendingId === id;
                return (
                  <tr key={id || displayName(item)} className="border-t border-[#eee]">
                    <td className="px-4 py-4">
                      <p className="font-bold text-black">{displayName(item)}</p>
                      <p className="text-muted">
                        {String(
                          item.category_name ||
                            item.email ||
                            item.subcategory_name ||
                            "",
                        )}
                      </p>
                    </td>
                    <td className="px-4 py-4 font-semibold">
                      {statusOf(item)}
                      {item.has_trust_badge || item.trust_badge ? " · trust" : ""}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={busy || !id}
                          onClick={() => void setStatus(id, "active")}
                        >
                          Activate
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={busy || !id}
                          onClick={() => void setStatus(id, "pending_review")}
                        >
                          Pending
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          disabled={busy || !id}
                          onClick={() => void setStatus(id, "suspended")}
                        >
                          Suspend
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={busy || !id}
                          onClick={() => void setTrust(id, true)}
                        >
                          Trust on
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={busy || !id}
                          onClick={() => void setTrust(id, false)}
                        >
                          Trust off
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
