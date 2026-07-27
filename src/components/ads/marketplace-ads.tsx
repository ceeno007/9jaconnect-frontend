"use client";

import { useEffect, useState } from "react";
import { listAds } from "@/lib/api";
import type { AdSlot } from "@/lib/api/types";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

function activeSlots(items: AdSlot[], pageContext?: string) {
  return items
    .filter((item) => item.is_active !== false)
    .filter((item) => {
      if (!pageContext) return true;
      const context = String(item.page_context || "").toLowerCase();
      return !context || context === pageContext.toLowerCase();
    })
    .sort(
      (a, b) => Number(a.display_order || 0) - Number(b.display_order || 0),
    );
}

export function MarketplaceAds({
  pageContext,
  className,
}: {
  pageContext?: string;
  className?: string;
}) {
  const [slots, setSlots] = useState<AdSlot[]>([]);

  useEffect(() => {
    let cancelled = false;
    void listAds()
      .then((items) => {
        if (!cancelled) setSlots(activeSlots(items, pageContext));
      })
      .catch(() => {
        if (!cancelled) setSlots([]);
      });
    return () => {
      cancelled = true;
    };
  }, [pageContext]);

  useEffect(() => {
    const filled = slots.filter((slot) =>
      Boolean(String(slot.adsense_slot_id || "").trim()),
    );
    if (!filled.length) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // AdSense may be blocked; ignore.
    }
  }, [slots]);

  const renderable = slots.filter((slot) =>
    Boolean(String(slot.adsense_slot_id || "").trim()),
  );
  const clientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || "";
  if (!clientId || !renderable.length) return null;

  return (
    <div className={className}>
      {renderable.slice(0, 2).map((slot) => {
        const id = String(slot.id || slot.ad_slot_id || slot.adsense_slot_id);
        return (
          <div
            key={id}
            className="overflow-hidden rounded-[12px] border border-[#ececee] bg-[#fafafa] px-3 py-4"
          >
            <ins
              className="adsbygoogle"
              style={{ display: "block" }}
              data-ad-client={clientId}
              data-ad-slot={String(slot.adsense_slot_id)}
              data-ad-format="auto"
              data-full-width-responsive="true"
            />
          </div>
        );
      })}
    </div>
  );
}
