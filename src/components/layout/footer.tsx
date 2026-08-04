"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { isAdminAreaPath, isAdminAuthPath } from "@/lib/admin-paths";
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
  const pathname = usePathname();
  const [categories, setCategories] = useState<Category[]>([]);
  const hideChrome = isAdminAreaPath(pathname) || isAdminAuthPath(pathname);

  useEffect(() => {
    if (hideChrome) return;
    void listCategories()
      .then((items) => setCategories(items.slice(0, 6)))
      .catch(() => setCategories([]));
  }, [hideChrome]);

  if (hideChrome) return null;

  return (
    <footer className="mt-auto border-t border-cloud bg-snow">
      <div className="page-x mx-auto grid max-w-[1200px] gap-10 py-14 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <h3 className="text-[14px] font-semibold text-obsidian">Platform</h3>
          <ul className="mt-4 space-y-3 text-[14px] font-normal text-steel">
            {platformLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="transition hover:text-obsidian">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-[14px] font-semibold text-obsidian">Categories</h3>
          <ul className="mt-4 space-y-3 text-[14px] font-normal text-steel">
            {categories.map((category) => (
              <li key={category.id}>
                <Link
                  href={`/find?category=${category.id}`}
                  className="transition hover:text-obsidian"
                >
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-[14px] font-semibold text-obsidian">Contact</h3>
          <ul className="mt-4 space-y-3 text-[14px] font-normal text-steel">
            <li>
              <a
                href={`mailto:${SITE.email}`}
                className="transition hover:text-obsidian hover:underline"
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
          <ul className="mt-6 space-y-3 text-[14px] font-normal text-steel">
            {legalLinks.map((link) => (
              <li key={link.label}>
                <Link href={link.href} className="transition hover:text-obsidian">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-cloud bg-paper">
        <div className="page-x mx-auto max-w-[1200px] py-5 text-[13px] font-normal text-fog">
          <p>© {new Date().getFullYear()} 9jaconnect. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
