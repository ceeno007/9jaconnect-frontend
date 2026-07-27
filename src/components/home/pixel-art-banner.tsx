import Image from "next/image";
import { cn } from "@/lib/utils";

/** Full-bleed pixel-art divider. */
export function PixelArtBanner({
  className,
}: {
  className?: string;
}) {
  return (
    <section className={cn("w-full", className)}>
      <div className="relative w-full overflow-hidden bg-lemon-wash">
        <div className="relative aspect-[21/9] w-full sm:aspect-[24/9] lg:aspect-[28/9]">
          <Image
            src="/images/pixel-marketplace-banner.png"
            alt="Pixel art marketplace street scene"
            fill
            sizes="100vw"
            className="object-cover [image-rendering:pixelated]"
            priority={false}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-gradient-to-b from-paper-warmth via-paper-warmth/40 to-lemon-wash"
          />
        </div>
      </div>
    </section>
  );
}
