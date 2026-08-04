"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { LayoutGrid, List, Search, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { IndeedStyleSearch } from "@/components/home/indeed-search";
import {
  ListingCard,
  ListingCardCompact,
} from "@/components/professionals/listing-card";
import { MarketplaceAds } from "@/components/ads/marketplace-ads";
import { EmptyState } from "@/components/ui/primitives";
import {
  listCategories,
  listLgas,
  listProfessionalsForSearch,
  listStates,
  type DirectorySort,
} from "@/lib/api";
import type { Category } from "@/lib/api/types";
import { mapDirectoryProfessional } from "@/lib/api/mappers";
import type { Professional } from "@/lib/types";
import { cn } from "@/lib/utils";

const SORT_OPTIONS: { label: string; value: DirectorySort }[] = [
  { label: "Recommended", value: "recommended" },
  { label: "Highest rated", value: "rating" },
  { label: "Newest", value: "recency" },
];

type FilterChip = {
  key: "keyword" | "state" | "lga" | "category";
  label: string;
};

const easeOut = [0.22, 1, 0.36, 1] as const;

function SkeletonRow() {
  return (
    <div className="listing-card grid grid-cols-[104px_1fr] gap-4 p-3 sm:grid-cols-[168px_1fr_auto] sm:gap-6 sm:p-4">
      <div className="aspect-square animate-pulse rounded-[12px] bg-cloud sm:h-[132px] sm:w-[168px] sm:aspect-auto" />
      <div className="space-y-2.5 py-1">
        <div className="h-5 w-2/3 animate-pulse rounded bg-cloud" />
        <div className="h-4 w-1/2 animate-pulse rounded bg-cloud" />
        <div className="h-4 w-24 animate-pulse rounded bg-cloud" />
        <div className="h-4 w-40 animate-pulse rounded bg-cloud" />
      </div>
      <div className="hidden w-28 flex-col items-end justify-between py-1 sm:flex">
        <div className="h-5 w-20 animate-pulse rounded bg-cloud" />
        <div className="h-4 w-24 animate-pulse rounded bg-cloud" />
      </div>
    </div>
  );
}

function SkeletonPills() {
  return (
    <div className="mb-7 flex gap-2 overflow-hidden">
      {Array.from({ length: 7 }).map((_, index) => (
        <div
          key={index}
          className="h-9 shrink-0 animate-pulse rounded-full bg-cloud"
          style={{ width: index === 0 ? 88 : 120 + (index % 3) * 28 }}
        />
      ))}
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="listing-card overflow-hidden">
      <div className="aspect-[16/10] animate-pulse bg-cloud" />
      <div className="space-y-3 p-5">
        <div className="h-5 w-3/4 animate-pulse rounded bg-cloud" />
        <div className="h-4 w-1/2 animate-pulse rounded bg-cloud" />
        <div className="h-4 w-1/3 animate-pulse rounded bg-cloud" />
      </div>
    </div>
  );
}

