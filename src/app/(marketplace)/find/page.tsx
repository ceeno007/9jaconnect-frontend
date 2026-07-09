import { Suspense } from "react";
import FindPageClient from "./find-client";

export default function FindPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
          <div className="mb-6 h-10 w-64 animate-pulse rounded-[8px] bg-[#f3f2f1]" />
          <div className="mb-6 h-5 w-40 animate-pulse rounded-[8px] bg-[#f3f2f1]" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="listing-card h-72 animate-pulse bg-[#f3f2f1]"
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
