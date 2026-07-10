import type { DirectoryProfessional, ProfessionalDetail } from "@/lib/api/types";
import type { Professional } from "@/lib/types";

function koboToNaira(kobo: number | null | undefined) {
  if (kobo == null || Number.isNaN(kobo)) return 0;
  return Math.round(kobo / 100);
}

function galleryUrls(pro: DirectoryProfessional | ProfessionalDetail) {
  if (!("gallery" in pro) || !Array.isArray(pro.gallery)) return [] as string[];
  return pro.gallery
    .map((item) => (typeof item === "string" ? item : item?.url))
    .filter((url): url is string => Boolean(url));
}

function coverUrl(
  pro: DirectoryProfessional | ProfessionalDetail,
  gallery: string[],
) {
  const explicit =
    ("cover_image_url" in pro && pro.cover_image_url) || null;
  return explicit || gallery[0] || null;
}

export function mapDirectoryProfessional(
  pro: DirectoryProfessional | ProfessionalDetail,
): Professional {
  const gallery = galleryUrls(pro);

  return {
    id: pro.id,
    name:
      ("full_name" in pro && pro.full_name) ||
      pro.business_name.split(/\s+/)[0] ||
      "Professional",
    tradeName: pro.business_name,
    coverImage: coverUrl(pro, gallery),
    galleryImages: gallery,
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
