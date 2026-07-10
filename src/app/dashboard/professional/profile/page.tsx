"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState, PageShell } from "@/components/ui/primitives";
import { FormSkeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/components/providers/auth-provider";
import {
  listCategories,
  listLgas,
  listStates,
  listSubcategories,
} from "@/lib/api";
import {
  createProfessionalService,
  deleteProfessionalGalleryImage,
  deleteProfessionalService,
  getMyProfessional,
  listProfessionalServices,
  serviceDisplayName,
  updateProfessional,
  uploadProfessionalGalleryImage,
} from "@/lib/api/auth-client";
import {
  isGalleryImageId,
  mergeGalleryItems,
  readCachedGallery,
  resolveMediaUrl,
  syncCachedGallery,
  type CachedGalleryItem,
} from "@/lib/gallery-cache";
import { nairaToKobo } from "@/lib/api/mappers";
import type {
  Category,
  Lga,
  ProfessionalService,
  State,
  Subcategory,
} from "@/lib/api/types";
import { ApiError } from "@/lib/api/types";
import { formatMoneyInput, parseMoneyInput } from "@/lib/utils";

type GalleryItem = CachedGalleryItem;
type UploadingItem = {
  id: string;
  url: string;
  name: string;
  progress: number;
};

const MAX_GALLERY_IMAGE_MB = 5;
const MAX_GALLERY_IMAGE_BYTES = MAX_GALLERY_IMAGE_MB * 1024 * 1024;
const MAX_GALLERY_ITEMS = 5;
const ACCEPTED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
]);

function isGalleryLimitError(err: unknown) {
  if (!(err instanceof ApiError)) return false;
  const haystack = `${err.code || ""} ${err.message || ""}`.toLowerCase();
  return haystack.includes("limit") || haystack.includes("only have 5");
}

function galleryFields(record: Record<string, unknown>) {
  const id =
    (typeof record.id === "string" && record.id) ||
    (typeof record.image_id === "string" && record.image_id) ||
    (typeof record.gallery_image_id === "string" && record.gallery_image_id) ||
    null;
  const url = resolveMediaUrl(
    record.url ||
      record.image_url ||
      record.file_url ||
      record.public_url ||
      record.cdn_url ||
      record.path ||
      record.storage_path,
  );
  return { id, url };
}

function readGallery(pro: unknown): GalleryItem[] {
  if (!pro || typeof pro !== "object") return [];
  const gallery = (pro as { gallery?: unknown }).gallery;
  if (!Array.isArray(gallery)) return [];
  return gallery
    .map((item, index) => {
      if (typeof item === "string") {
        const url = resolveMediaUrl(item);
        return url ? { id: `gallery-${index}`, url } : null;
      }
      if (!item || typeof item !== "object") return null;
      const { id, url } = galleryFields(item as Record<string, unknown>);
      if (!id && !url) return null;
      return { id: id || `gallery-${index}`, url: url || "" };
    })
    .filter((item): item is GalleryItem => Boolean(item));
}

function parseUploadResult(
  data: unknown,
  fallbackUrl: string,
  fallbackId: string,
): GalleryItem {
  const root =
    data && typeof data === "object" ? (data as Record<string, unknown>) : {};
  const candidates: Record<string, unknown>[] = [root];
  for (const key of ["gallery_image", "image", "file", "item", "data"]) {
    const value = root[key];
    if (value && typeof value === "object" && !Array.isArray(value)) {
      candidates.push(value as Record<string, unknown>);
    }
  }

  for (const candidate of candidates) {
    const { id, url } = galleryFields(candidate);
    if (id || url) {
      return {
        id: id || fallbackId,
        url: url || fallbackUrl,
      };
    }
  }

  return {
    id: fallbackId,
    url: fallbackUrl,
  };
}

