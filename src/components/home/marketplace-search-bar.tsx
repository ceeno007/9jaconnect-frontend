"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { IndeedStyleSearch } from "@/components/home/indeed-search";
import { cn } from "@/lib/utils";

const morphTransition = {
  type: "spring" as const,
  stiffness: 380,
  damping: 36,
  mass: 0.8,
};

export function MarketplaceSearchBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isFind = pathname.startsWith("/find");

  return (
    <motion.section
      layout
      transition={morphTransition}
      className={cn(
        "border-b border-black/[0.08] bg-paper-warmth",
        isFind ? "py-4 sm:py-6" : "pb-6 pt-5 sm:pb-12 sm:pt-10",
      )}
    >
      <motion.div
        layout
        transition={morphTransition}
        className="mx-auto max-w-[1200px] px-4 lg:px-6"
      >
        <IndeedStyleSearch
          className={cn(isFind ? "max-w-none" : "max-w-5xl")}
          initialKeyword={searchParams.get("keyword") ?? ""}
          initialState={searchParams.get("state") ?? ""}
          initialLga={searchParams.get("lga") ?? ""}
          initialCategory={searchParams.get("category") ?? ""}
        />
      </motion.div>
    </motion.section>
  );
}

export function MarketplaceSearchBarFallback() {
  return (
    <section className="border-b border-black/[0.08] bg-paper-warmth pb-10 pt-8 sm:pb-12 sm:pt-10">
      <div className="mx-auto max-w-[1200px] px-4 lg:px-6">
        <IndeedStyleSearch className="max-w-5xl" />
      </div>
    </section>
  );
}
