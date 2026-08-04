"use client";

import { usePathname } from "next/navigation";

/** Search lives inside the find page composition now. */
export function MarketplaceSearchBar() {
  const pathname = usePathname();
  if (pathname.startsWith("/find")) return null;
  return null;
}

export function MarketplaceSearchBarFallback() {
  return null;
}