export default function ProfessionalProfileEditPage() {
  const { isAuthenticated, loading: authLoading, user } = useAuth();
  const toast = useToast();
  const [professionalId, setProfessionalId] = useState(
    user?.professional_id || "",
  );
  const [states, setStates] = useState<State[]>([]);
  const [lgas, setLgas] = useState<Lga[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [stateId, setStateId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [lgaId, setLgaId] = useState("");
  const [subcategoryId, setSubcategoryId] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [years, setYears] = useState("0");
  const [hourly, setHourly] = useState("");
  const [daily, setDaily] = useState("");
  const [monthly, setMonthly] = useState("");
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [uploading, setUploading] = useState<UploadingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);
  const [galleryPending, setGalleryPending] = useState(false);
  const [serverGalleryFull, setServerGalleryFull] = useState(false);
  const [services, setServices] = useState<ProfessionalService[]>([]);
  const [serviceName, setServiceName] = useState("");
  const [servicesPending, setServicesPending] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadingUrlsRef = useRef<string[]>([]);
  const gallerySlotsLeft = serverGalleryFull
    ? 0
    : Math.max(0, MAX_GALLERY_ITEMS - gallery.length);

  useEffect(() => {
    uploadingUrlsRef.current = uploading.map((item) => item.url);
  }, [uploading]);

  useEffect(() => {
    return () => {
      uploadingUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  useEffect(() => {
    if (!professionalId || loading) return;
    syncCachedGallery(professionalId, gallery);
  }, [professionalId, gallery, loading]);

  useEffect(() => {
    void Promise.all([listStates(), listCategories()]).then(
      ([nextStates, nextCategories]) => {
        setStates(nextStates);
        setCategories(nextCategories);
      },
    );
  }, []);

  useEffect(() => {
    if (!stateId) {
      setLgas([]);
      return;
    }
    void listLgas(stateId).then(setLgas);
  }, [stateId]);

  useEffect(() => {
    if (!categoryId) {
      setSubcategories([]);
      return;
    }
    void listSubcategories(categoryId).then(setSubcategories);
  }, [categoryId]);

  useEffect(() => {
    if (authLoading || !isAuthenticated) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    void getMyProfessional()
      .then(async (pro) => {
        if (cancelled) return;
        setProfessionalId(pro.id);
        setBusinessName(pro.business_name || "");
        setDescription(pro.service_description || "");
        setAddress(
          ("business_address" in pro &&
            String(pro.business_address || "")) ||
            "",
        );
        setYears(String(pro.years_of_experience ?? 0));
        setStateId(pro.state_id || "");
        setLgaId(pro.lga_id || "");
        setCategoryId(pro.category_id || "");
        setSubcategoryId(pro.subcategory_id || "");
        setHourly(
          pro.hourly_rate_kobo != null
            ? formatMoneyInput(Math.round(pro.hourly_rate_kobo / 100))
            : "",
        );
        setDaily(
          pro.daily_rate_kobo != null
            ? formatMoneyInput(Math.round(pro.daily_rate_kobo / 100))
            : "",
        );
        setMonthly(
          pro.monthly_rate_kobo != null
            ? formatMoneyInput(Math.round(pro.monthly_rate_kobo / 100))
            : "",
        );
        setGallery(
          mergeGalleryItems(readGallery(pro), readCachedGallery(pro.id)),
        );
        try {
          const nextServices = await listProfessionalServices(pro.id);
          if (!cancelled) setServices(nextServices);
        } catch {
          if (!cancelled) setServices([]);
        }
      })
      .catch(() => {
        if (!cancelled) toast.error("Could not load professional profile.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [authLoading, isAuthenticated]);

  async function onAddService(event: FormEvent) {
    event.preventDefault();
    if (!professionalId) return;
    const name = serviceName.trim();
    if (!name) return;
    setServicesPending(true);
    try {
      await createProfessionalService(professionalId, { service_name: name });
      const next = await listProfessionalServices(professionalId);
      setServices(next);
      setServiceName("");
      toast.success("Service added");
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : "Could not add service.",
      );
    } finally {
      setServicesPending(false);
    }
  }

  async function onRemoveService(serviceId: string) {
    if (!professionalId) return;
    setServicesPending(true);
    try {
      await deleteProfessionalService(professionalId, serviceId);
      setServices((current) => current.filter((item) => item.id !== serviceId));
      toast.success("Service removed");
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : "Could not remove service.",
      );
    } finally {
      setServicesPending(false);
    }
  }

  async function refreshGallery() {
    const pro = await getMyProfessional();
    const fromServer = readGallery(pro);
    const cached = readCachedGallery(professionalId || pro.id);
    if (fromServer.length > 0) {
      setGallery(mergeGalleryItems(fromServer, cached));
      setServerGalleryFull(fromServer.length >= MAX_GALLERY_ITEMS);
      return;
    }
    // /professionals/me often omits gallery; keep local + cached items.
    if (cached.length > 0) {
      setGallery((current) => mergeGalleryItems(current, cached));
    }
  }

  function clearUploading(keepUrls: Set<string> = new Set()) {
    setUploading((current) => {
      current.forEach((item) => {
        if (!keepUrls.has(item.url)) URL.revokeObjectURL(item.url);
      });
      return [];
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function uploadGalleryFiles(fileList: FileList | File[]) {
    if (!professionalId) {
      toast.error("Professional profile not found on this account.");
      return;
    }

    if (gallerySlotsLeft <= 0) {
      toast.error(
        `Gallery is full (${MAX_GALLERY_ITEMS} photos max). Remove a photo before adding more.`,
      );
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const files = Array.from(fileList);
    if (files.length === 0) return;


    const valid: File[] = [];
    let skippedType = 0;
    let skippedSize = 0;
    for (const file of files) {
      if (
        !file.type.startsWith("image/") ||
        !ACCEPTED_IMAGE_TYPES.has(file.type)
      ) {
        skippedType += 1;
        continue;
      }
      if (file.size > MAX_GALLERY_IMAGE_BYTES) {
        skippedSize += 1;
        continue;
      }
      valid.push(file);
    }

    if (valid.length === 0) {
      const parts: string[] = [];
      if (skippedType)
        parts.push("only JPG, PNG, WEBP, or GIF images are allowed");
      if (skippedSize)
        parts.push(`each image must be ${MAX_GALLERY_IMAGE_MB}MB or smaller`);
      toast.error(parts.join(". ") || "No valid images selected.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const capped = valid.slice(0, gallerySlotsLeft);
    const skippedForLimit = valid.length - capped.length;

    const batch = capped.map((file, index) => ({
      id: `upload-${Date.now()}-${index}`,
      url: URL.createObjectURL(file),
      name: file.name,
      progress: 0,
      file,
    }));

    setUploading(
      batch.map(({ id, url, name, progress }) => ({ id, url, name, progress })),
    );
    setGalleryPending(true);

    let uploaded = 0;
    const failures: string[] = [];
    const keptPreviewUrls = new Set<string>();
    let hitLimit = false;

    try {
      for (const item of batch) {
        try {
          const result = await uploadProfessionalGalleryImage(
            professionalId,
            item.file,
            (percent) => {
              setUploading((current) =>
                current.map((row) =>
                  row.id === item.id ? { ...row, progress: percent } : row,
                ),
              );
            },
          );
          const saved = parseUploadResult(result, item.url, item.id);
          if (saved.url === item.url) keptPreviewUrls.add(item.url);
          setGallery((current) => {
            if (current.some((row) => row.id === saved.id)) return current;
            return [...current, saved];
          });
          setUploading((current) =>
            current.filter((row) => row.id !== item.id),
          );
          uploaded += 1;
        } catch (err) {
          if (isGalleryLimitError(err)) {
            hitLimit = true;
            setServerGalleryFull(true);
            failures.push("__limit__");
            break;
          }
          failures.push(
            err instanceof ApiError ? err.message : item.name,
          );
        }
      }

      try {
        await refreshGallery();
      } catch {
        // Keep optimistic gallery if refresh fails.
      }

      if (hitLimit && uploaded === 0) {
        toast.error(
          "Gallery is full",
          `Max ${MAX_GALLERY_ITEMS} photos. Remove one to add another.`,
        );
      } else if (failures.length && uploaded === 0) {
        toast.error(failures[0] || "Gallery upload failed.");
      } else if (failures.length || skippedForLimit) {
        if (hitLimit) {
          toast.error(
            `${uploaded} uploaded, gallery full`,
            `Max ${MAX_GALLERY_ITEMS} photos. Remove one to add another.`,
          );
        } else {
          const bits = [
            uploaded ? `${uploaded} uploaded` : null,
            failures.length ? `${failures.length} failed` : null,
            skippedForLimit
              ? `${skippedForLimit} skipped (max ${MAX_GALLERY_ITEMS})`
              : null,
            skippedType || skippedSize ? "some files were invalid" : null,
          ].filter(Boolean);
          toast.error(bits.join(". ") + ".");
        }
      } else {
        const skipNote =
          skippedType || skippedSize
            ? ` · ${skippedType + skippedSize} skipped`
            : "";
        toast.success(
          uploaded === 1
            ? `Photo added${skipNote}`
            : `${uploaded} photos added${skipNote}`,
        );
      }
    } finally {
      clearUploading(keptPreviewUrls);
      setGalleryPending(false);
    }
  }

  async function onRemoveGallery(imageId: string) {
    if (!professionalId) return;
    const removing = gallery.find((item) => item.id === imageId);
    setGalleryPending(true);
    try {
      // Local-only preview ids are not on the server yet.
      if (isGalleryImageId(imageId)) {
        await deleteProfessionalGalleryImage(professionalId, imageId);
        setServerGalleryFull(false);
      }
      setGallery((current) => {
        const next = current.filter((item) => item.id !== imageId);
        syncCachedGallery(professionalId, next);
        return next;
      });
      if (removing?.url.startsWith("blob:")) {
        URL.revokeObjectURL(removing.url);
      }
      toast.success("Photo removed");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not remove image.");
    } finally {
      setGalleryPending(false);
    }
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!professionalId) return;
    setPending(true);
    try {
      await updateProfessional(professionalId, {
        business_name: businessName,
        service_description: description,
        business_address: address || null,
        years_of_experience: Number(years) || 0,
        state_id: stateId,
        lga_id: lgaId,
        category_id: categoryId,
        subcategory_id: subcategoryId,
        hourly_rate_kobo: hourly
          ? nairaToKobo(Number(parseMoneyInput(hourly)))
          : null,
        daily_rate_kobo: daily
          ? nairaToKobo(Number(parseMoneyInput(daily)))
          : null,
        monthly_rate_kobo: monthly
          ? nairaToKobo(Number(parseMoneyInput(monthly)))
          : null,
      });
      toast.success("Profile saved", "Your public listing is up to date.");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not save profile.");
    } finally {
      setPending(false);
    }
  }

  if (!authLoading && !isAuthenticated) {
    return (
      <PageShell title="Edit public profile">
        <EmptyState
          title="Sign in required"
          description="Log in as a professional to edit your public profile."
        />
        <div className="mt-4">
          <Link href="/login?next=/dashboard/professional/profile">
            <Button>Login</Button>
          </Link>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell title="Edit public profile">
      {loading ? (
        <FormSkeleton />
      ) : (
        <div className="mx-auto max-w-2xl space-y-6">
          <section className="ui-card p-6">
            <h2 className="text-2xl text-black">Work photos</h2>
            <p className="mt-2 text-sm font-medium text-muted">
              Tap Add photos to choose one or more images. They upload right
              away. First photo is your listing cover. Up to {MAX_GALLERY_ITEMS}{" "}
              photos, images only, max {MAX_GALLERY_IMAGE_MB}MB each.
            </p>
            <p className="mt-1 text-sm font-bold text-black">
              {Math.min(gallery.length, MAX_GALLERY_ITEMS)} of{" "}
              {MAX_GALLERY_ITEMS} photos
              {serverGalleryFull && gallery.length < MAX_GALLERY_ITEMS
                ? " (account is full on the server; remove a photo to free a slot)"
                : ""}
            </p>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              multiple
              className="sr-only"
              tabIndex={-1}
              disabled={galleryPending || gallerySlotsLeft <= 0}
              onChange={(event) => {
                const files = event.target.files;
                if (files?.length) void uploadGalleryFiles(files);
              }}
            />

            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {gallery.map((item, index) => (
                <div
                  key={item.id}
                  className="relative aspect-square overflow-hidden rounded-[12px] bg-[#e8e6e4]"
                >
                  {item.url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.url}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center px-3 text-center text-sm font-bold text-muted">
                      Saved photo
                    </div>
                  )}
                  {index === 0 ? (
                    <span className="absolute left-2 top-2 rounded-[6px] bg-black/70 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                      Cover
                    </span>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => void onRemoveGallery(item.id)}
                    disabled={galleryPending}
                    className="absolute right-2 top-2 rounded-[6px] bg-black/70 px-2 py-1 text-xs font-bold text-white"
                  >
                    Remove
                  </button>
                </div>
              ))}

              {uploading.map((item) => (
                <div
                  key={item.id}
                  className="relative aspect-square overflow-hidden rounded-[12px] bg-[#e8e6e4]"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.url}
                    alt={item.name || "Uploading preview"}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/50 px-3">
                    <p className="text-sm font-bold text-white">
                      Uploading {item.progress}%
                    </p>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/30">
                      <div
                        className="h-full rounded-full bg-white transition-[width] duration-150"
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}

              {gallerySlotsLeft > 0 ? (
                <button
                  type="button"
                  disabled={galleryPending || !professionalId}
                  onClick={() => fileInputRef.current?.click()}
                  className="flex aspect-square flex-col items-center justify-center gap-2 rounded-[12px] border border-dashed border-[#bdbdbd] bg-white px-3 text-center transition hover:border-black hover:bg-[#fafafa] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#f3f2f1] text-black">
                    <ImagePlus className="h-5 w-5" />
                  </span>
                  <span className="text-sm font-bold text-black">Add photos</span>
                  <span className="text-xs font-medium text-muted">
                    {gallerySlotsLeft} slot{gallerySlotsLeft === 1 ? "" : "s"} left
                  </span>
                </button>
              ) : null}
            </div>

            {gallery.length === 0 && uploading.length === 0 ? (
              <p className="mt-3 text-sm font-medium text-muted">
                No photos yet. Use Add photos to upload your first ones.
              </p>
            ) : null}
          </section>

          <section className="ui-card p-6">
            <h2 className="text-2xl text-black">Services offered</h2>
            <p className="mt-2 text-sm font-medium text-muted">
              Add specific services customers can request from your listing.
            </p>
            <form
              className="mt-4 flex flex-col gap-3 sm:flex-row"
              onSubmit={onAddService}
            >
              <div className="flex-1">
                <Input
                  label="Service name"
                  name="serviceName"
                  value={serviceName}
                  onChange={(e) => setServiceName(e.target.value)}
                  placeholder="e.g. Kitchen rewiring"
                  required
                />
              </div>
              <div className="sm:pt-8">
                <Button type="submit" disabled={servicesPending || !professionalId}>
                  {servicesPending ? "Saving…" : "Add service"}
                </Button>
              </div>
            </form>
            <div className="mt-4 space-y-2">
              {services.length === 0 ? (
                <p className="text-sm font-medium text-muted">
                  No services listed yet.
                </p>
              ) : (
                services.map((service) => (
                  <div
                    key={service.id}
                    className="flex items-center justify-between gap-3 rounded-[12px] bg-[#fafafa] px-4 py-3"
                  >
                    <p className="text-base font-bold text-black">
                      {serviceDisplayName(service)}
                    </p>
                    <button
                      type="button"
                      disabled={servicesPending}
                      onClick={() => void onRemoveService(service.id)}
                      className="text-sm font-bold text-muted hover:text-black disabled:opacity-60"
                    >
                      Remove
                    </button>
                  </div>
                ))
              )}
            </div>
          </section>

          <form className="space-y-6" onSubmit={onSubmit}>
            <section className="ui-card p-6">
              <h2 className="text-2xl text-black">Basic information</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Input
                    label="Trade name"
                    name="tradeName"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    required
                  />
                </div>
                <Select
                  label="Category"
                  name="category"
                  required
                  placeholder="Select category"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  options={categories.map((c) => ({
                    label: c.name,
                    value: c.id,
                  }))}
                />
                <Select
                  label="Subcategory"
                  name="subcategory"
                  required
                  placeholder="Select subcategory"
                  value={subcategoryId}
                  onChange={(e) => setSubcategoryId(e.target.value)}
                  options={subcategories.map((s) => ({
                    label: s.name,
                    value: s.id,
                  }))}
                />
              </div>
            </section>

            <section className="ui-card p-6">
              <h2 className="text-2xl text-black">Service description</h2>
              <Textarea
                className="mt-4"
                label="First-person description"
                name="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
              <div className="mt-4">
                <Input
                  label="Years of experience"
                  name="years"
                  type="number"
                  min={0}
                  value={years}
                  onChange={(e) => setYears(e.target.value)}
                  required
                />
              </div>
            </section>

            <section className="ui-card p-6">
              <h2 className="text-2xl text-black">Your rates</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                <Input
                  label="Hourly (₦)"
                  name="hourlyRate"
                  inputMode="numeric"
                  value={hourly}
                  onChange={(e) => setHourly(formatMoneyInput(e.target.value))}
                  placeholder="e.g. 15,000"
                />
                <Input
                  label="Day rate (₦)"
                  name="dayRate"
                  inputMode="numeric"
                  value={daily}
                  onChange={(e) => setDaily(formatMoneyInput(e.target.value))}
                  placeholder="e.g. 80,000"
                />
                <Input
                  label="Monthly (₦)"
                  name="projectRate"
                  inputMode="numeric"
                  value={monthly}
                  onChange={(e) => setMonthly(formatMoneyInput(e.target.value))}
                  placeholder="e.g. 1,500,000"
                />
              </div>
            </section>

            <section className="ui-card p-6">
              <h2 className="text-2xl text-black">Location</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <Select
                  label="State"
                  name="state"
                  required
                  placeholder="Select state"
                  value={stateId}
                  onChange={(e) => setStateId(e.target.value)}
                  options={states.map((s) => ({ label: s.name, value: s.id }))}
                />
                <Select
                  label="LGA"
                  name="lga"
                  required
                  placeholder="Select LGA"
                  value={lgaId}
                  onChange={(e) => setLgaId(e.target.value)}
                  options={lgas.map((l) => ({ label: l.name, value: l.id }))}
                />
                <div className="sm:col-span-2">
                  <Input
                    label="Address"
                    name="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>
              </div>
            </section>

            <Button type="submit" size="lg" disabled={pending}>
              {pending ? "Saving…" : "Save profile"}
            </Button>
          </form>
        </div>
      )}
    </PageShell>
  );
}
