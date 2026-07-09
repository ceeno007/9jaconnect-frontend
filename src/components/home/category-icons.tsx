import type { Icon } from "@phosphor-icons/react";
import {
  Baby,
  BatteryCharging,
  Broom,
  Camera,
  Car,
  Fan,
  GraduationCap,
  Hammer,
  Lightning,
  PaintBrushHousehold,
  PipeWrench,
  Scissors,
  Sparkle,
  SquaresFour,
  Truck,
  Wrench,
} from "@phosphor-icons/react";

export const CATEGORY_ICONS: Record<string, Icon> = {
  // legacy mock slugs
  electricians: Lightning,
  plumbers: PipeWrench,
  carpenters: Hammer,
  painters: PaintBrushHousehold,
  cleaners: Broom,
  "ac-technicians": Fan,
  generators: BatteryCharging,
  tilers: SquaresFour,

  // live API slugs / icon keys
  "home-repairs-handyman": Wrench,
  "wrench-hammer": Wrench,
  "electrical-solar-and-generator": Lightning,
  electrical: Lightning,
  "plumbing-and-water-systems": PipeWrench,
  plumbing: PipeWrench,
  "cleaning-and-pest-control": Broom,
  cleaning: Broom,
  "auto-transport-and-logistics": Car,
  "construction-carpentry-and-metal-works": Hammer,
  carpentry: Hammer,
  "beauty-and-personal-care": Sparkle,
  "fashion-and-tailoring": Scissors,
  "events-photography-and-creative-services": Camera,
  "domestic-staff-and-caregiving": Baby,
  "education-training-and-business-services": GraduationCap,
  "ac-and-refrigeration": Fan,
};

export function iconForCategory(slug?: string | null, iconKey?: string | null) {
  const slugKey = (slug || "").toLowerCase();
  const icon = (iconKey || "").toLowerCase();

  if (CATEGORY_ICONS[slugKey]) return CATEGORY_ICONS[slugKey];
  if (CATEGORY_ICONS[icon]) return CATEGORY_ICONS[icon];

  if (
    slugKey.includes("electr") ||
    slugKey.includes("solar") ||
    slugKey.includes("generat") ||
    icon.includes("bolt") ||
    icon.includes("lightning")
  ) {
    return Lightning;
  }
  if (slugKey.includes("plumb") || slugKey.includes("water")) {
    return PipeWrench;
  }
  if (
    slugKey.includes("clean") ||
    slugKey.includes("pest") ||
    icon.includes("broom")
  ) {
    return Broom;
  }
  if (
    slugKey.includes("auto") ||
    slugKey.includes("transport") ||
    slugKey.includes("logistic") ||
    slugKey.includes("vehicle")
  ) {
    return Car;
  }
  if (
    slugKey.includes("construct") ||
    slugKey.includes("carpent") ||
    slugKey.includes("metal") ||
    slugKey.includes("wood")
  ) {
    return Hammer;
  }
  if (
    slugKey.includes("beauty") ||
    slugKey.includes("personal-care") ||
    slugKey.includes("salon")
  ) {
    return Sparkle;
  }
  if (
    slugKey.includes("fashion") ||
    slugKey.includes("tailor") ||
    slugKey.includes("sew")
  ) {
    return Scissors;
  }
  if (
    slugKey.includes("event") ||
    slugKey.includes("photo") ||
    slugKey.includes("creative")
  ) {
    return Camera;
  }
  if (
    slugKey.includes("domestic") ||
    slugKey.includes("caregiv") ||
    slugKey.includes("nanny") ||
    slugKey.includes("care")
  ) {
    return Baby;
  }
  if (
    slugKey.includes("educat") ||
    slugKey.includes("train") ||
    slugKey.includes("business") ||
    slugKey.includes("tutor")
  ) {
    return GraduationCap;
  }
  if (slugKey.includes("paint")) return PaintBrushHousehold;
  if (slugKey.includes("ac") || slugKey.includes("refrig")) return Fan;
  if (slugKey.includes("tile")) return SquaresFour;
  if (
    slugKey.includes("handyman") ||
    slugKey.includes("repair") ||
    slugKey.includes("home")
  ) {
    return Wrench;
  }
  if (slugKey.includes("truck") || slugKey.includes("delivery")) return Truck;

  return Wrench;
}
