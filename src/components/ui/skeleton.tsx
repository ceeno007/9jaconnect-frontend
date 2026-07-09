import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn("animate-pulse rounded-[12px] bg-[#f3f2f1]", className)}
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
