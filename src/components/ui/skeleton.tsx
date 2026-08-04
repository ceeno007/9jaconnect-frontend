import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn("animate-pulse rounded-[12px] bg-[#f4f4f5]", className)}
      aria-hidden
    />
  );
}

export function TicketListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-3" aria-busy="true" aria-label="Loading">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="ui-card p-5">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0 flex-1 space-y-3">
              <Skeleton className="h-5 w-2/3 max-w-xs" />
              <Skeleton className="h-4 w-1/3 max-w-[140px]" />
            </div>
            <Skeleton className="h-7 w-24 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function PageBlockSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Loading">
      <Skeleton className="h-10 w-48" />
      <Skeleton className="h-40 w-full" />
      <Skeleton className="h-24 w-full" />
    </div>
  );
}

export function FormSkeleton() {
  return (
    <div
      className="mx-auto max-w-2xl space-y-6"
      aria-busy="true"
      aria-label="Loading"
    >
      <div className="ui-card space-y-4 p-6">
        <Skeleton className="h-7 w-40" />
        <div className="grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
      <div className="ui-card space-y-4 p-6">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-28 w-full" />
      </div>
      <Skeleton className="h-12 w-40" />
    </div>
  );
}

export function ProfessionalProfileSkeleton() {
  return (
    <div className="bg-white" aria-busy="true" aria-label="Loading profile">
      <div className="border-b border-[#ececee] bg-white">
        <div className="page-x mx-auto max-w-7xl py-8">
          <Skeleton className="mb-5 h-10 w-24 rounded-full" />
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <Skeleton className="h-7 w-28 rounded-full" />
            <Skeleton className="h-7 w-40 rounded-full" />
          </div>
          <Skeleton className="h-12 w-3/4 max-w-xl sm:h-14" />
          <Skeleton className="mt-3 h-5 w-56" />
          <Skeleton className="mt-2 h-5 w-44" />
        </div>
      </div>

      <div className="page-x mx-auto grid max-w-7xl gap-8 py-10 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <section className="overflow-hidden ui-card p-3">
            <Skeleton className="aspect-[21/9] w-full rounded-[12px]" />
            <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton
                  key={index}
                  className="aspect-square w-full rounded-[12px]"
                />
              ))}
            </div>
          </section>

          <section className="ui-card space-y-4 p-7 sm:p-8">
            <Skeleton className="h-8 w-52" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-11/12" />
            <Skeleton className="h-4 w-4/5" />
          </section>

          <section className="ui-card p-7 sm:p-8">
            <Skeleton className="h-8 w-36" />
            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              <Skeleton className="h-24 w-full rounded-[var(--radius-lg)]" />
              <Skeleton className="h-24 w-full rounded-[var(--radius-lg)]" />
              <Skeleton className="h-24 w-full rounded-[var(--radius-lg)]" />
            </div>
          </section>

          <section className="ui-card space-y-4 p-7 sm:p-8">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-28 w-full rounded-[var(--radius-lg)]" />
            <Skeleton className="h-28 w-full rounded-[var(--radius-lg)]" />
          </section>
        </div>

        <aside className="h-fit lg:sticky lg:top-32">
          <div className="ui-card space-y-5 p-7 sm:p-8">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-12 w-full rounded-[var(--radius-lg)]" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </aside>
      </div>
    </div>
  );
}
