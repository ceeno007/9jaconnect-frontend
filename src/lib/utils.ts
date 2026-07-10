import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Digits only from a money input that may include commas. */
export function parseMoneyInput(value: string) {
  const digits = value.replace(/[^\d]/g, "");
  if (!digits) return "";
  return String(Number(digits));
}

/** Format a money string/number with thousand separators, e.g. 1500000 → 1,500,000 */
export function formatMoneyInput(value: string | number) {
  const raw = String(value ?? "").replace(/[^\d]/g, "");
  if (!raw) return "";
  return Number(raw).toLocaleString("en-NG");
}

