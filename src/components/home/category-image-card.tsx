import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { iconForCategory } from "@/lib/category-icons";
import { cn } from "@/lib/utils";

export function CategoryImageCard({
  href,
  name,
  slug,
  iconKey,
  className,
}: {
  href: string;
  name: string;
  slug?: string | null;
  iconKey?: string | null;
  accent?: "marigold" | "coral" | null;
  className?: string;
}) {
  const icon = iconForCategory(slug, name, iconKey);

  return (
    <Link
      href={href}
      className={cn(
        "group flex items-center gap-4 rounded-xl bg-white p-4 sm:p-5 shadow-xs border-0 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5",
        className,
      )}
    >
      {/* Colorful illustrated icon container */}
      <div className="relative h-12 w-12 shrink-0 flex items-center justify-center rounded-lg bg-neutral-100/70 p-1.5 transition-colors group-hover:bg-neutral-100">
        <Image
          src={icon}
          alt={name}
          width={40}
          height={40}
          style={{ width: "auto", height: "auto" }}
          className="max-h-10 max-w-10 object-contain"
          unoptimized
        />
      </div>

      {/* Category name */}
      <span className="flex-1 text-[15px] sm:text-[16px] font-semibold text-neutral-900 leading-snug group-hover:text-black">
        {name}
      </span>

      {/* Chevron arrow */}
      <ChevronRight className="h-5 w-5 shrink-0 text-neutral-400 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-neutral-800" />
    </Link>
  );
}
