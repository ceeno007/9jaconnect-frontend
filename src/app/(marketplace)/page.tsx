"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CategoryImageCard } from "@/components/home/category-image-card";
import { MarketplaceAds } from "@/components/ads/marketplace-ads";
import { ListingCard } from "@/components/professionals/listing-card";
import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { listCategories, listProfessionals } from "@/lib/api";
import { mapDirectoryProfessional } from "@/lib/api/mappers";
import { IndeedStyleSearch } from "@/components/home/indeed-search";
import type { Category } from "@/lib/api/types";
import type { Professional } from "@/lib/types";

const HOW_IT_WORKS = [
  {
    stepLabel: "Step 1",
    title: "Post your job for free",
    body: "Our simple form will help you to provide the right detail for accurate, relevant quotes.",
    image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80",
  },
  {
    stepLabel: "Step 2",
    title: "Get quotes",
    body: "We'll match you with rated tradespeople who'll get in touch to discuss your needs.",
    image: "https://images.unsplash.com/photo-1512428559087-560fa5ceab42?auto=format&fit=crop&w=800&q=80",
  },
  {
    stepLabel: "Step 3",
    title: "Choose a tradesperson",
    body: "Check out their profile, reviews and gallery to pick the right person for the job.",
    image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80",
  },
];

const DEFAULT_POPULAR_CATEGORIES: Category[] = [
  { id: "electrical-solar-generator", name: "Electrical & Solar", slug: "electrical-solar-generator", icon_key: "bolt", display_order: 1, icon_url: null, image_url: null },
  { id: "plumbing-water-systems", name: "Plumbing & Water Systems", slug: "plumbing-water-systems", icon_key: "droplet", display_order: 2, icon_url: null, image_url: null },
  { id: "home-repairs-handyman", name: "Home Repairs & Handyman", slug: "home-repairs-handyman", icon_key: "hammer", display_order: 3, icon_url: null, image_url: null },
  { id: "ac-refrigeration", name: "AC & Refrigeration", slug: "ac-refrigeration", icon_key: "snowflake", display_order: 4, icon_url: null, image_url: null },
  { id: "cleaning-pest-control", name: "Cleaning & Pest Control", slug: "cleaning-pest-control", icon_key: "broom", display_order: 5, icon_url: null, image_url: null },
  { id: "auto-transport-logistics", name: "Auto & Logistics", slug: "auto-transport-logistics", icon_key: "car", display_order: 6, icon_url: null, image_url: null },
  { id: "construction-carpentry-metal-works", name: "Carpentry & Metal Works", slug: "construction-carpentry-metal-works", icon_key: "construction", display_order: 7, icon_url: null, image_url: null },
  { id: "painting-decorating", name: "Internal Painting & Decorating", slug: "painting-decorating", icon_key: "palette", display_order: 8, icon_url: null, image_url: null },
  { id: "events-photography-creative-services", name: "Events & Photography", slug: "events-photography-creative-services", icon_key: "camera", display_order: 9, icon_url: null, image_url: null },
];

