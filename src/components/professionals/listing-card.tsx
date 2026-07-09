import Image from "next/image";
import Link from "next/link";
import { BadgeCheck, MapPin, Star } from "lucide-react";
import type { Professional } from "@/lib/types";
import { cn } from "@/lib/utils";

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
        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          {professional.verified ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#0f9d58] px-2.5 py-1 text-xs font-bold text-white">
              <BadgeCheck className="h-3.5 w-3.5" />
              Verified
            </span>
          ) : null}
          <span className="rounded-full bg-black/55 px-2.5 py-1 text-xs font-bold text-white backdrop-blur-sm">
            {professional.years}+ yrs
          </span>
        </div>
        <div className="absolute bottom-3 right-3 rounded-full bg-white px-3 py-1.5 text-sm font-black text-black">
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
            <span className="inline-flex shrink-0 items-center gap-1 text-sm font-bold text-black">
              <Star className="h-3.5 w-3.5 fill-black text-black" />
              {professional.rating}
            </span>
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
      className="listing-card flex gap-4 overflow-hidden p-3"
    >
      <div className="relative h-28 w-36 shrink-0 overflow-hidden rounded-[12px] bg-[#e8e6e4]">
        <Image
          src={professional.coverImage}
          alt={`${professional.tradeName} work`}
          fill
          sizes="144px"
          className="object-cover"
        />
      </div>
      <div className="min-w-0 flex-1 py-0.5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-lg font-bold text-black">
            {professional.tradeName}
          </h3>
          {professional.verified ? (
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#0f9d58] px-2 py-0.5 text-xs font-bold text-white">
              <BadgeCheck className="h-3.5 w-3.5" />
              Verified
            </span>
          ) : null}
        </div>
        <p className="mt-1 text-sm font-semibold text-muted">
          {professional.category} · {professional.state}, {professional.lga}
        </p>
        <div className="mt-3 flex items-center justify-between gap-3">
          <p className="text-lg font-black text-black">
            {professional.hourlyRate > 0 ? (
              <>
                ₦{professional.hourlyRate.toLocaleString()}
                <span className="font-bold text-muted"> /hr</span>
              </>
            ) : (
              <span className="text-sm font-bold text-muted">Rate on request</span>
            )}
          </p>
          <p className="inline-flex items-center gap-1 text-sm font-semibold text-muted">
            <Star className="h-4 w-4 fill-black text-black" />
            {professional.rating} · {professional.reviews}
          </p>
        </div>
      </div>
    </Link>
  );
}
