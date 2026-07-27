import Image from "next/image";
import { cn } from "@/lib/utils";

/** Illustrated pixel-art divider — Notion-style visual punctuation. */
export function PixelArtBanner({
  className,
}: {
  className?: string;
}) {
  return (
    <section className={cn("px-4 lg:px-6", className)}>
      <div className="relative mx-auto max-w-[1200px] overflow-hidden rounded-[6px] bg-paper-warmth">
        <div className="relative aspect-[21/9] w-full sm:aspect-[24/9]">
          <Image
            src="/images/pixel-marketplace-banner.png"
            alt="Pixel art marketplace street scene"
            fill
            sizes="(max-width: 1200px) 100vw, 1200px"
            className="object-cover [image-rendering:pixelated]"
            priority={false}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-gradient-to-b from-paper-warmth via-paper-warmth/55 to-transparent"
          />
        </div>
      </div>
    </section>
  );
}
