import Image from "next/image";
import { ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/** Renders a real API image, or a neutral empty state. Never uses mock photos. */
export function MediaFrame({
  src,
  alt,
  fill,
  width,
  height,
  sizes,
  className,
  imageClassName,
  priority,
  emptyLabel = "No photo",
}: {
  src?: string | null;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  sizes?: string;
  className?: string;
  imageClassName?: string;
  priority?: boolean;
  emptyLabel?: string;
}) {
  if (src) {
    const isBrowserObjectUrl =
      src.startsWith("blob:") || src.startsWith("data:");

    if (isBrowserObjectUrl) {
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          className={cn(
            "object-cover",
            fill ? "absolute inset-0 h-full w-full" : null,
            imageClassName,
          )}
          style={
            fill
              ? undefined
              : { width: width ?? 120, height: height ?? 120 }
          }
        />
      );
    }

    if (fill) {
      return (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          unoptimized={
          src.includes("api.9jaconnet.com") || src.startsWith("/api/upstream/")
        }
          className={cn("object-cover", imageClassName)}
        />
      );
    }
    return (
      <Image
        src={src}
        alt={alt}
        width={width ?? 120}
        height={height ?? 120}
        sizes={sizes}
        priority={priority}
        unoptimized={
          src.includes("api.9jaconnet.com") || src.startsWith("/api/upstream/")
        }
        className={cn("object-cover", imageClassName)}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-1.5 bg-[#ececee] text-[#71717a]",
        fill ? "absolute inset-0" : "h-full w-full",
        className,
      )}
      aria-label={emptyLabel}
    >
      <ImageIcon className="h-6 w-6" />
      <span className="text-[11px] font-semibold uppercase tracking-wide">
        {emptyLabel}
      </span>
    </div>
  );
}
