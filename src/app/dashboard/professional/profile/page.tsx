"use client";

import { FormEvent, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState, PageShell } from "@/components/ui/primitives";
import { FormSkeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/components/providers/auth-provider";
import {
  listCategories,
  listLgas,
  listStates,
  listSubcategories,
} from "@/lib/api";
import {
  deleteProfessionalGalleryImage,
  getMyProfessional,
  updateProfessional,
  uploadProfessionalGalleryImage,
} from "@/lib/api/auth-client";
import { nairaToKobo } from "@/lib/api/mappers";
import type { Category, Lga, State, Subcategory } from "@/lib/api/types";
import { ApiError } from "@/lib/api/types";
import { formatMoneyInput, parseMoneyInput } from "@/lib/utils";

type GalleryItem = { id: string; url: string };

const MAX_GALLERY_IMAGE_MB = 5;
const MAX_GALLERY_IMAGE_BYTES = MAX_GALLERY_IMAGE_MB * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
]);

function readGallery(pro: unknown): GalleryItem[] {
  if (!pro || typeof pro !== "object") return [];
  const gallery = (pro as { gallery?: unknown }).gallery;
  if (!Array.isArray(gallery)) return [];
  return gallery
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const record = item as { id?: string; url?: string; image_url?: string };
      const id = record.id;
      const url = record.url || record.image_url;
      if (!id || !url) return null;
      return { id, url };
    })
    .filter((item): item is GalleryItem => Boolean(item));
}

export default function ProfessionalProfileEditPage() {
  const { isAuthenticated, loading: authLoading, user } = useAuth();
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
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewName, setPreviewName] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);
  const [galleryPending, setGalleryPending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

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
      .then((pro) => {
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
        setGallery(readGallery(pro));
      })
      .catch(() => {
        if (!cancelled) setError("Could not load professional profile.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [authLoading, isAuthenticated]);

  async function refreshGallery() {
    const pro = await getMyProfessional();
    setGallery(readGallery(pro));
  }

  function clearPreview() {
    setPreviewUrl((current) => {
      if (current) URL.revokeObjectURL(current);
      return null;
    });
    setPreviewName("");
  }

  function onPickGalleryFile(file: File | null) {
    setError("");
    setSuccess("");
    clearPreview();
    if (!file) return;

    if (!file.type.startsWith("image/") || !ACCEPTED_IMAGE_TYPES.has(file.type)) {
      setError("Only image files are allowed (JPG, PNG, WEBP, or GIF).");
      return;
    }
    if (file.size > MAX_GALLERY_IMAGE_BYTES) {
      setError(`Image must be ${MAX_GALLERY_IMAGE_MB}MB or smaller.`);
      return;
    }

    setPreviewName(file.name);
    setPreviewUrl(URL.createObjectURL(file));
  }

  async function onUploadGallery(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!professionalId) {
      setError("Professional profile not found on this account.");
      return;
    }
    setError("");
    setSuccess("");
    const form = event.currentTarget;
    const fileInput = form.elements.namedItem("gallery");
    const file =
      fileInput instanceof HTMLInputElement ? fileInput.files?.[0] : null;
    if (!(file instanceof File) || !file.size) {
      setError("Choose an image to upload.");
      return;
    }
    if (!file.type.startsWith("image/")) {
      setError("Only image files are allowed.");
      return;
    }
    if (file.size > MAX_GALLERY_IMAGE_BYTES) {
      setError(`Image must be ${MAX_GALLERY_IMAGE_MB}MB or smaller.`);
      return;
    }

    if (!previewUrl) {
      setPreviewName(file.name);
      setPreviewUrl(URL.createObjectURL(file));
    }

    setGalleryPending(true);
    setUploadProgress(0);
    try {
      await uploadProfessionalGalleryImage(professionalId, file, (percent) => {
        setUploadProgress(percent);
      });
      await refreshGallery();
      form.reset();
      clearPreview();
      setUploadProgress(0);
      setSuccess("Gallery image uploaded.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Gallery upload failed.");
    } finally {
      setGalleryPending(false);
    }
  }

  async function onRemoveGallery(imageId: string) {
    if (!professionalId) return;
    setError("");
    setSuccess("");
    setGalleryPending(true);
    try {
      await deleteProfessionalGalleryImage(professionalId, imageId);
      setGallery((current) => current.filter((item) => item.id !== imageId));
      setSuccess("Gallery image removed.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not remove image.");
    } finally {
      setGalleryPending(false);
    }
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!professionalId) return;
    setError("");
    setSuccess("");
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
      setSuccess("Profile saved.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not save profile.");
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
          {error ? (
            <p className="text-base font-semibold text-danger">{error}</p>
          ) : null}
          {success ? (
            <p className="text-base font-semibold text-black">{success}</p>
          ) : null}

          <section className="ui-card p-6">
            <h2 className="text-2xl text-black">Work photos</h2>
            <p className="mt-2 text-sm font-medium text-muted">
              Upload photos of your work. The first image becomes your listing
              cover. Images only, max {MAX_GALLERY_IMAGE_MB}MB each.
            </p>
            {gallery.length > 0 ? (
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {gallery.map((item) => (
                  <div
                    key={item.id}
                    className="relative aspect-square overflow-hidden rounded-[12px] bg-[#e8e6e4]"
                  >
                    <Image
                      src={item.url}
                      alt=""
                      fill
                      sizes="180px"
                      className="object-cover"
                    />
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
              </div>
            ) : (
              <p className="mt-4 text-sm font-medium text-muted">
                No photos yet.
              </p>
            )}

            {previewUrl ? (
              <div className="mt-4 overflow-hidden rounded-[12px] border border-[#e4e2e0] bg-[#fafafa] p-3">
                <div className="flex items-start gap-3">
                  <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-[10px] bg-[#e8e6e4]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={previewUrl}
                      alt="Selected preview"
                      className="h-full w-full object-cover"
                    />
                    {galleryPending ? (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/45">
                        <span className="text-xs font-bold text-white">
                          {uploadProgress}%
                        </span>
                      </div>
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-black">
                      {previewName || "Selected image"}
                    </p>
                    <p className="mt-1 text-xs font-medium text-muted">
                      {galleryPending
                        ? "Uploading…"
                        : "Ready to upload"}
                    </p>
                    {galleryPending ? (
                      <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#e8e6e4]">
                        <div
                          className="h-full rounded-full bg-black transition-[width] duration-150"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={clearPreview}
                        className="mt-2 text-xs font-bold text-black hover:underline"
                      >
                        Clear selection
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : null}

            <form
              className="mt-4 flex flex-wrap items-center gap-3"
              onSubmit={onUploadGallery}
            >
              <input
                type="file"
                name="gallery"
                accept="image/jpeg,image/png,image/webp,image/gif"
                required
                disabled={galleryPending}
                onChange={(event) =>
                  onPickGalleryFile(event.target.files?.[0] || null)
                }
                className="block w-full text-sm sm:w-auto"
              />
              <Button type="submit" variant="outline" disabled={galleryPending}>
                {galleryPending
                  ? `Uploading ${uploadProgress}%`
                  : "Upload photo"}
              </Button>
            </form>
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
