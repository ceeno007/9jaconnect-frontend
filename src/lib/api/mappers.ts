import type { DirectoryProfessional, ProfessionalDetail } from "@/lib/api/types";
import type { Professional } from "@/lib/types";

const FALLBACK_COVERS = [
  "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?auto=format&fit=crop&w=1200&q=80",
];

function coverFor(id: string, explicit?: string | null) {
  if (explicit) return explicit;
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) hash = (hash + id.charCodeAt(i)) % 997;
  return FALLBACK_COVERS[hash % FALLBACK_COVERS.length];
}

function koboToNaira(kobo: number | null | undefined) {
  if (kobo == null || Number.isNaN(kobo)) return 0;
  return Math.round(kobo / 100);
}

export function mapDirectoryProfessional(
  pro: DirectoryProfessional | ProfessionalDetail,
): Professional {
  const gallery =
    "gallery" in pro && Array.isArray(pro.gallery)
      ? pro.gallery
          .map((g) => (typeof g === "string" ? g : g.url))
          .filter(Boolean)
      : [];

  const cover =
    ("cover_image_url" in pro && pro.cover_image_url) ||
    gallery[0] ||
    coverFor(pro.id);

  return {
    id: pro.id,
    name:
      ("full_name" in pro && pro.full_name) ||
      pro.business_name.split(/\s+/)[0] ||
      "Professional",
    tradeName: pro.business_name,
    coverImage: cover,
    category: pro.category_name,
    state: pro.state_name,
    lga: pro.lga_name,
    rating: Number(Number(pro.avg_rating ?? 0).toFixed(1)),
    reviews: pro.review_count ?? 0,
    hourlyRate: koboToNaira(pro.hourly_rate_kobo),
    dayRate: koboToNaira(pro.daily_rate_kobo),
    projectRate: koboToNaira(pro.monthly_rate_kobo),
    verified: Boolean(pro.is_verified),
    years: pro.years_of_experience ?? 0,
    description: pro.service_description || "",
  };
}

export function nairaToKobo(naira: number) {
  return Math.round(naira * 100);
}
