"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CategoryImageCard } from "@/components/home/category-image-card";
import { PixelArtBanner } from "@/components/home/pixel-art-banner";
import { MarketplaceAds } from "@/components/ads/marketplace-ads";
import { ListingCard } from "@/components/professionals/listing-card";
import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { listCategories, listProfessionals } from "@/lib/api";
import { mapDirectoryProfessional } from "@/lib/api/mappers";
import type { Category } from "@/lib/api/types";
import type { Professional } from "@/lib/types";

const HOW_IT_WORKS = [
  {
    title: "Search by trade and location",
    body: "Filter by category, state, and LGA to find pros near you.",
  },
  {
    title: "Review profiles and rates",
    body: "Check experience, services, and pricing before you reach out.",
  },
  {
    title: "Request and hire with confidence",
    body: "Send a ticket, chat on the arrangement, and get the job done.",
  },
];

export default function HomePage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [prosLoading, setProsLoading] = useState(true);

  useEffect(() => {
    void listCategories()
      .then(setCategories)
      .catch(() => setCategories([]))
      .finally(() => setCategoriesLoading(false));
    void listProfessionals({ page: 1, page_size: 8 })
      .then((data) =>
        setProfessionals(data.professionals.map(mapDirectoryProfessional)),
      )
      .catch(() => setProfessionals([]))
      .finally(() => setProsLoading(false));
  }, []);

  const showSignupCta = !authLoading && !isAuthenticated;
  const featuredCategories = categories.slice(0, 8);

  return (
    <>
      <section className="mx-auto max-w-[1200px] px-4 py-16 lg:px-6 lg:py-20">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl">
            <h2 className="display-tight text-[40px] font-semibold tracking-[-0.035em] text-ink-black sm:text-[48px]">
              Browse categories
            </h2>
            <p className="font-editorial mt-3 text-[18px] leading-[1.56] text-fog">
              Tap a category to browse professionals near you.
            </p>
          </div>
          <Link
            href="/find"
            className="hidden rounded-[8px] px-3 py-2 text-[14px] font-medium text-ink-black/60 transition hover:text-ink-black sm:inline"
          >
            See all
          </Link>
        </div>

        <div className="grid auto-rows-fr grid-cols-2 items-stretch gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {categoriesLoading
            ? Array.from({ length: 8 }).map((_, index) => (
                <div
                  key={index}
                  className="min-h-[220px] animate-pulse overflow-hidden rounded-[12px] border border-black/[0.08] bg-pure-white"
                >
                  <div className="aspect-[4/3] bg-paper-warmth" />
                  <div className="space-y-3 p-6">
                    <div className="h-5 w-2/3 rounded-[4px] bg-paper-warmth" />
                    <div className="h-6 w-16 rounded-full bg-paper-warmth" />
                  </div>
                </div>
              ))
            : featuredCategories.map((category, index) => (
                <CategoryImageCard
                  key={category.id}
                  href={`/find?category=${category.id}`}
                  name={category.name}
                  slug={category.slug}
                  iconKey={category.icon_key}
                  accent={
                    index === 0 ? "marigold" : index === 1 ? "coral" : null
                  }
                />
              ))}
        </div>
      </section>

      <PixelArtBanner className="pb-4" />

      <section className="px-4 lg:px-6">
        <div className="mx-auto grid max-w-[1200px] gap-4 sm:grid-cols-3">
          <div className="rounded-[12px] bg-marigold p-6 sm:p-8">
            <p className="text-[14px] font-medium text-ink-black/60">Find</p>
            <p className="mt-2 text-[22px] font-semibold tracking-[-0.01em] text-ink-black">
              Pros by trade and location
            </p>
          </div>
          <div className="rounded-[12px] bg-coral p-6 text-pure-white sm:p-8">
            <p className="text-[14px] font-medium text-white/70">Verify</p>
            <p className="mt-2 text-[22px] font-semibold tracking-[-0.01em]">
              Check ID-verified listings
            </p>
          </div>
          <div className="rounded-[12px] bg-sky-wash p-6 sm:p-8">
            <p className="text-[14px] font-medium text-ink-black/60">Hire</p>
            <p className="mt-2 text-[22px] font-semibold tracking-[-0.01em] text-ink-black">
              Request tickets and chat
            </p>
          </div>
        </div>
      </section>

      <MarketplaceAds
        pageContext="home"
        className="mx-auto max-w-[1200px] space-y-3 px-4 py-8 lg:px-6"
      />

      <section className="bg-pure-white">
        <div className="mx-auto max-w-[1200px] px-4 py-16 lg:px-6 lg:py-20">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="mb-3">
                <span className="badge-marigold">Top rated</span>
              </div>
              <h2 className="display-tight text-[40px] font-semibold tracking-[-0.035em] text-ink-black sm:text-[48px]">
                Professionals near you
              </h2>
            </div>
            <Link
              href="/find"
              className="rounded-[8px] px-3 py-2 text-[14px] font-medium text-ink-black/60 transition hover:text-ink-black"
            >
              Browse all
            </Link>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {prosLoading
              ? Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={index}
                    className="listing-card h-72 animate-pulse bg-paper-warmth"
                  />
                ))
              : professionals.map((pro) => (
                  <ListingCard key={pro.id} professional={pro} />
                ))}
          </div>
        </div>
      </section>

      <section className="bg-paper-warmth">
        <div className="mx-auto grid max-w-[1200px] gap-6 px-4 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:px-6 lg:py-20">
          <div className="rounded-[12px] bg-midnight-ink p-8 text-pure-white sm:p-10">
            <h2 className="text-[40px] font-semibold leading-[1.14] tracking-[-0.035em] text-pure-white !text-[#ffffff] sm:text-[48px]">
              Hire in three clear steps
            </h2>
            <ul className="mt-8 space-y-5">
              {HOW_IT_WORKS.map((item) => (
                <li key={item.title} className="flex gap-3">
                  <ArrowRight className="mt-1 h-5 w-5 shrink-0 text-marigold" />
                  <div>
                    <p className="text-[18px] font-medium sm:text-[20px]">
                      {item.title}
                    </p>
                    <p className="mt-1 text-[14px] font-normal text-white/60">
                      {item.body}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col justify-between gap-8 rounded-[12px] bg-marigold p-8 sm:p-10">
            <div>
              <p className="display-tighter text-[96px] font-bold leading-[0.9] text-ink-black sm:text-[128px]">
                11+
              </p>
              <p className="mt-3 text-[16px] font-normal text-ink-black/70">
                service categories across Nigeria
              </p>
              <div className="mt-8 flex flex-wrap gap-2">
                <span className="rounded-full bg-pure-white/80 px-3 py-1 text-[12px] font-medium text-ink-black">
                  Verified ID
                </span>
                <span className="rounded-full bg-pure-white/80 px-3 py-1 text-[12px] font-medium text-ink-black">
                  State + LGA filters
                </span>
                <span className="rounded-full bg-ink-black px-3 py-1 text-[12px] font-medium text-pure-white">
                  Live tickets
                </span>
              </div>
            </div>
            <Link href="/find">
              <Button size="lg" className="w-full sm:w-auto">
                Start browsing
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {showSignupCta ? (
        <section className="mx-auto max-w-[1200px] px-4 py-16 lg:px-6 lg:py-20">
          <div className="ui-card overflow-hidden px-8 py-12 sm:px-12 sm:py-14">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-xl">
                <h2 className="text-[48px] font-semibold leading-[1.04] tracking-[-0.035em] text-ink-black sm:text-[54px]">
                  Ready to{" "}
                  <span className="rounded-full bg-peach-pill px-4 py-1">
                    hire
                  </span>
                  , or get hired?
                </h2>
                <p className="font-editorial mt-4 text-[18px] leading-[1.56] text-fog">
                  Create a customer account to request services, or list as a
                  professional and start receiving tickets.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link href="/signup/customer">
                  <Button size="lg">Sign Up as Customer</Button>
                </Link>
                <Link href="/signup/professional">
                  <Button variant="secondary" size="lg">
                    Sign Up as Professional
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