export default function HomePage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [categories, setCategories] = useState<Category[]>(DEFAULT_POPULAR_CATEGORIES);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [prosLoading, setProsLoading] = useState(true);

  useEffect(() => {
    void listCategories()
      .then((res) => {
        if (res && res.length > 0) setCategories(res);
      })
      .catch(() => {
        // Keep default popular categories fallback
      });
    void listProfessionals({ page: 1, page_size: 8 })
      .then((data) =>
        setProfessionals(data.professionals.map(mapDirectoryProfessional)),
      )
      .catch(() => setProfessionals([]))
      .finally(() => setProsLoading(false));
  }, []);

  const isCustomer = isAuthenticated && user?.user_type === "customer";
  const isProfessional = isAuthenticated && user?.user_type === "professional";
  const showSignupCta = !authLoading && !isAuthenticated;
  const displayCategories = categories.length > 0 ? categories : DEFAULT_POPULAR_CATEGORIES;
  const featuredCategories = displayCategories.slice(0, 12);

  return (
    <>
      {/* Hero with search */}
      <section 
        className="relative min-h-[480px] sm:min-h-[560px] flex items-center sm:items-end bg-cover bg-center" 
        style={{ backgroundImage: `url(https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1920&q=80)` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/40" />
        <div className="relative z-10 mx-auto max-w-[1200px] w-full px-5 pb-10 sm:pb-14 pt-20 sm:pt-0">
          <h1 className="text-[32px] sm:text-[46px] font-bold leading-tight tracking-tight mb-3" style={{ color: '#ffffff' }}>
            Find trusted local tradespeople
          </h1>
          <p className="text-[16px] sm:text-[18px] max-w-2xl mb-8" style={{ color: 'rgba(255,255,255,0.9)' }}>
            Compare ratings, verified identity credentials, and hire with confidence across Nigeria.
          </p>
          <IndeedStyleSearch className="max-w-4xl" />
        </div>
      </section>

      {/* Trust Stats Strip - RatedPeople style */}
      <section className="bg-pure-white py-10 sm:py-12">
        <div className="mx-auto max-w-[1200px] px-5 sm:px-6 lg:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <h3 className="text-[20px] sm:text-[22px] font-black text-neutral-950 mb-1 tracking-tight">
                Over 10,000 rated tradespeople
              </h3>
              <p className="text-[14px] sm:text-[15px] font-semibold text-neutral-600">
                are ready to help you get your job done
              </p>
            </div>
            <div>
              <h3 className="text-[20px] sm:text-[22px] font-black text-neutral-950 mb-1 tracking-tight">
                Over 500,000 happy customers
              </h3>
              <p className="text-[14px] sm:text-[15px] font-semibold text-neutral-600">
                have found a quality local tradesperson
              </p>
            </div>
            <div>
              <h3 className="text-[20px] sm:text-[22px] font-black text-neutral-950 mb-1 tracking-tight">
                100% ID-verified professionals
              </h3>
              <p className="text-[14px] sm:text-[15px] font-semibold text-neutral-600">
                with real ratings & customer reviews
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Marketplace Ads */}
      <div className="bg-paper-warmth/30 pt-6">
        <MarketplaceAds
          pageContext="home"
          className="mx-auto max-w-[1200px] space-y-3 px-5 sm:px-6 lg:px-6"
        />
      </div>

      {/* Popular trades */}
      <section className="bg-paper-warmth/30 py-12 sm:py-16">
        <div className="mx-auto max-w-[1200px] px-5 sm:px-6 lg:px-6">
          <div className="text-center mb-10">
            <h2 className="text-[28px] sm:text-[36px] font-bold text-neutral-900 tracking-tight">
              Our most popular jobs
            </h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {categoriesLoading
              ? Array.from({ length: 9 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-[56px] animate-pulse rounded-[8px] bg-black/5"
                  />
                ))
              : featuredCategories.map((category) => (
                  <CategoryImageCard
                    key={category.id}
                    href={`/find?category=${category.id}`}
                    name={category.name}
                    slug={category.slug}
                    iconKey={category.icon_key}
                  />
                ))}
          </div>
        </div>
      </section>

      {/* How our service works */}
      <section className="bg-pure-white py-16 sm:py-20">
        <div className="mx-auto max-w-[1200px] px-5 sm:px-6 lg:px-6">
          {/* Section Heading */}
          <div className="text-center mb-12">
            <h2 className="text-[28px] sm:text-[38px] font-black text-neutral-950 tracking-tight">
              How our service works
            </h2>
          </div>
          
          {/* 3 Step Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {HOW_IT_WORKS.map((item) => (
              <div
                key={item.stepLabel}
                className="relative overflow-hidden rounded-2xl bg-white min-h-[340px] sm:min-h-[380px] p-6 sm:p-8 flex flex-col justify-between shadow-xs transition-all duration-200 hover:shadow-md"
                style={{
                  backgroundImage: `linear-gradient(to right, rgba(255, 255, 255, 0.97) 0%, rgba(255, 255, 255, 0.88) 60%, rgba(255, 255, 255, 0.35) 100%), url(${item.image})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center right",
                }}
              >
                <div className="max-w-[270px] relative z-10">
                  <h3 className="text-[22px] sm:text-[24px] font-black text-neutral-950 mb-3 leading-tight tracking-tight">
                    {item.title}
                  </h3>
                  <p className="text-[15px] font-semibold text-neutral-800 leading-relaxed">
                    {item.body}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Centered Action Button */}
          {!authLoading && !isCustomer ? (
            <div className="mt-12 text-center">
              {isProfessional ? (
                <Link href="/dashboard/professional">
                  <Button
                    size="lg"
                    className="rounded-lg bg-[#84cc16] hover:bg-[#65a30d] text-white font-bold px-10 py-6 text-[16px] shadow-sm transition-transform active:scale-[0.98]"
                  >
                    View job requests
                  </Button>
                </Link>
              ) : (
                <Link href="/signup/customer">
                  <Button
                    size="lg"
                    className="rounded-lg bg-[#84cc16] hover:bg-[#65a30d] text-white font-bold px-10 py-6 text-[16px] shadow-sm transition-transform active:scale-[0.98]"
                  >
                    Post a job
                  </Button>
                </Link>
              )}
            </div>
          ) : null}
        </div>
      </section>

      {/* Top Rated Professionals */}
      <section className="bg-paper-warmth/40 py-16 sm:py-20">
        <div className="mx-auto max-w-[1200px] px-5 sm:px-6 lg:px-6">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <h2 className="text-[24px] sm:text-[28px] font-semibold text-ink-black">
              Top rated professionals
            </h2>
            <Link
              href="/find"
              className="text-[14px] font-medium text-ink-black hover:underline"
            >
              Browse all →
            </Link>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {prosLoading
              ? Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={index}
                    className="listing-card h-72 animate-pulse bg-black/5 sm:h-80"
                  />
                ))
              : professionals.map((pro) => (
                  <ListingCard key={pro.id} professional={pro} />
                ))}
          </div>
        </div>
      </section>

      {/* Bottom Signup CTA */}
      {showSignupCta ? (
        <section className="bg-pure-white py-16 sm:py-20">
          <div className="mx-auto max-w-[800px] px-5 text-center">
            <h2 className="text-[28px] sm:text-[36px] font-semibold tracking-[-0.02em] text-ink-black mb-4">
              Ready to hire, or list your trade?
            </h2>
            <p className="text-[16px] sm:text-[18px] text-fog mb-8 max-w-2xl mx-auto">
              Join thousands of homeowners and businesses finding verified local tradespeople, or list your service to start receiving tickets today.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <Link href="/signup/customer">
                <Button size="lg" className="w-full sm:w-auto rounded-[8px]">
                  Sign Up as Customer
                </Button>
              </Link>
              <Link href="/signup/professional">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto rounded-[8px]">
                  List as Professional
                </Button>
              </Link>
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}

