export type CountryCode = "ng" | "gh" | "ke" | "za" | "gb" | "us";
export type LanguageCode = "en";
export type LocaleCode = `${CountryCode}-${LanguageCode}`;

export const DEFAULT_COUNTRY: CountryCode = "ng";
export const DEFAULT_LANGUAGE: LanguageCode = "en";
export const DEFAULT_LOCALE: LocaleCode = "ng-en";

export const SUPPORTED_LOCALES: Record<LocaleCode, { countryName: string; languageName: string; flag: string }> = {
  "ng-en": { countryName: "Nigeria", languageName: "English", flag: "🇳🇬" },
  "gh-en": { countryName: "Ghana", languageName: "English", flag: "🇬🇭" },
  "ke-en": { countryName: "Kenya", languageName: "English", flag: "🇰🇪" },
  "za-en": { countryName: "South Africa", languageName: "English", flag: "🇿🇦" },
  "gb-en": { countryName: "United Kingdom", languageName: "English", flag: "🇬🇧" },
  "us-en": { countryName: "United States", languageName: "English", flag: "🇺🇸" },
};

const LOCALE_STORAGE_KEY = "9jaconnect.locale";
const LOCALE_COOKIE_KEY = "9jaconnect_locale";

export function getCountryFromLocale(locale: LocaleCode | string): CountryCode {
  const parts = locale.split("-");
  return (parts[0]?.toLowerCase() as CountryCode) || DEFAULT_COUNTRY;
}

export function getLanguageFromLocale(locale: LocaleCode | string): LanguageCode {
  const parts = locale.split("-");
  return (parts[1]?.toLowerCase() as LanguageCode) || DEFAULT_LANGUAGE;
}

export function detectUserLocale(): LocaleCode {
  if (typeof window === "undefined") return DEFAULT_LOCALE;

  try {
    const saved = localStorage.getItem(LOCALE_STORAGE_KEY) as LocaleCode;
    if (saved && SUPPORTED_LOCALES[saved]) return saved;

    const navLang = navigator.language || (navigator.languages && navigator.languages[0]) || "";
    if (navLang.toLowerCase().includes("ng")) return "ng-en";
    if (navLang.toLowerCase().includes("gh")) return "gh-en";
    if (navLang.toLowerCase().includes("ke")) return "ke-en";
    if (navLang.toLowerCase().includes("za")) return "za-en";
    if (navLang.toLowerCase().includes("gb")) return "gb-en";
    if (navLang.toLowerCase().includes("us")) return "us-en";
  } catch {
    // Fallback to default locale
  }

  return DEFAULT_LOCALE;
}

export function setUserLocale(locale: LocaleCode): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    document.cookie = `${LOCALE_COOKIE_KEY}=${locale}; path=/; max-age=31536000; SameSite=Lax`;
  } catch {
    // Ignore storage errors
  }
}
