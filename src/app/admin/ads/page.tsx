"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/toast";
import { displayName, listAdminAds, updateAdminAd } from "@/lib/api/admin-client";
import { ApiError } from "@/lib/api/types";

export default function AdminAdsPage() {
  const toast = useToast();
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pendingId, setPendingId] = useState("");

  async function refresh() {
    setLoading(true);
    setError("");
    try {
      setItems(await listAdminAds());
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Could not load ad slots.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  async function saveSlot(item: Record<string, unknown>, form: FormData) {
    const id = String(item.id || item.ad_slot_id || "");
    if (!id) return;
    setPendingId(id);
    try {
      await updateAdminAd(id, {
        adsense_slot_id: String(form.get("adsense_slot_id") || "") || null,
        is_active: form.get("is_active") === "on",
        display_order: Number(form.get("display_order") || 0),
      });
      toast.success("Ad slot updated");
      await refresh();
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : "Could not update ad slot.",
      );
    } finally {
      setPendingId("");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-black">Ads</h1>
        <p className="mt-2 text-base font-medium text-muted">
          Manage AdSense slot configuration for marketplace placements.
        </p>
      </div>

      {loading ? (
        <p className="text-sm font-medium text-muted">Loading…</p>
      ) : error ? (
        <EmptyState title="Could not load ads" description={error}>
          <Button onClick={() => void refresh()}>Retry</Button>
        </EmptyState>
      ) : items.length === 0 ? (
        <EmptyState title="No ad slots found" />
      ) : (
        <div className="space-y-4">
          {items.map((item) => {
            const id = String(item.id || item.ad_slot_id || "");
            return (
              <form
                key={id || displayName(item)}
                className="ui-card grid gap-4 p-5 sm:grid-cols-2"
                onSubmit={(event) => {
                  event.preventDefault();
                  void saveSlot(item, new FormData(event.currentTarget));
                }}
              >
                <div className="sm:col-span-2">
                  <p className="font-bold text-black">{displayName(item)}</p>
                  <p className="text-sm text-muted">
                    {String(item.page_context || item.context || id)}
                  </p>
                </div>
                <Input
                  label="AdSense slot ID"
                  name="adsense_slot_id"
                  defaultValue={String(item.adsense_slot_id || "")}
                />
                <Input
                  label="Display order"
                  name="display_order"
                  type="number"
                  defaultValue={Number(item.display_order || 0)}
                />
                <label className="flex items-center gap-2 text-sm font-bold text-black">
                  <input
                    type="checkbox"
                    name="is_active"
                    defaultChecked={Boolean(item.is_active)}
                  />
                  Active
                </label>
                <div className="flex items-end">
                  <Button type="submit" disabled={pendingId === id}>
                    Save
                  </Button>
                </div>
              </form>
            );
          })}
        </div>
      )}
    </div>
  );
}
