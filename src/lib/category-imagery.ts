/** Curated marketplace photography for categories and empty listing covers.
 *  Backend categories currently ship without image_url; these fill the Awesomic
 *  image-top cards and breakthrough sections until API media exists. */

const U = (id: string, w = 1200) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

export const BREAKTHROUGH_IMAGE = U("photo-1615729947596-a598e5de0ab3", 2000);

export const CATEGORY_IMAGES: Record<string, string> = {
  "home-repairs-handyman": U("photo-1504148455328-c376907d081c"),
  "electrical-solar-generator": U("photo-1621905251189-08b45d6a269e"),
  "plumbing-water-systems": U("photo-1607472586893-edb57bdc0e39"),
  "cleaning-pest-control": U("photo-1581578731548-c64695cc6952"),
  "auto-transport-logistics": U("photo-1486262715619-67b85e0b08d3"),
  "construction-carpentry-metal-works": U("photo-1504307651254-35680f356dfd"),
  "beauty-personal-care": U("photo-1560066984-138dadb4c035"),
  "fashion-tailoring": U("photo-1445205170230-053b83016050"),
  "events-photography-creative-services": U("photo-1492684223066-81342ee5ff30"),
  "domestic-staff-caregiving": U("photo-1555252333-9f8e92e65df9"),
  "education-training-business-services": U("photo-1434030216411-0b793f4b4173"),
  "ac-refrigeration": U("photo-1631545806609-c2b555c1610a"),
};

const KEYWORD_FALLBACKS: Array<{ match: RegExp; image: string }> = [
  {
    match: /electr|solar|generat|bolt|lightning/,
    image: CATEGORY_IMAGES["electrical-solar-generator"],
  },
  {
    match: /plumb|water|droplet/,
    image: CATEGORY_IMAGES["plumbing-water-systems"],
  },
  {
    match: /clean|pest|spray|broom/,
    image: U("photo-1581578731548-c64695cc6952"),
  },
  {
    match: /\b(auto|transport|logistic|truck)s?\b|\bcars?\b/,
    image: CATEGORY_IMAGES["auto-transport-logistics"],
  },
  {
    match: /construct|carpent|metal|hard.?hat|hammer|tiler/,
    image: CATEGORY_IMAGES["construction-carpentry-metal-works"],
  },
  {
    match: /beauty|personal|sparkle|salon|barber/,
    image: CATEGORY_IMAGES["beauty-personal-care"],
  },
  {
    match: /fashion|tailor|shirt|sew/,
    image: CATEGORY_IMAGES["fashion-tailoring"],
  },
  {
    match: /event|photo|creative|camera/,
    image: CATEGORY_IMAGES["events-photography-creative-services"],
  },
  {
    match: /domestic|caregiv|nanny|babysit|\bstaff\b/,
    image: CATEGORY_IMAGES["domestic-staff-caregiving"],
  },
  {
    match: /educat|train|business|graduat/,
    image: CATEGORY_IMAGES["education-training-business-services"],
  },
  {
    match: /\bac\b|refriger|hvac|cool/,
    image: CATEGORY_IMAGES["ac-refrigeration"],
  },
  {
    match: /repair|handyman|wrench/,
    image: CATEGORY_IMAGES["home-repairs-handyman"],
  },
];

const DEFAULT_TRADE_IMAGE = U("photo-1504307651254-35680f356dfd");

export function imageForCategory(
  slug?: string | null,
  name?: string | null,
  iconKey?: string | null,
) {
  const slugKey = (slug || "").toLowerCase();
  if (slugKey && CATEGORY_IMAGES[slugKey]) return CATEGORY_IMAGES[slugKey];

  const haystack = `${slug || ""} ${name || ""} ${iconKey || ""}`.toLowerCase();
  for (const entry of KEYWORD_FALLBACKS) {
    if (entry.match.test(haystack)) return entry.image;
  }
  return DEFAULT_TRADE_IMAGE;
}
