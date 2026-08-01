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

  if (!isFind) {
    return null;
  }

  return (
    <motion.section
      layout
      transition={morphTransition}
      className="border-b border-black/[0.06] bg-paper-warmth py-4 sm:py-6"
    >
      <motion.div
        layout
        transition={morphTransition}
        className="mx-auto max-w-[1200px] px-5 sm:px-6 lg:px-6 space-y-4"
      >
        <IndeedStyleSearch
          className="max-w-none"
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
  return null;
}

