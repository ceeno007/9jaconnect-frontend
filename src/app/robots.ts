import type { MetadataRoute } from "next";
import { ADMIN_AUTH_BASE } from "@/lib/admin-paths";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/admin/",
          `/${ADMIN_AUTH_BASE}`,
          `/${ADMIN_AUTH_BASE}/`,
          "/admin-gate",
          "/admin-gate/",
        ],
      },
    ],
    sitemap: "https://9jaconnect.vercel.app/sitemap.xml",
  };
}
