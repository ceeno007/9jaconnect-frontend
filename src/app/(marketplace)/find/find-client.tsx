"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { LayoutGrid, List } from "lucide-react";
import { motion } from "framer-motion";
import {
  ListingCard,
  ListingCardCompact,
} from "@/components/professionals/listing-card";
import { MarketplaceAds } from "@/components/ads/marketplace-ads";
import { EmptyState } from "@/components/ui/primitives";
import { listProfessionalsForSearch, type DirectorySort } from "@/lib/api";
import { mapDirectoryProfessional } from "@/lib/api/mappers";
import type { Professional } from "@/lib/types";
import { cn } from "@/lib/utils";

const SORT_OPTIONS: { label: string; value: DirectorySort }[] = [
  { label: "Recommended", value: "recommended" },
  { label: "Highest rated", value: "rating" },
  { label: "Newest", value: "recency" },
];

export default function FindPageClient() {
  const searchParams = useSearchParams();
  const stateId = searchParams.get("state") ?? "";
  const lgaId = searchParams.get("lga") ?? "";
  const categoryId = searchParams.get("category") ?? "";
  const keyword = (searchParams.get("keyword") ?? "").trim();
  const [view, setView] = useState<"grid" | "list">("grid");
  const [sort, setSort] = useState<DirectorySort>("recommended");
  const [results, setResults] = useState<Professional[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchNotice, setSearchNotice] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    setSearchNotice("");

    void listProfessionalsForSearch({
      query: keyword || undefined,
      state_id: stateId || undefined,
      lga_id: lgaId || undefined,
      category_id: categoryId || undefined,
      sort,
      page: 1,
      page_size: 48,
    })
      .then((data) => {
        if (cancelled) return;
        const mapped = data.professionals.map(mapDirectoryProfessional);
        setResults(mapped);
        setTotal(data.pagination.total);
        if (data.keywordSearchUnavailable && keyword) {
          setSearchNotice(
            `Keyword search is not live yet. Showing results for your location and category filters.`,
          );
        }
      })
      .catch(() => {
        if (cancelled) return;
        setResults([]);
        setTotal(0);
        setError("Could not load professionals. Please try again.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [stateId, lgaId, categoryId, keyword, sort]);

  const countLabel = useMemo(() => {
    if (loading) return null;
    return `${total} ${total === 1 ? "professional" : "professionals"} found`;
  }, [loading, total]);

  return (
    <motion.div
      initial={{ opacity: 0.35, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
      className="mx-auto max-w-7xl px-6 py-8 sm:px-6 lg:px-8"
    >
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-[32px] font-semibold tracking-normal text-obsidian sm:text-[40px]">
            Find Professionals
          </h1>
          {countLabel ? (
            <p className="mt-2 text-base font-medium text-muted">{countLabel}</p>
          ) : (
            <div className="mt-2 h-5 w-40 animate-pulse rounded-[8px] bg-[#f4f4f5]" />
          )}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label className="inline-flex items-center gap-2 text-sm font-bold text-muted">
            Sort
            <select
              name="sort"
              value={sort}
              onChange={(e) => setSort(e.target.value as DirectorySort)}
              className="h-10 appearance-none rounded-[8px] border border-[#ececee] bg-white bg-[length:16px_16px] bg-[right_12px_center] bg-no-repeat py-0 pl-3 pr-10 text-sm font-bold text-black outline-none"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23666666' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
              }}
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <div className="inline-flex overflow-hidden rounded-[8px] border border-[#ececee] bg-white">
            <button
              type="button"
              aria-label="Grid view"
              onClick={() => setView("grid")}
              className={cn(
                "inline-flex h-10 w-10 items-center justify-center",
                view === "grid" ? "bg-[#f4f4f5] text-black" : "text-muted",
              )}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="List view"
              onClick={() => setView("list")}
              className={cn(
                "inline-flex h-10 w-10 items-center justify-center border-l border-[#ececee]",
                view === "list" ? "bg-[#f4f4f5] text-black" : "text-muted",
              )}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {searchNotice ? (
        <p className="mb-4 rounded-[12px] bg-[#fafafa] px-4 py-3 text-sm font-medium text-muted">
          {searchNotice}
        </p>
      ) : null}

      <MarketplaceAds pageContext="find" className="mb-6 space-y-3" />

      {error ? (
        <EmptyState title="Something went wrong" description={error} />
      ) : loading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="listing-card h-72 animate-pulse bg-paper-warmth sm:h-80"
            />
          ))}
        </div>
      ) : results.length === 0 ? (
        <EmptyState
          title="No professionals found"
          description="Try adjusting the search above or pick another category."
        />
      ) : view === "grid" ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((pro, index) => (
            <motion.div
              key={pro.id}
              initial={{ opacity: 0.4, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.22,
                delay: index * 0.03,
                ease: "easeOut",
              }}
              className="min-w-0"
            >
              <ListingCard professional={pro} />
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="grid gap-3">
          {results.map((pro, index) => (
            <motion.div
              key={pro.id}
              initial={{ opacity: 0.4, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.2,
                delay: index * 0.025,
                ease: "easeOut",
              }}
            >
              <ListingCardCompact professional={pro} />
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
