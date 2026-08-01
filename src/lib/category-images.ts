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
  // Only return backend imageUrl if it's a valid non-empty HTTP/HTTPS URL
  if (imageUrl && (imageUrl.startsWith("http://") || imageUrl.startsWith("https://"))) {
    return imageUrl;
  }

  const slugClean = (slug || "").toLowerCase().trim();
  if (slugClean && CATEGORY_PHOTO_MAP[slugClean]) {
    return CATEGORY_PHOTO_MAP[slugClean];
  }

  const nameClean = (name || "").toLowerCase();

  if (nameClean.includes("electrical") || nameClean.includes("solar") || nameClean.includes("generator")) {
    return CATEGORY_PHOTO_MAP["electrical-solar-generator"];
  }
  if (nameClean.includes("plumb") || nameClean.includes("water")) {
    return CATEGORY_PHOTO_MAP["plumbing-water-systems"];
  }
  if (nameClean.includes("repair") || nameClean.includes("handyman")) {
    return CATEGORY_PHOTO_MAP["home-repairs-handyman"];
  }
  if (nameClean.includes("clean") || nameClean.includes("pest")) {
    return CATEGORY_PHOTO_MAP["cleaning-pest-control"];
  }
  if (nameClean.includes("auto") || nameClean.includes("transport") || nameClean.includes("logistics")) {
    return CATEGORY_PHOTO_MAP["auto-transport-logistics"];
  }
  if (nameClean.includes("construction") || nameClean.includes("carpentry") || nameClean.includes("metal")) {
    return CATEGORY_PHOTO_MAP["construction-carpentry-metal-works"];
  }
  if (nameClean.includes("beauty") || nameClean.includes("personal care")) {
    return CATEGORY_PHOTO_MAP["beauty-personal-care"];
  }
  if (nameClean.includes("fashion") || nameClean.includes("tailor")) {
    return CATEGORY_PHOTO_MAP["fashion-tailoring"];
  }
  if (nameClean.includes("event") || nameClean.includes("photo") || nameClean.includes("creative")) {
    return CATEGORY_PHOTO_MAP["events-photography-creative-services"];
  }
  if (nameClean.includes("domestic") || nameClean.includes("caregiving") || nameClean.includes("staff")) {
    return CATEGORY_PHOTO_MAP["domestic-staff-caregiving"];
  }
  if (nameClean.includes("education") || nameClean.includes("training") || nameClean.includes("business")) {
    return CATEGORY_PHOTO_MAP["education-training-business-services"];
  }
  if (nameClean.includes("ac") || nameClean.includes("refrigeration")) {
    return CATEGORY_PHOTO_MAP["ac-refrigeration"];
  }

  return CATEGORY_PHOTO_MAP["home-repairs-handyman"];
}
