"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { LayoutGrid, List } from "lucide-react";
import { motion } from "framer-motion";
import {
  ListingCard,
  ListingCardCompact,
} from "@/components/professionals/listing-card";
import { EmptyState } from "@/components/ui/primitives";
import { listProfessionalsForSearch } from "@/lib/api";
import { mapDirectoryProfessional } from "@/lib/api/mappers";
import type { Professional } from "@/lib/types";
import { cn } from "@/lib/utils";

export default function FindPageClient() {
  const searchParams = useSearchParams();
  const stateId = searchParams.get("state") ?? "";
  const lgaId = searchParams.get("lga") ?? "";
  const categoryId = searchParams.get("category") ?? "";
  const keyword = (searchParams.get("keyword") ?? "").trim();
  const [view, setView] = useState<"grid" | "list">("grid");
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
      q: keyword || undefined,
      state_id: stateId || undefined,
      lga_id: lgaId || undefined,
      category_id: categoryId || undefined,
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
  }, [stateId, lgaId, categoryId, keyword]);

  const countLabel = useMemo(() => {
    if (loading) return null;
    return `${total} ${total === 1 ? "professional" : "professionals"} found`;
  }, [loading, total]);

  return (
    <motion.div
      initial={{ opacity: 0.35, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
      className="mx-auto max-w-7xl px-4 py-8 lg:px-6"
    >
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-black sm:text-4xl">
            Find Professionals
          </h1>
          {countLabel ? (
            <p className="mt-2 text-base font-medium text-muted">{countLabel}</p>
          ) : (
            <div className="mt-2 h-5 w-40 animate-pulse rounded-[8px] bg-[#f3f2f1]" />
          )}
        </div>
        <div className="inline-flex overflow-hidden rounded-[8px] border border-[#e4e2e0] bg-white">
          <button
            type="button"
            aria-label="Grid view"
            onClick={() => setView("grid")}
            className={cn(
              "inline-flex h-10 w-10 items-center justify-center",
              view === "grid" ? "bg-[#f3f2f1] text-black" : "text-muted",
            )}
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="List view"
            onClick={() => setView("list")}
            className={cn(
              "inline-flex h-10 w-10 items-center justify-center border-l border-[#e4e2e0]",
              view === "list" ? "bg-[#f3f2f1] text-black" : "text-muted",
            )}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {searchNotice ? (
        <p className="mb-4 rounded-[12px] bg-[#fafafa] px-4 py-3 text-sm font-medium text-muted">
          {searchNotice}
        </p>
      ) : null}

      {error ? (
        <EmptyState title="Something went wrong" description={error} />
      ) : loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className="listing-card h-72 animate-pulse bg-[#f3f2f1]"
            />
          ))}
        </div>
      ) : results.length === 0 ? (
        <EmptyState
          title="No professionals found"
          description="Try adjusting the search above or pick another category."
        />
      ) : view === "grid" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
