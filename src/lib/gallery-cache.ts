import { BACKEND_MEDIA_HOSTS } from "@/lib/api/config";

export type CachedGalleryItem = { id: string; url: string };

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** Survives client-side navigations in the same tab (including blob: previews). */
const memoryGallery = new Map<string, CachedGalleryItem[]>();

function storageKey(professionalId: string) {
  return `9jaconnect.pro.gallery.${professionalId}`;
}

export function resolveMediaUrl(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("blob:") || trimmed.startsWith("data:")) {
    return trimmed;
  }

  // Already same-origin proxy paths.
  if (
    trimmed.startsWith("/api/v1/") ||
    trimmed.startsWith("/api/upstream/")
  ) {
    return trimmed;
  }

  try {
    if (
      trimmed.startsWith("http://") ||
      trimmed.startsWith("https://") ||
      trimmed.startsWith("//")
    ) {
      const absolute = trimmed.startsWith("//") ? `https:${trimmed}` : trimmed;
      const url = new URL(absolute);
      if (BACKEND_MEDIA_HOSTS.has(url.hostname)) {
        return `/api/upstream${url.pathname}${url.search}`;
      }
      return absolute;
    }
  } catch {
    return trimmed;
  }

  // Relative backend media path → same-origin upstream proxy.
  if (trimmed.startsWith("/")) return `/api/upstream${trimmed}`;
  return `/api/upstream/${trimmed}`;
}

export function isGalleryImageId(id: string) {
  return UUID_RE.test(id);
}

function normalizeItem(item: CachedGalleryItem): CachedGalleryItem | null {
  if (!item?.id) return null;
  const url = resolveMediaUrl(item.url) || item.url || "";
  return { id: item.id, url };
}

export function mergeGalleryItems(
  primary: CachedGalleryItem[],
  secondary: CachedGalleryItem[],
) {
  const byId = new Map<string, CachedGalleryItem>();
  for (const raw of [...secondary, ...primary]) {
    const item = normalizeItem(raw);
    if (!item) continue;
    const existing = byId.get(item.id);
    if (!existing) {
      byId.set(item.id, item);
      continue;
    }
    if (!existing.url && item.url) byId.set(item.id, item);
    else if (existing.url.startsWith("blob:") && item.url.startsWith("http")) {
      byId.set(item.id, item);
    }
  }
  return Array.from(byId.values());
}

export function readStoredGallery(professionalId: string): CachedGalleryItem[] {
  if (typeof window === "undefined" || !professionalId) return [];
  try {
    const raw = localStorage.getItem(storageKey(professionalId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((item) => {
        if (!item || typeof item !== "object") return null;
        const record = item as { id?: string; url?: string };
        if (!record.id || !isGalleryImageId(record.id)) return null;
        return {
          id: record.id,
          url: resolveMediaUrl(record.url) || "",
        };
      })
      .filter((item): item is CachedGalleryItem => Boolean(item));
  } catch {
    return [];
  }
}

export function writeStoredGallery(
  professionalId: string,
  items: CachedGalleryItem[],
) {
  if (typeof window === "undefined" || !professionalId) return;
  const payload = items
    .filter((item) => isGalleryImageId(item.id))
    .map((item) => ({
      id: item.id,
      // blob/data URLs are kept in memory only; persist durable http(s) URLs.
      url:
        item.url.startsWith("blob:") || item.url.startsWith("data:")
          ? ""
          : item.url,
    }));
  localStorage.setItem(storageKey(professionalId), JSON.stringify(payload));
}

export function setMemoryGallery(
  professionalId: string,
  items: CachedGalleryItem[],
) {
  if (!professionalId) return;
  memoryGallery.set(
    professionalId,
    items.map((item) => ({ id: item.id, url: item.url })),
  );
}

export function readMemoryGallery(professionalId: string): CachedGalleryItem[] {
  if (!professionalId) return [];
  return memoryGallery.get(professionalId) || [];
}

export function readCachedGallery(professionalId: string): CachedGalleryItem[] {
  return mergeGalleryItems(
    readMemoryGallery(professionalId),
    readStoredGallery(professionalId),
  );
}

export function syncCachedGallery(
  professionalId: string,
  items: CachedGalleryItem[],
) {
  setMemoryGallery(professionalId, items);
  writeStoredGallery(professionalId, items);
}

export function galleryUrlsFromCache(professionalId: string) {
  return readCachedGallery(professionalId)
    .map((item) => item.url)
    .filter(Boolean);
}
