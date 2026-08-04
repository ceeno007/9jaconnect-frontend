import { Suspense } from "react";
import FindPageClient from "./find-client";

function FindSkeletonRow() {
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

function FindPageFallback() {
  return (
    <div>
      <section className="border-b border-black/[0.05]">
        <div className="page-x mx-auto max-w-[1120px] py-5 sm:py-6">
          <div className="h-[168px] animate-pulse rounded-[16px] border border-black/[0.06] bg-snow sm:h-[56px]" />
        </div>
      </section>

      <div className="page-x mx-auto max-w-[1120px] py-7">
        <div className="mb-7 flex gap-2 overflow-hidden">
          {Array.from({ length: 7 }).map((_, index) => (
            <div
              key={index}
              className="h-9 shrink-0 animate-pulse rounded-full bg-cloud"
              style={{ width: index === 0 ? 88 : 120 + (index % 3) * 28 }}
            />
          ))}
        </div>

        <div className="mb-6 rounded-[14px] border border-black/[0.05] bg-snow/80 px-4 py-3 sm:px-5">
          <div className="flex items-center justify-between gap-3">
            <div className="h-4 w-28 animate-pulse rounded bg-cloud" />
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-36 animate-pulse rounded-full bg-cloud" />
              <div className="h-9 w-20 animate-pulse rounded-full bg-cloud" />
            </div>
          </div>
        </div>

        <div className="grid gap-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <FindSkeletonRow key={index} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function FindPage() {
  return (
    <Suspense fallback={<FindPageFallback />}>
      <FindPageClient />
    </Suspense>
  );
}
