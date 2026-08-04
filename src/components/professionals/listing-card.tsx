import Link from "next/link";
import { ArrowRight, BadgeCheck, MapPin } from "lucide-react";
import { MediaFrame } from "@/components/ui/media-frame";
import { RatingScore } from "@/components/ui/rating";
import type { Professional } from "@/lib/types";
import { cn } from "@/lib/utils";

function VerifiedBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-full bg-verified px-2 py-0.5 text-[11px] font-medium leading-none text-snow",
        className,
      )}
    >
      <BadgeCheck className="h-3 w-3" />
      Verified
    </span>
  );
}

function RateLabel({
  rate,
  className,
}: {
  rate: number;
  className?: string;
}) {
  if (rate > 0) {
    return (
      <p className={cn("tabular-nums", className)}>
        <span className="font-semibold text-ink-black">
          ₦{rate.toLocaleString()}
        </span>
        <span className="font-normal text-stone"> /hr</span>
      </p>
    );
  }
  return (
    <p className={cn("text-[13px] font-normal text-stone", className)}>
      Rate on request
    </p>
  );
}

function LocationLine({
  lga,
  state,
  trailing,
}: {
  lga: string;
  state: string;
  trailing?: string;
}) {
  return (
    <p className="flex items-center gap-1 text-[10px] font-light leading-snug tracking-[0.01em] text-black/35 sm:text-[11px]">
      <MapPin
        className="h-2.5 w-2.5 shrink-0 stroke-[1.5] text-black/30"
        aria-hidden
      />
      <span className="min-w-0 truncate font-light">
        {lga}
        {lga && state ? ", " : ""}
        {state}
      </span>
      {trailing ? (
        <span className="ml-auto shrink-0 font-light text-black/30">
          {trailing}
        </span>
      ) : null}
    </p>
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
        "listing-card group flex h-full max-w-full flex-col overflow-hidden transition duration-300 ease-out hover:-translate-y-0.5",
        className,
      )}
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-t-[14px] bg-paper-warmth">
        <MediaFrame
          src={professional.coverImage}
          alt={`${professional.tradeName} work`}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          imageClassName="transition duration-700 ease-out group-hover:scale-[1.05]"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-black/5 to-transparent" />

        {professional.verified ? (
          <div className="absolute left-3 top-3">
            <VerifiedBadge />
          </div>
        ) : null}

        <div className="absolute bottom-3 right-3 rounded-full bg-snow/95 px-2.5 py-1 text-[12px] font-semibold text-obsidian shadow-[0_1px_2px_rgba(0,0,0,0.06)] backdrop-blur-sm sm:text-[13px]">
          <RateLabel rate={professional.hourlyRate} />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="space-y-1">
          <h3 className="line-clamp-1 text-[17px] font-semibold leading-snug tracking-[-0.02em] text-ink-black transition group-hover:opacity-70 sm:text-[18px]">
            {professional.tradeName}
          </h3>
          <p className="line-clamp-1 text-[12px] font-normal text-stone sm:text-[13px]">
            {professional.name}
            <span className="text-black/25"> · </span>
            {professional.category}
          </p>
        </div>

        <div className="mt-auto space-y-2">
          <RatingScore value={professional.rating} size="sm" />
          <LocationLine
            lga={professional.lga}
            state={professional.state}
            trailing={`${professional.reviews} reviews`}
          />
        </div>
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
      className="listing-card group grid grid-cols-[104px_1fr] gap-4 overflow-hidden p-3 transition duration-300 ease-out hover:-translate-y-0.5 sm:grid-cols-[168px_1fr_auto] sm:gap-6 sm:p-4"
    >
      <div className="relative aspect-square overflow-hidden rounded-[12px] bg-cloud sm:aspect-[5/4] sm:h-[132px] sm:w-[168px]">
        <MediaFrame
          src={professional.coverImage}
          alt={`${professional.tradeName} work`}
          fill
          sizes="(max-width: 640px) 104px, 168px"
          imageClassName="transition duration-700 ease-out group-hover:scale-[1.05]"
        />
        {professional.verified ? (
          <span className="absolute left-2 top-2 inline-flex items-center gap-0.5 rounded-full bg-verified px-1.5 py-0.5 text-[10px] font-medium leading-none text-snow sm:hidden">
            <BadgeCheck className="h-2.5 w-2.5" />
            Verified
          </span>
        ) : null}
      </div>

      <div className="flex min-w-0 flex-col justify-center gap-1 py-0.5">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="line-clamp-1 text-[16px] font-semibold leading-snug tracking-[-0.015em] text-ink-black transition group-hover:opacity-70 sm:text-[20px]">
            {professional.tradeName}
          </h3>
          {professional.verified ? (
            <VerifiedBadge className="hidden sm:inline-flex" />
          ) : null}
        </div>

        <p className="line-clamp-1 text-[12px] font-normal text-stone sm:text-[13px]">
          {professional.name}
          <span className="text-black/25"> · </span>
          {professional.category}
        </p>

        <div className="mt-0.5 flex flex-wrap items-center gap-x-2.5 gap-y-1">
          <RatingScore value={professional.rating} size="sm" />
          <span className="text-[11px] font-normal text-black/40">
            {professional.reviews}{" "}
            {professional.reviews === 1 ? "review" : "reviews"}
          </span>
        </div>

        <LocationLine lga={professional.lga} state={professional.state} />

        <div className="mt-1 sm:hidden">
          <RateLabel rate={professional.hourlyRate} className="text-[14px]" />
        </div>
      </div>

      <div className="hidden flex-col items-end justify-between py-1 sm:flex">
        <RateLabel rate={professional.hourlyRate} className="text-[15px]" />
        <span className="inline-flex items-center gap-1 rounded-full bg-lemon-wash px-3 py-1.5 text-[13px] font-semibold text-ink-black transition group-hover:gap-1.5 group-hover:bg-lemon">
          View profile
          <ArrowRight className="h-3.5 w-3.5" />
        </span>
      </div>
    </Link>
  );
}
