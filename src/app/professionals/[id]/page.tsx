"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  BadgeCheck,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge, EmptyState } from "@/components/ui/primitives";
import { ImageLightbox } from "@/components/ui/image-lightbox";
import { MediaFrame } from "@/components/ui/media-frame";
import { RatingScore, RatingStars } from "@/components/ui/rating";
import { ProfessionalProfileSkeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/components/providers/auth-provider";
import { getProfessional } from "@/lib/api";
import {
  createServiceTicket,
  listProfessionalReviews,
} from "@/lib/api/auth-client";
import { mapDirectoryProfessional } from "@/lib/api/mappers";
import { ApiError } from "@/lib/api/types";
import type { Review } from "@/lib/api/types";
import { galleryUrlsFromCache } from "@/lib/gallery-cache";
import type { Professional } from "@/lib/types";

export default function ProfessionalProfilePage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const [professional, setProfessional] = useState<Professional | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [missing, setMissing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [pending, setPending] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    void Promise.all([
      getProfessional(id),
      listProfessionalReviews(id).catch(() => [] as Review[]),
    ])
      .then(([data, nextReviews]) => {
        if (cancelled) return;
        setProfessional(mapDirectoryProfessional(data));
        setReviews(nextReviews);
      })
      .catch(() => {
        if (cancelled) return;
        setMissing(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  async function onRequestService(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!isAuthenticated) {
      router.push(`/login?next=/professionals/${id}`);
      return;
    }

    const form = new FormData(event.currentTarget);
    const summary = String(form.get("summary") || "").trim();
    const message = String(form.get("message") || "").trim();

    setPending(true);
    try {
      await createServiceTicket({
        professional_id: id,
        issue_summary:
          summary || `Service request for ${professional?.tradeName}`,
        issue_description: message,
      });
      setSuccess("Request sent. Track it from your customer dashboard.");
      event.currentTarget.reset();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Could not send request. Please try again.",
      );
    } finally {
      setPending(false);
    }
  }

  const galleryImages = useMemo(() => {
    const fromApi = professional?.galleryImages?.length
      ? professional.galleryImages
      : professional?.coverImage
        ? [professional.coverImage]
        : [];

    // API currently omits gallery on public detail. If you own this listing,
    // show photos cached from your recent uploads in this browser.
    const isOwner = Boolean(user?.professional_id && user.professional_id === id);
    if (!isOwner) return fromApi;

    const cached = galleryUrlsFromCache(id);
    if (!cached.length) return fromApi;

    const seen = new Set(fromApi);
    const merged = [...fromApi];
    for (const url of cached) {
      if (!url || seen.has(url)) continue;
      seen.add(url);
      merged.push(url);
    }
    return merged;
  }, [professional, user?.professional_id, id]);

  if (loading) {
    return <ProfessionalProfileSkeleton />;
  }

  if (missing || !professional) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 lg:px-6">
        <EmptyState
          title="Professional not found"
          description="This listing may have been removed or the link is invalid."
        />
        <div className="mt-6 text-center">
          <Link href="/find" className="font-bold text-black hover:underline">
            Back to search
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white">
      <div className="border-b border-[#e4e2e0] bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
          <Link
            href="/find"
            className="mb-5 inline-flex h-10 items-center gap-2 rounded-full border border-[#e4e2e0] bg-white px-4 text-sm font-bold text-black transition hover:bg-[#f3f2f1]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          <div>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              {professional.verified ? (
                <Badge className="bg-[#0f9d58] text-white">
                  <BadgeCheck className="mr-1.5 h-4 w-4" />
                  Verified ID
                </Badge>
              ) : null}
              <Badge className="bg-white text-black">
                <RatingScore
                  value={professional.rating}
                  reviews={professional.reviews}
                  showReviews
                />
              </Badge>
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              {professional.tradeName}
            </h1>
            <p className="mt-3 text-lg font-semibold text-muted">
              {professional.name} · {professional.category}
            </p>
            <p className="mt-2 inline-flex items-center gap-2 text-base font-bold text-muted">
              <MapPin className="h-5 w-5 text-black" />
              {professional.state}, {professional.lga}
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 lg:grid-cols-[1.2fr_0.8fr] lg:px-6">
        <div className="space-y-6">
          <section className="overflow-hidden ui-card p-3">
            {galleryImages.length > 0 ? (
              <>
                <button
                  type="button"
                  onClick={() => setLightboxIndex(0)}
                  className="relative aspect-[21/9] w-full overflow-hidden rounded-[12px] bg-[#e8e6e4] text-left"
                  aria-label="View photo fullscreen"
                >
                  <MediaFrame
                    src={galleryImages[0]}
                    alt={`${professional.tradeName} gallery`}
                    fill
                    sizes="(max-width: 1024px) 100vw, 60vw"
                    priority
                    imageClassName="transition duration-300 hover:scale-[1.02]"
                  />
                </button>
                {galleryImages.length > 1 ? (
                  <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-6">
                    {galleryImages.slice(0, 6).map((src, index) => (
                      <button
                        key={`${src}-${index}`}
                        type="button"
                        onClick={() => setLightboxIndex(index)}
                        className="relative aspect-square overflow-hidden rounded-[12px] bg-[#e8e6e4]"
                        aria-label="View photo fullscreen"
                      >
                        <MediaFrame
                          src={src}
                          alt=""
                          fill
                          sizes="120px"
                          imageClassName="transition duration-300 hover:scale-105"
                        />
                      </button>
                    ))}
                  </div>
                ) : null}
              </>
            ) : (
              <div className="relative aspect-[21/9] w-full overflow-hidden rounded-[12px]">
                <MediaFrame src={null} alt="" emptyLabel="No photos yet" />
              </div>
            )}
          </section>

          <section className="ui-card p-7 sm:p-8">
            <h2 className="text-2xl font-bold">Service description</h2>
            <p className="mt-4 text-lg font-medium leading-relaxed text-muted">
              {professional.description}
            </p>
          </section>

          <section className="ui-card p-7 sm:p-8">
            <h2 className="text-2xl font-bold">Your rates</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              <Rate label="Hourly" value={professional.hourlyRate} />
              <Rate label="Day rate" value={professional.dayRate} />
              <Rate label="Project" value={professional.projectRate} />
            </div>
          </section>

          <section className="ui-card p-7 sm:p-8">
            <h2 className="text-2xl font-bold">Verified reviews</h2>
            <div className="mt-5 space-y-4">
              {reviews.length === 0 ? (
                <p className="text-base font-medium text-muted">
                  No reviews yet.
                </p>
              ) : (
                reviews.map((review) => (
                  <div
                    key={review.id}
                    className="rounded-[var(--radius-lg)] bg-neutral-100 p-5"
                  >
                    <div className="mb-3">
                      <RatingStars value={Number(review.rating || 0)} />
                    </div>
                    <p className="text-base font-medium text-muted">
                      {review.comment || "No comment provided."}
                    </p>
                    {review.customer_name ? (
                      <p className="mt-2 text-sm font-bold text-black">
                        {review.customer_name}
                      </p>
                    ) : null}
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        <aside className="h-fit lg:sticky lg:top-32">
          <div className="ui-card p-7 sm:p-8">
            <h2 className="mb-2 text-2xl font-bold text-foreground">
              Request Service
            </h2>
            <p className="text-base font-medium text-muted">
              {isAuthenticated
                ? `Signed in as ${user?.full_name || user?.email}`
                : "Sign in as a customer to submit a service request."}
            </p>
            <div className="mt-5 rounded-[var(--radius-lg)] bg-neutral-50 px-4 py-3 text-lg font-bold text-black">
              {professional.hourlyRate
                ? `From ₦${professional.hourlyRate.toLocaleString()} /hr`
                : "Rate on request"}
            </div>
            <form className="mt-6 space-y-5" onSubmit={onRequestService}>
              <Input
                label="Summary"
                name="summary"
                required
                placeholder="e.g. Fix kitchen wiring"
              />
              <Textarea
                label="Message"
                name="message"
                required
                placeholder="Describe what you need..."
              />
              {error ? (
                <p className="text-base font-semibold text-danger">{error}</p>
              ) : null}
              {success ? (
                <p className="text-base font-semibold text-black">{success}</p>
              ) : null}
              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={pending}
              >
                {pending
                  ? "Sending…"
                  : isAuthenticated
                    ? "Request Service"
                    : "Login to request"}
              </Button>
            </form>
          </div>
        </aside>
      </div>

      <ImageLightbox
        images={galleryImages}
        index={lightboxIndex}
        alt={`${professional.tradeName} photo`}
        onClose={() => setLightboxIndex(null)}
        onChange={setLightboxIndex}
      />
    </div>
  );
}

function Rate({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[var(--radius-lg)] bg-neutral-100 p-5">
      <p className="text-sm font-bold uppercase tracking-wide text-muted">
        {label}
      </p>
      <p className="mt-2 text-2xl font-black text-foreground">
        {value ? `₦${value.toLocaleString()}` : "-"}
      </p>
    </div>
  );
}
