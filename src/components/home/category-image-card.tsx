import Image from "next/image";
import Link from "next/link";
import { imageForCategory } from "@/lib/category-imagery";
import { cn } from "@/lib/utils";

export function CategoryImageCard({
  href,
  name,
  slug,
  iconKey,
  accent,
  className,
}: {
  href: string;
  name: string;
  slug?: string | null;
  iconKey?: string | null;
  accent?: "marigold" | "coral" | null;
  className?: string;
}) {
  const src = imageForCategory(slug, name, iconKey);

  return (
    <Link
      href={href}
      className={cn(
        "group relative flex min-h-[220px] flex-col overflow-hidden rounded-[12px] border border-black/[0.08] bg-pure-white transition duration-200",
        className,
      )}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-paper-warmth">
        <Image
          src={src}
          alt={name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 280px"
          className="object-cover transition duration-200 group-hover:scale-[1.03]"
        />
        {accent === "marigold" ? (
          <span className="badge-marigold absolute left-3 top-3">Popular</span>
        ) : null}
        {accent === "coral" ? (
          <span className="badge-coral absolute left-3 top-3">Featured</span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col justify-between gap-3 p-6">
        <h3 className="text-[20px] font-semibold leading-snug tracking-[-0.01em] text-ink-black sm:text-[22px]">
          {name}
        </h3>
        <span className="badge-tag w-fit">Browse</span>
      </div>
    </Link>
  );
}
