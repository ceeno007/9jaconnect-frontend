const CATEGORY_PHOTO_MAP: Record<string, string> = {
  "home-repairs-handyman":
    "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80",
  "electrical-solar-generator":
    "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80",
  "plumbing-water-systems":
    "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=800&q=80",
  "cleaning-pest-control":
    "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80",
  "auto-transport-logistics":
    "https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=800&q=80",
  "construction-carpentry-metal-works":
    "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80",
  "beauty-personal-care":
    "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80",
  "fashion-tailoring":
    "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=800&q=80",
  "events-photography-creative-services":
    "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80",
  "domestic-staff-caregiving":
    "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&w=800&q=80",
  "education-training-business-services":
    "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=800&q=80",
  "ac-refrigeration":
    "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80",
  "painting-decorating":
    "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=800&q=80",
};

export function imageForCategory(
  slug?: string | null,
  name?: string | null,
  imageUrl?: string | null,
): string {
  if (imageUrl) return imageUrl;
  if (slug && CATEGORY_PHOTO_MAP[slug]) return CATEGORY_PHOTO_MAP[slug];

  const normalized = (name || "").toLowerCase();
  for (const [key, url] of Object.entries(CATEGORY_PHOTO_MAP)) {
    if (normalized.includes(key.replace(/-/g, " "))) {
      return url;
    }
  }

  return "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80";
}
