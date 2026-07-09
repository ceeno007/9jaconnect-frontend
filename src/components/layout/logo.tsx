import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({
  className,
  showWordmark = false,
  light = false,
  compact = false,
}: {
  className?: string;
  showWordmark?: boolean;
  light?: boolean;
  compact?: boolean;
}) {
  const size = compact ? 36 : 44;

  return (
    <Link
      href="/"
      className={cn("inline-flex items-center gap-2.5", className)}
      aria-label="9jaconnect home"
    >
      <Image
        src="/logo.png"
        alt="9jaconnect"
        width={size}
        height={size}
        className={cn(
          "shrink-0 object-contain",
          compact ? "h-9 w-9" : "h-11 w-11",
        )}
        priority
      />
      {showWordmark ? (
        <span
          className={cn(
            "font-black tracking-tight",
            compact ? "text-[1.35rem]" : "text-2xl",
            light ? "text-white" : "text-black",
          )}
        >
          9jaconnect
        </span>
      ) : null}
    </Link>
  );
}