export default function FindPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const stateId = searchParams.get("state") ?? "";
  const lgaId = searchParams.get("lga") ?? "";
  const categoryId = searchParams.get("category") ?? "";
  const keyword = (searchParams.get("keyword") ?? "").trim();
  const [view, setView] = useState<"grid" | "list">("list");
  const [sort, setSort] = useState<DirectorySort>("recommended");
  const [results, setResults] = useState<Professional[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchNotice, setSearchNotice] = useState("");
  const [stateLabel, setStateLabel] = useState("");
  const [lgaLabel, setLgaLabel] = useState("");
  const [categoryLabel, setCategoryLabel] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const pillsRef = useRef<HTMLDivElement>(null);
  const pillsDrag = useRef<{
    active: boolean;
    startX: number;
    startScroll: number;
    moved: boolean;
  }>({ active: false, startX: 0, startScroll: 0, moved: false });
  const [pillFade, setPillFade] = useState({ left: false, right: true });
  const [pillsGrabbing, setPillsGrabbing] = useState(false);

  function updatePillFade() {
    const el = pillsRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    setPillFade({
      left: el.scrollLeft > 4,
      right: maxScroll > 4 && el.scrollLeft < maxScroll - 4,
    });
  }

  useEffect(() => {
    const el = pillsRef.current;
    if (!el) return;

    updatePillFade();

    const onScroll = () => updatePillFade();
    const onWheel = (event: WheelEvent) => {
      if (el.scrollWidth <= el.clientWidth) return;
      const mostlyVertical = Math.abs(event.deltaY) > Math.abs(event.deltaX);
      if (mostlyVertical && event.deltaY !== 0) {
        event.preventDefault();
        el.scrollLeft += event.deltaY;
      } else if (event.deltaX !== 0) {
        el.scrollLeft += event.deltaX;
      }
      updatePillFade();
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    el.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("resize", onScroll);

    return () => {
      el.removeEventListener("scroll", onScroll);
      el.removeEventListener("wheel", onWheel);
      window.removeEventListener("resize", onScroll);
    };
  }, [categories.length]);

  function onPillsPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    const el = pillsRef.current;
    if (!el || el.scrollWidth <= el.clientWidth) return;
    pillsDrag.current = {
      active: true,
      startX: event.clientX,
      startScroll: el.scrollLeft,
      moved: false,
    };
    setPillsGrabbing(true);
    el.setPointerCapture(event.pointerId);
  }

  function onPillsPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const el = pillsRef.current;
    const drag = pillsDrag.current;
    if (!el || !drag.active) return;
    const delta = event.clientX - drag.startX;
    if (Math.abs(delta) > 4) drag.moved = true;
    el.scrollLeft = drag.startScroll - delta;
    updatePillFade();
  }

  function onPillsPointerUp(event: React.PointerEvent<HTMLDivElement>) {
    const el = pillsRef.current;
    const drag = pillsDrag.current;
    if (!el || !drag.active) return;
    drag.active = false;
    setPillsGrabbing(false);
    try {
      el.releasePointerCapture(event.pointerId);
    } catch {
      // ignore
    }
  }

  function onPillClickCapture(event: React.MouseEvent) {
    if (pillsDrag.current.moved) {
      event.preventDefault();
      event.stopPropagation();
      pillsDrag.current.moved = false;
    }
  }

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
        setResults(data.professionals.map(mapDirectoryProfessional));
        setTotal(data.pagination.total);
        if (data.keywordSearchUnavailable && keyword) {
          setSearchNotice(
            "Keyword search is not live yet. Showing results for your location and category filters.",
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

  useEffect(() => {
    let cancelled = false;

    void listCategories().then((items) => {
      if (cancelled) return;
      setCategories(items);
      setCategoryLabel(items.find((item) => item.id === categoryId)?.name ?? "");
    });

    if (!stateId) {
      setStateLabel("");
      setLgaLabel("");
      return () => {
        cancelled = true;
      };
    }

    void listStates().then((states) => {
      if (cancelled) return;
      setStateLabel(states.find((item) => item.id === stateId)?.name ?? "");
    });

    if (!lgaId) {
      setLgaLabel("");
      return () => {
        cancelled = true;
      };
    }

    void listLgas(stateId).then((lgas) => {
      if (cancelled) return;
      setLgaLabel(lgas.find((item) => item.id === lgaId)?.name ?? "");
    });

    return () => {
      cancelled = true;
    };
  }, [stateId, lgaId, categoryId]);

  const chips = useMemo(() => {
    const next: FilterChip[] = [];
    if (keyword) next.push({ key: "keyword", label: `“${keyword}”` });
    if (stateId && stateLabel) next.push({ key: "state", label: stateLabel });
    if (lgaId && lgaLabel) next.push({ key: "lga", label: lgaLabel });
    if (categoryId && categoryLabel) {
      next.push({ key: "category", label: categoryLabel });
    }
    return next;
  }, [
    keyword,
    stateId,
    stateLabel,
    lgaId,
    lgaLabel,
    categoryId,
    categoryLabel,
  ]);

  function pushParams(mutate: (params: URLSearchParams) => void) {
    const params = new URLSearchParams(searchParams.toString());
    mutate(params);
    const query = params.toString();
    router.push(query ? `/find?${query}` : "/find");
  }

  function clearFilter(key: FilterChip["key"]) {
    pushParams((params) => {
      if (key === "keyword") params.delete("keyword");
      if (key === "category") params.delete("category");
      if (key === "state") {
        params.delete("state");
        params.delete("lga");
      }
      if (key === "lga") params.delete("lga");
    });
  }

  function clearAllFilters() {
    router.push("/find");
  }

  function selectCategory(nextId: string) {
    pushParams((params) => {
      if (!nextId || params.get("category") === nextId) {
        params.delete("category");
      } else {
        params.set("category", nextId);
      }
    });
  }

  const pillCategories = categories.slice(0, 10);

  return (
    <div className="relative">
      <section className="border-b border-lemon/30 bg-lemon-wash">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: easeOut }}
          className="page-x mx-auto max-w-[1120px] py-5 sm:py-6"
        >
          <h1 className="sr-only">Find professionals</h1>
          <IndeedStyleSearch
            className="max-w-none border-lemon/40 shadow-[0_12px_32px_rgba(168,201,42,0.18)]"
            initialKeyword={keyword}
            initialState={stateId}
            initialLga={lgaId}
            initialCategory={categoryId}
          />
        </motion.div>
      </section>

      <div className="page-x mx-auto max-w-[1120px] py-7">
        {categories.length === 0 ? (
          <SkeletonPills />
        ) : pillCategories.length > 0 ? (
          <div className="relative mb-7">
            <div
              aria-hidden
              className={cn(
                "pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-paper-warmth to-transparent transition-opacity duration-200 sm:w-14",
                pillFade.left ? "opacity-100" : "opacity-0",
              )}
            />
            <div
              aria-hidden
              className={cn(
                "pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-paper-warmth to-transparent transition-opacity duration-200 sm:w-16",
                pillFade.right ? "opacity-100" : "opacity-0",
              )}
            />
            <div
              ref={pillsRef}
              onPointerDown={onPillsPointerDown}
              onPointerMove={onPillsPointerMove}
              onPointerUp={onPillsPointerUp}
              onPointerCancel={onPillsPointerUp}
              onClickCapture={onPillClickCapture}
              className={cn(
                "flex touch-pan-x gap-2 overflow-x-auto overscroll-x-contain pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
                pillsGrabbing ? "cursor-grabbing select-none" : "cursor-grab",
              )}
            >
              <button
                type="button"
                onClick={() => selectCategory("")}
                className={cn(
                  "shrink-0 snap-start rounded-full px-3.5 py-2 text-[13px] font-medium transition",
                  !categoryId
                    ? "bg-lemon text-ink-black shadow-[0_1px_2px_rgba(168,201,42,0.35)]"
                    : "border border-black/[0.08] bg-snow text-ink-black hover:border-lemon/50 hover:bg-lemon-wash",
                )}
              >
                All trades
              </button>
              {pillCategories.map((item) => {
                const active = categoryId === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => selectCategory(item.id)}
                    className={cn(
                      "shrink-0 snap-start rounded-full px-3.5 py-2 text-[13px] font-medium transition",
                      active
                        ? "bg-lemon text-ink-black shadow-[0_1px_2px_rgba(168,201,42,0.35)]"
                        : "border border-black/[0.08] bg-snow text-ink-black hover:border-lemon/50 hover:bg-lemon-wash",
                    )}
                  >
                    {item.name}
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        <AnimatePresence initial={false}>
          {chips.length > 0 ? (
            <motion.div
              key="chips"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="mb-5 flex flex-wrap items-center gap-2"
            >
              {chips.map((chip) => (
                <button
                  key={chip.key}
                  type="button"
                  onClick={() => clearFilter(chip.key)}
                  className="group inline-flex items-center gap-1.5 rounded-full border border-lemon/40 bg-lemon-wash px-3 py-1.5 text-[13px] font-medium text-ink-black transition hover:border-lemon/70 hover:bg-lemon/40"
                >
                  <span className="max-w-[220px] truncate">{chip.label}</span>
                  <X className="h-3 w-3 text-ink-black/55 group-hover:text-ink-black" />
                </button>
              ))}
              <button
                type="button"
                onClick={clearAllFilters}
                className="text-[13px] font-medium text-fog underline-offset-4 hover:text-ink-black hover:underline"
              >
                Clear all
              </button>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <div className="sticky top-[64px] z-20 mb-6 rounded-[14px] border border-black/[0.05] bg-snow/80 px-4 py-3 shadow-[0_1px_2px_rgba(0,0,0,0.03)] backdrop-blur-md sm:px-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[13px] font-medium text-fog">
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-lemon-deep" />
                  Updating results
                </span>
              ) : (
                <>
                  <span className="tabular-nums text-ink-black">{total}</span>{" "}
                  {total === 1 ? "professional" : "professionals"}
                  {categoryLabel ? (
                    <span className="text-stone"> · {categoryLabel}</span>
                  ) : null}
                </>
              )}
            </p>

            <div className="flex flex-wrap items-center gap-2.5">
              <label className="inline-flex items-center gap-2 text-[13px] font-medium text-fog">
                Sort
                <select
                  name="sort"
                  value={sort}
                  onChange={(e) => setSort(e.target.value as DirectorySort)}
                  className="h-9 appearance-none rounded-full border border-black/[0.08] bg-snow bg-[length:14px_14px] bg-[right_10px_center] bg-no-repeat py-0 pl-3.5 pr-9 text-[13px] font-medium text-ink-black outline-none focus:border-lemon focus:ring-1 focus:ring-lemon"
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

              <div className="inline-flex rounded-full border border-black/[0.08] bg-snow p-0.5">
                <button
                  type="button"
                  aria-label="List view"
                  aria-pressed={view === "list"}
                  onClick={() => setView("list")}
                  className={cn(
                    "inline-flex h-8 w-8 items-center justify-center rounded-full transition",
                    view === "list"
                      ? "bg-ink-black text-snow"
                      : "text-stone hover:text-ink-black",
                  )}
                >
                  <List className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  aria-label="Grid view"
                  aria-pressed={view === "grid"}
                  onClick={() => setView("grid")}
                  className={cn(
                    "inline-flex h-8 w-8 items-center justify-center rounded-full transition",
                    view === "grid"
                      ? "bg-ink-black text-snow"
                      : "text-stone hover:text-ink-black",
                  )}
                >
                  <LayoutGrid className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {searchNotice ? (
          <p className="mb-5 rounded-[14px] border border-black/[0.04] bg-lemon-wash/50 px-4 py-3 text-sm font-medium text-fog">
            {searchNotice}
          </p>
        ) : null}

        <MarketplaceAds pageContext="find" className="mb-7 space-y-3" />

        {error ? (
          <EmptyState title="Something went wrong" description={error} />
        ) : loading ? (
          view === "list" ? (
            <div className="grid gap-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <SkeletonRow key={index} />
              ))}
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <SkeletonCard key={index} />
              ))}
            </div>
          )
        ) : results.length === 0 ? (
          <div className="rounded-[22px] border border-black/[0.05] bg-snow px-6 py-16 text-center shadow-[0_1px_3px_rgba(0,0,0,0.04)] sm:px-10">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-lemon-wash">
              <Search className="h-6 w-6 text-ink-black/70" />
            </div>
            <h2 className="font-editorial text-[28px] tracking-[-0.02em] text-ink-black">
              No professionals found
            </h2>
            <p className="mx-auto mt-2 max-w-md text-[15px] leading-relaxed text-stone">
              Widen the area, try another trade, or clear filters to see who is
              available near you.
            </p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              {chips.length > 0 ? (
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="inline-flex h-11 items-center rounded-full bg-ink-black px-6 text-[14px] font-semibold text-snow transition hover:bg-charcoal"
                >
                  Clear filters
                </button>
              ) : null}
              <Link
                href="/"
                className="inline-flex h-11 items-center rounded-full border border-black/[0.08] bg-snow px-6 text-[14px] font-semibold text-ink-black transition hover:bg-paper-warmth"
              >
                Browse categories
              </Link>
            </div>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {view === "list" ? (
              <motion.div
                key="list"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.3, ease: easeOut }}
                className="grid gap-3"
              >
                {results.map((pro, index) => (
                  <motion.div
                    key={pro.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.35,
                      delay: Math.min(index * 0.03, 0.24),
                      ease: easeOut,
                    }}
                  >
                    <ListingCardCompact professional={pro} />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="grid"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.3, ease: easeOut }}
                className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
              >
                {results.map((pro, index) => (
                  <motion.div
                    key={pro.id}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.35,
                      delay: Math.min(index * 0.035, 0.28),
                      ease: easeOut,
                    }}
                    className="min-w-0"
                  >
                    <ListingCard professional={pro} />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
