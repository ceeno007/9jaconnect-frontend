"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SITE } from "@/lib/constants";
import { listCategories } from "@/lib/api";
import type { Category } from "@/lib/api/types";

const platformLinks = [
  { href: "/find", label: "Find Professionals" },
  { href: "/signup/customer", label: "Sign Up as Customer" },
  { href: "/signup/professional", label: "Sign Up as Professional" },
  { href: "/login", label: "Login" },
];

const legalLinks = [
  { href: "/terms", label: "Terms" },
  { href: "/privacy", label: "Privacy" },
  { href: "/listing-guidelines", label: "Listing Guidelines" },
];

export function Footer() {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    void listCategories()
      .then((items) => setCategories(items.slice(0, 6)))
      .catch(() => setCategories([]));
  }, []);

  return (
    <footer className="mt-auto border-t border-[#e4e2e0] bg-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:grid-cols-2 lg:grid-cols-3 lg:px-6">
        <div>
          <h3 className="text-base font-bold text-black">Platform</h3>
          <ul className="mt-4 space-y-3 text-base font-semibold text-muted">
            {platformLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="transition hover:text-black">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-base font-bold text-black">Categories</h3>
          <ul className="mt-4 space-y-3 text-base font-semibold text-muted">
            {categories.map((category) => (
              <li key={category.id}>
                <Link
                  href={`/find?category=${category.id}`}
                  className="transition hover:text-black"
                >
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-base font-bold text-black">Contact</h3>
          <ul className="mt-4 space-y-3 text-base font-semibold text-muted">
            <li>
              <a
                href={`mailto:${SITE.email}`}
                className="transition hover:text-black hover:underline"
              >
                {SITE.email}
              </a>
            </li>
            <li>
              <a
                href={`tel:${SITE.phone.replace(/\s+/g, "")}`}
                className="transition hover:text-black hover:underline"
              >
                {SITE.phone}
              </a>
            </li>
            <li>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(SITE.address)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="transition hover:text-black hover:underline"
              >
                {SITE.address}
              </a>
            </li>
          </ul>
          <ul className="mt-6 space-y-3 text-base font-semibold text-muted">
            {legalLinks.map((link) => (
              <li key={link.label}>
                <Link href={link.href} className="transition hover:text-black">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-[#e4e2e0] bg-[#fafafa]">
        <div className="mx-auto max-w-7xl px-4 py-5 text-sm font-semibold text-muted lg:px-6">
          <p>© {new Date().getFullYear()} 9jaconnect. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
