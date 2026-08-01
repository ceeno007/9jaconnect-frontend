import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { imageForCategory } from "@/lib/category-images";
import { cn } from "@/lib/utils";

export function CategoryImageCard({
  href,
  name,
  slug,
  imageUrl,
  className,
}: {
  href: string;
  name: string;
  slug?: string | null;
  iconKey?: string | null;
  imageUrl?: string | null;
  accent?: "marigold" | "coral" | null;
  className?: string;
}) {
  const photoUrl = imageForCategory(slug, name, imageUrl);

  return (
    <Link
      href={href}
      className={cn(
        "group relative flex h-[76px] sm:h-[84px] items-center justify-between overflow-hidden rounded-xl bg-neutral-900 p-4 sm:p-5 shadow-xs transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5",
        className,
      )}
    >
      {/* Background Photo */}
      <Image
        src={photoUrl}
        alt={name}
        fill
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        className="object-cover transition-transform duration-300 group-hover:scale-105"
      />

      {/* Sleek Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-black/30 transition-opacity duration-200 group-hover:from-black/90 group-hover:via-black/70" />

      {/* Category Name */}
      <span className="relative z-10 flex-1 text-[15px] sm:text-[16px] font-bold text-white leading-tight drop-shadow-xs tracking-tight">
        {name}
      </span>

      {/* Chevron Icon Pill */}
      <div className="relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/15 backdrop-blur-xs transition-all duration-200 group-hover:translate-x-1 group-hover:bg-white/30">
        <ChevronRight className="h-4 w-4 text-white" />
      </div>
    </Link>
  );
}
