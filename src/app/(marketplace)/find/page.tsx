import { Suspense } from "react";
import FindPageClient from "./find-client";

export default function FindPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-6 py-8 sm:px-6 lg:px-8">
          <div className="mb-6 h-10 w-64 animate-pulse rounded-[8px] bg-[#f4f4f5]" />
          <div className="mb-6 h-5 w-40 animate-pulse rounded-[8px] bg-[#f4f4f5]" />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="listing-card h-72 animate-pulse bg-paper-warmth sm:h-80"
              />
            ))}
          </div>
        </div>
      }
    >
      <FindPageClient />
    </Suspense>
  );
}
