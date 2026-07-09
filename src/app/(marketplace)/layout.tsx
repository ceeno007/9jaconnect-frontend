import { Suspense } from "react";
import {
  MarketplaceSearchBar,
  MarketplaceSearchBarFallback,
} from "@/components/home/marketplace-search-bar";

export default function MarketplaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white">
      <Suspense fallback={<MarketplaceSearchBarFallback />}>
        <MarketplaceSearchBar />
      </Suspense>
      {children}
    </div>
  );
}
