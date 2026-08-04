"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const TRUST_STATS = [
  {
    title: "Over 10,000 rated tradespeople",
    subtitle: "are ready to help you get your job done",
  },
  {
    title: "Over 500,000 happy customers",
    subtitle: "have found a quality local tradesperson",
  },
  {
    title: "100% ID-verified professionals",
    subtitle: "with real ratings & customer reviews",
  },
];

export function TrustStatsCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % TRUST_STATS.length);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="bg-pure-white py-8 sm:py-12">
      <div className="page-x mx-auto max-w-[1200px]">
        {/* Desktop 3-column Grid (Hidden on Mobile) */}
        <div className="hidden md:grid md:grid-cols-3 gap-8 text-center">
          {TRUST_STATS.map((stat, idx) => (
            <div key={idx}>
              <h3 className="text-[20px] sm:text-[22px] font-black text-neutral-950 mb-1 tracking-tight">
                {stat.title}
              </h3>
              <p className="text-[14px] sm:text-[15px] font-semibold text-neutral-600">
                {stat.subtitle}
              </p>
            </div>
          ))}
        </div>

        {/* Mobile Auto-scrolling Carousel (Hidden on Desktop) */}
        <div className="md:hidden">
          <div className="relative overflow-hidden min-h-[90px] flex items-center justify-center text-center">
            {TRUST_STATS.map((stat, idx) => (
              <div
                key={idx}
                className={cn(
                  "absolute inset-0 flex flex-col justify-center items-center transition-all duration-500 ease-in-out px-4",
                  idx === activeIndex
                    ? "opacity-100 translate-x-0 pointer-events-auto"
                    : idx < activeIndex
                    ? "opacity-0 -translate-x-full pointer-events-none"
                    : "opacity-0 translate-x-full pointer-events-none",
                )}
              >
                <h3 className="text-[19px] sm:text-[20px] font-black text-neutral-950 mb-1 tracking-tight leading-snug">
                  {stat.title}
                </h3>
                <p className="text-[13px] sm:text-[14px] font-semibold text-neutral-600">
                  {stat.subtitle}
                </p>
              </div>
            ))}
          </div>

          {/* Interactive Navigation Dots */}
          <div className="flex items-center justify-center gap-2 mt-4">
            {TRUST_STATS.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveIndex(idx)}
                className={cn(
                  "h-2 rounded-full transition-all duration-300",
                  idx === activeIndex
                    ? "w-6 bg-lime-600"
                    : "w-2 bg-neutral-300 hover:bg-neutral-400",
                )}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
