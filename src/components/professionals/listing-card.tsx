import Link from "next/link";
import { BadgeCheck, MapPin } from "lucide-react";
import { MediaFrame } from "@/components/ui/media-frame";
import { RatingScore } from "@/components/ui/rating";
import type { Professional } from "@/lib/types";
import { cn } from "@/lib/utils";

function VerifiedBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-[var(--radius-badges)] bg-verified px-2 py-0.5 text-[12px] font-medium leading-none text-snow",
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
        "listing-card group flex h-full max-w-full flex-col overflow-hidden",
        className,
      )}
    >
      <div className="relative aspect-[2/1] w-full overflow-hidden rounded-t-[6px] bg-paper-warmth sm:aspect-[16/10]">
        <MediaFrame
          src={professional.coverImage}
          alt={`${professional.tradeName} work`}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          imageClassName="transition duration-200 group-hover:scale-[1.03]"
        />
        <div className="absolute left-2.5 top-2.5 flex flex-wrap gap-1.5 sm:left-3 sm:top-3">
          {professional.verified ? <VerifiedBadge /> : null}
          <span className="rounded-[var(--radius-badges)] bg-obsidian/70 px-2 py-0.5 text-[12px] font-medium leading-none text-snow backdrop-blur-sm">
            {professional.years}+ yrs
          </span>
        </div>
        <div className="absolute bottom-2.5 right-2.5 rounded-[var(--radius-badges)] bg-snow px-2 py-1 text-[12px] font-semibold text-obsidian sm:bottom-3 sm:right-3 sm:text-[13px]">
          {professional.hourlyRate > 0 ? (
            <>
              ₦{professional.hourlyRate.toLocaleString()}
              <span className="font-normal text-steel"> /hr</span>
            </>
          ) : (
            <span className="text-[12px] font-medium">Rate on request</span>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4 sm:gap-3 sm:p-6">
        <div>
          <h3 className="line-clamp-1 text-[16px] font-semibold leading-snug tracking-[-0.01em] text-ink-black group-hover:opacity-70 sm:text-[20px]">
            {professional.tradeName}
          </h3>
          <p className="mt-0.5 line-clamp-1 text-[13px] font-normal text-stone sm:mt-1 sm:text-[14px]">
            {professional.category} · {professional.name}
          </p>
          <div className="mt-1.5 sm:mt-2">
            <RatingScore value={professional.rating} size="sm" />
          </div>
        </div>

        <p className="mt-auto flex items-center gap-1 pt-0.5 text-[12px] font-normal text-stone sm:pt-1 sm:text-[13px]">
          <MapPin className="h-3.5 w-3.5 shrink-0 text-ink-black/60" />
          <span className="min-w-0 truncate">
            {professional.state}, {professional.lga}
          </span>
          <span className="ml-auto shrink-0 font-medium text-ink-black/60">
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
      className="listing-card flex gap-3 overflow-hidden p-4"
    >
      <div className="relative h-[84px] w-[84px] shrink-0 overflow-hidden rounded-[8px] bg-cloud">
        <MediaFrame
          src={professional.coverImage}
          alt={`${professional.tradeName} work`}
          fill
          sizes="84px"
        />
        {professional.verified ? (
          <span className="absolute left-1.5 top-1.5 inline-flex items-center gap-0.5 rounded-[var(--radius-badges)] bg-verified px-1.5 py-0.5 text-[10px] font-medium leading-none text-snow">
            <BadgeCheck className="h-2.5 w-2.5" />
            Verified
          </span>
        ) : null}
      </div>

      <div className="min-w-0 flex-1 space-y-1.5">
        <h3 className="line-clamp-1 text-[15px] font-semibold leading-snug text-obsidian">
          {professional.tradeName}
        </h3>
        <p className="line-clamp-1 text-[13px] font-normal text-steel">
          {professional.category}
        </p>
        <p className="line-clamp-1 text-[13px] font-normal text-fog">
          {professional.state}, {professional.lga}
        </p>
        <div className="flex items-center justify-between gap-2 pt-0.5">
          <p className="min-w-0 truncate text-[14px] font-semibold text-obsidian">
            {professional.hourlyRate > 0 ? (
              <>
                ₦{professional.hourlyRate.toLocaleString()}
                <span className="font-normal text-steel"> /hr</span>
              </>
            ) : (
              <span className="text-[12px] font-medium text-steel">
                Rate on request
              </span>
            )}
          </p>
          <span className="inline-flex shrink-0 items-center gap-1 text-[12px] font-medium tabular-nums text-fog">
            <svg viewBox="0 0 16 16" aria-hidden className="h-3.5 w-3.5">
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
