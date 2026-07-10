import Image from "next/image";
import Link from "next/link";
import { BadgeCheck, MapPin } from "lucide-react";
import { RatingScore } from "@/components/ui/rating";
import type { Professional } from "@/lib/types";
import { cn } from "@/lib/utils";

function VerifiedBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-[6px] bg-[#0f9d58] px-1.5 py-0.5 text-[11px] font-bold leading-none text-white",
        className,
      )}
    >
      <BadgeCheck className="h-3 w-3" />
      Verified
    </span>
  );
}

export function ListingCard({
  professional,
  className,
}: {
  professional: Professional;
  className?: string;
}) {
  return (
    <Link
      href={`/professionals/${professional.id}`}
      className={cn(
        "listing-card group flex h-full flex-col overflow-hidden",
        className,
      )}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#e8e6e4]">
        <Image
          src={professional.coverImage}
          alt={`${professional.tradeName} work`}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover transition duration-300 group-hover:scale-[1.03]"
        />
        <div className="absolute left-2.5 top-2.5 flex flex-wrap gap-1.5">
          {professional.verified ? <VerifiedBadge /> : null}
          <span className="rounded-[6px] bg-black/55 px-1.5 py-0.5 text-[11px] font-bold leading-none text-white backdrop-blur-sm">
            {professional.years}+ yrs
          </span>
        </div>
        <div className="absolute bottom-2.5 right-2.5 rounded-[6px] bg-white px-2 py-1 text-sm font-black text-black">
          {professional.hourlyRate > 0 ? (
            <>
              ₦{professional.hourlyRate.toLocaleString()}
              <span className="font-bold text-muted"> /hr</span>
            </>
          ) : (
            <span className="text-xs font-bold">Rate on request</span>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-lg font-bold leading-snug text-black group-hover:opacity-70">
              {professional.tradeName}
            </h3>
            <RatingScore
              value={professional.rating}
              size="sm"
              className="shrink-0"
            />
          </div>
          <p className="mt-1 text-sm font-semibold text-muted">
            {professional.category} · {professional.name}
          </p>
        </div>

        <p className="line-clamp-2 text-sm font-medium leading-relaxed text-[#9aa0a6]">
          {professional.description}
        </p>

        <p className="mt-auto flex items-center gap-1 pt-1 text-sm font-semibold text-muted">
          <MapPin className="h-3.5 w-3.5 shrink-0 text-black" />
          <span className="truncate">
            {professional.state}, {professional.lga}
          </span>
          <span className="ml-auto shrink-0 font-bold text-black">
            {professional.reviews} reviews
          </span>
        </p>
      </div>
    </Link>
  );
}

export function ListingCardCompact({
  professional,
}: {
  professional: Professional;
}) {
  return (
    <Link
      href={`/professionals/${professional.id}`}
      className="listing-card flex gap-3 overflow-hidden p-3"
    >
      <div className="relative h-[84px] w-[84px] shrink-0 overflow-hidden rounded-[10px] bg-[#e8e6e4]">
        <Image
          src={professional.coverImage}
          alt={`${professional.tradeName} work`}
          fill
          sizes="84px"
          className="object-cover"
        />
        {professional.verified ? (
          <span className="absolute left-1 top-1 inline-flex items-center gap-0.5 rounded-[5px] bg-[#0f9d58] px-1 py-0.5 text-[10px] font-bold leading-none text-white">
            <BadgeCheck className="h-2.5 w-2.5" />
            Verified
          </span>
        ) : null}
      </div>

      <div className="min-w-0 flex-1 space-y-1.5">
        <h3 className="line-clamp-1 text-[15px] font-bold leading-snug text-black">
          {professional.tradeName}
        </h3>
        <p className="line-clamp-1 text-xs font-semibold text-muted">
          {professional.category}
        </p>
        <p className="line-clamp-1 text-xs font-medium text-muted">
          {professional.state}, {professional.lga}
        </p>
        <div className="flex items-center justify-between gap-2 pt-0.5">
          <p className="min-w-0 truncate text-sm font-black text-black">
            {professional.hourlyRate > 0 ? (
              <>
                ₦{professional.hourlyRate.toLocaleString()}
                <span className="font-bold text-muted"> /hr</span>
              </>
            ) : (
              <span className="text-xs font-bold text-muted">Rate on request</span>
            )}
          </p>
          <span className="inline-flex shrink-0 items-center gap-1 text-xs font-bold tabular-nums text-[#8a8f96]">
            <svg
              viewBox="0 0 16 16"
              aria-hidden
              className="h-3.5 w-3.5"
            >
              <path
                fill="currentColor"
                d="M8 1.2 9.7 5.4l4.5.4-3.4 2.9 1 4.4L8 11.2l-3.8 2 1-4.4-3.4-2.9 4.5-.4L8 1.2Z"
              />
            </svg>
            {Number(professional.rating || 0).toFixed(1)}
          </span>
        </div>
      </div>
    </Link>
  );
}
