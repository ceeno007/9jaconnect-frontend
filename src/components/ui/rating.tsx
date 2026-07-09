import { cn } from "@/lib/utils";

export type RatingTone = "good" | "neutral" | "bad";

/** Good ≥4, bad &lt;3, otherwise grey. */
export function ratingTone(value: number): RatingTone {
  const n = Number(value) || 0;
  if (n >= 4) return "good";
  if (n > 0 && n < 3) return "bad";
  return "neutral";
}

const toneClass: Record<RatingTone, string> = {
  good: "text-[#0f9d58]",
  bad: "text-[#c62828]",
  neutral: "text-[#8a8f96]",
};

const fillClass: Record<RatingTone, string> = {
  good: "bg-[#0f9d58]",
  bad: "bg-[#c62828]",
  neutral: "bg-[#8a8f96]",
};

function StarMark({
  filled,
  className,
}: {
  filled: boolean;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 16 16"
      aria-hidden
      className={cn("h-[0.95em] w-[0.95em] shrink-0", className)}
    >
      {filled ? (
        <path
          fill="currentColor"
          d="M8 1.2 9.7 5.4l4.5.4-3.4 2.9 1 4.4L8 11.2l-3.8 2 1-4.4-3.4-2.9 4.5-.4L8 1.2Z"
        />
      ) : (
        <path
          fill="none"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinejoin="round"
          d="M8 1.2 9.7 5.4l4.5.4-3.4 2.9 1 4.4L8 11.2l-3.8 2 1-4.4-3.4-2.9 4.5-.4L8 1.2Z"
          opacity="0.35"
        />
      )}
    </svg>
  );
}

/** Compact score + tone-colored stars (green / grey / red). */
export function RatingScore({
  value,
  reviews,
  size = "md",
  className,
  showReviews = false,
}: {
  value: number;
  reviews?: number;
  size?: "sm" | "md";
  className?: string;
  showReviews?: boolean;
}) {
  const tone = ratingTone(value);
  const display = Number(value || 0).toFixed(1);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-bold tabular-nums",
        toneClass[tone],
        size === "sm" ? "text-sm" : "text-sm",
        className,
      )}
    >
      <span className="tracking-tight">{display}</span>
      <span className="inline-flex items-center gap-px" aria-hidden>
        {Array.from({ length: 5 }).map((_, i) => (
          <StarMark key={i} filled={i < Math.round(Number(value) || 0)} />
        ))}
      </span>
      {showReviews && typeof reviews === "number" ? (
        <span className="font-semibold text-[#8a8f96]">
          · {reviews} {reviews === 1 ? "review" : "reviews"}
        </span>
      ) : null}
    </span>
  );
}

/** Five tone-colored stars for a single review. */
export function RatingStars({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  const n = Math.max(0, Math.min(5, Math.round(Number(value) || 0)));
  const tone = ratingTone(n || value);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5",
        toneClass[tone],
        className,
      )}
      aria-label={`${n} out of 5`}
    >
      {Array.from({ length: 5 }).map((_, i) => (
        <StarMark key={i} filled={i < n} />
      ))}
    </span>
  );
}

/** Optional meter bar for denser UIs. */
export function RatingMeter({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  const n = Math.max(0, Math.min(5, Number(value) || 0));
  const tone = ratingTone(n);

  return (
    <span
      className={cn("inline-flex h-1.5 w-16 overflow-hidden rounded-sm bg-[#e8e6e4]", className)}
      aria-hidden
    >
      <span
        className={cn("h-full rounded-sm", fillClass[tone])}
        style={{ width: `${(n / 5) * 100}%` }}
      />
    </span>
  );
}
