"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { iconForCategory } from "@/components/home/category-icons";
import { MarketplaceAds } from "@/components/ads/marketplace-ads";
import { ListingCard } from "@/components/professionals/listing-card";
import { Button } from "@/components/ui/button";
import { listCategories, listProfessionals } from "@/lib/api";
import { mapDirectoryProfessional } from "@/lib/api/mappers";
import type { Category } from "@/lib/api/types";
import type { Professional } from "@/lib/types";

export default function HomePage() {
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

  return (
    <>
      <section className="mx-auto max-w-7xl border-b border-[#e4e2e0] px-4 py-16 lg:px-6">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-black sm:text-4xl">
              Browse categories
            </h2>
            <p className="mt-2 text-lg font-medium text-muted">
              Tap a category to browse professionals
            </p>
          </div>
          <Link
            href="/find"
            className="hidden text-base font-bold text-black hover:underline sm:inline"
          >
            See all
          </Link>
        </div>

        <div className="grid auto-rows-fr grid-cols-2 items-stretch gap-4 sm:grid-cols-4">
          {categoriesLoading
            ? Array.from({ length: 8 }).map((_, index) => (
                <div
                  key={index}
                  className="ui-card flex h-full min-h-[148px] flex-col items-center justify-center gap-3 px-5 py-7"
                >
                  <div className="h-10 w-10 animate-pulse rounded-full bg-[#e8e6e4]" />
                  <div className="h-4 w-24 animate-pulse rounded-[8px] bg-[#e8e6e4]" />
                </div>
              ))
            : categories.map((category) => {
                const Icon = iconForCategory(category.slug, category.icon_key);
                return (
                  <Link
                    key={category.id}
                    href={`/find?category=${category.id}`}
                    className="ui-card flex h-full min-h-[148px] flex-col items-center justify-center gap-3 px-5 py-7 text-center"
                  >
                    <Icon size={40} weight="duotone" className="shrink-0 text-black" />
                    <span className="line-clamp-2 text-base font-bold leading-snug">
                      {category.name}
                    </span>
                  </Link>
                );
              })}
        </div>
      </section>

      <MarketplaceAds
        pageContext="home"
        className="mx-auto max-w-7xl space-y-3 px-4 py-8 lg:px-6"
      />

      <section className="border-b border-[#e4e2e0] bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 lg:px-6">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-black sm:text-4xl">
                Top rated professionals
              </h2>
            </div>
            <Link
              href="/find"
              className="text-base font-bold text-black hover:underline"
            >
              Browse all
            </Link>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {prosLoading
              ? Array.from({ length: 8 }).map((_, index) => (
                  <div
                    key={index}
                    className="listing-card h-72 animate-pulse bg-[#f3f2f1]"
                  />
                ))
              : professionals.map((pro) => (
                  <ListingCard key={pro.id} professional={pro} />
                ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 lg:px-6">
        <div className="ui-card px-8 py-12 sm:px-12 sm:py-14">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-xl">
              <h2 className="text-4xl font-bold leading-tight text-black sm:text-5xl">
                Ready to hire, or get hired?
              </h2>
              <p className="mt-4 text-lg font-medium text-muted">
                Create a customer account to request services, or list as a
                professional and start receiving tickets.
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              <Link href="/signup/customer">
                <Button size="lg">Sign Up as Customer</Button>
              </Link>
              <Link href="/signup/professional">
                <Button variant="outline" size="lg">
                  Sign Up as Professional
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
