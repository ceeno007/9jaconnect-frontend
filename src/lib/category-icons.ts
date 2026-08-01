/**
 * Cute, colorful 3D/illustrated vector icons for all trade categories.
 * Served via Iconify CDN (noto-emoji set). All URLs verified 200 OK.
 */

const ICONIFY = (set: string, name: string, size = 48) =>
  `https://api.iconify.design/${set}/${name}.svg?width=${size}&height=${size}`;

export const CATEGORY_ICONS: Record<string, string> = {
  "home-repairs-handyman":              ICONIFY("noto", "hammer-and-wrench"),
  "electrical-solar-generator":         ICONIFY("noto", "high-voltage"),
  "plumbing-water-systems":             ICONIFY("noto", "potable-water"),
  "cleaning-pest-control":              ICONIFY("noto", "broom"),
  "auto-transport-logistics":           ICONIFY("noto", "automobile"),
  "construction-carpentry-metal-works": ICONIFY("noto", "building-construction"),
  "beauty-personal-care":               ICONIFY("noto", "lipstick"),
  "fashion-tailoring":                  ICONIFY("noto", "t-shirt"),
  "events-photography-creative-services": ICONIFY("noto", "camera"),
  "domestic-staff-caregiving":          ICONIFY("noto", "busts-in-silhouette"),
  "education-training-business-services": ICONIFY("noto", "graduation-cap"),
  "ac-refrigeration":                   ICONIFY("noto", "snowflake"),
  "painting-decorating":                ICONIFY("noto", "artist-palette"),
};

const KEYWORD_ICON_FALLBACKS: Array<{ match: RegExp; icon: string }> = [
  { match: /electr|solar|generat|bolt/,              icon: ICONIFY("noto", "high-voltage") },
  { match: /plumb|water|pipe/,                        icon: ICONIFY("noto", "potable-water") },
  { match: /clean|pest|spray|broom/,                  icon: ICONIFY("noto", "broom") },
  { match: /\b(auto|transport|logistic|truck|car)s?\b/, icon: ICONIFY("noto", "automobile") },
  { match: /construct|carpent|metal|hammer|tiler/,    icon: ICONIFY("noto", "building-construction") },
  { match: /beauty|salon|barber|hair|nail|lipstick/,  icon: ICONIFY("noto", "lipstick") },
  { match: /fashion|tailor|sew|cloth|shirt/,          icon: ICONIFY("noto", "t-shirt") },
  { match: /event|photo|camera|creative/,             icon: ICONIFY("noto", "camera") },
  { match: /domestic|caregiv|nanny|babysit|staff/,    icon: ICONIFY("noto", "busts-in-silhouette") },
  { match: /educat|train|business|school|grad/,       icon: ICONIFY("noto", "graduation-cap") },
  { match: /\bac\b|refriger|hvac|cool|aircon/,        icon: ICONIFY("noto", "snowflake") },
  { match: /repair|handyman|wrench|fix/,              icon: ICONIFY("noto", "hammer-and-wrench") },
  { match: /paint|decor/,                             icon: ICONIFY("noto", "artist-palette") },
  { match: /security|cctv|alarm|lock/,               icon: ICONIFY("noto", "locked-with-key") },
  { match: /garden|landscape|plant/,                  icon: ICONIFY("noto", "seedling") },
  { match: /roof|tile/,                               icon: ICONIFY("noto", "house") },
  { match: /weld|fabri|steel/,                        icon: ICONIFY("noto", "wrench") },
];

const DEFAULT_ICON = ICONIFY("noto", "hammer-and-wrench");

export function iconForCategory(
  slug?: string | null,
  name?: string | null,
  iconKey?: string | null,
): string {
  const slugKey = (slug ?? "").toLowerCase();
  if (slugKey && CATEGORY_ICONS[slugKey]) return CATEGORY_ICONS[slugKey];

  const haystack = `${slug ?? ""} ${name ?? ""} ${iconKey ?? ""}`.toLowerCase();
  for (const entry of KEYWORD_ICON_FALLBACKS) {
    if (entry.match.test(haystack)) return entry.icon;
  }
  return DEFAULT_ICON;
}
