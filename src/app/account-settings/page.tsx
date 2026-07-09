"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge, EmptyState, PageShell } from "@/components/ui/primitives";
import { useAuth } from "@/components/providers/auth-provider";
import {
  getCustomerVerificationStatus,
  requestAccountDeletion,
  uploadProfilePhoto,
} from "@/lib/api/auth-client";
import { ApiError } from "@/lib/api/types";

export default function AccountSettingsPage() {
  const { user, isAuthenticated, loading, refreshUser } = useAuth();
  const [kycStatus, setKycStatus] = useState("Not started");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [pending, setPending] = useState(false);
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (!isAuthenticated) return;
    void getCustomerVerificationStatus()
      .then((data) => {
        const status =
          (data.status as string) ||
          (data.kyc_status as string) ||
          user?.kyc_status ||
          "Not started";
        setKycStatus(String(status).replaceAll("_", " "));
      })
      .catch(() => {
        setKycStatus(user?.kyc_status || "Not started");
      });
  }, [isAuthenticated, user?.kyc_status]);

  if (!loading && !isAuthenticated) {
    return (
      <PageShell title="Account settings">
        <EmptyState
          title="Sign in required"
          description="Log in to manage your account settings."
        />
        <div className="mt-4">
          <Link href="/login?next=/account-settings">
            <Button>Login</Button>
          </Link>
        </div>
      </PageShell>
    );
  }

  async function onUploadPhoto(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");
    const form = new FormData(event.currentTarget);
    const file = form.get("photo");
    if (!(file instanceof File) || !file.size) {
      setError("Choose a photo to upload.");
      return;
    }
    setPending(true);
    try {
      await uploadProfilePhoto(file);
      await refreshUser();
      setSuccess("Profile photo updated.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Upload failed.");
    } finally {
      setPending(false);
    }
  }

  async function onDelete(event: FormEvent) {
    event.preventDefault();
    setError("");
    setSuccess("");
    if (!reason.trim()) {
      setError("Please tell us why you're leaving.");
      return;
    }
    setPending(true);
    try {
      await requestAccountDeletion({ reason: reason.trim() });
      setSuccess("Deletion request submitted.");
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Could not request deletion.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <PageShell title="Account settings">
      <div className="mx-auto max-w-2xl space-y-6">
        {error ? (
          <p className="text-base font-semibold text-danger">{error}</p>
        ) : null}
        {success ? (
          <p className="text-base font-semibold text-black">{success}</p>
        ) : null}

        <section className="ui-card p-6">
          <h2 className="text-2xl text-black">Profile photo</h2>
          <form className="mt-4 flex items-center gap-4" onSubmit={onUploadPhoto}>
            {user?.profile_photo_url ? (
              <Image
                src={user.profile_photo_url}
                alt=""
                width={64}
                height={64}
                className="h-16 w-16 rounded-full object-cover"
              />
            ) : (
              <div className="h-16 w-16 rounded-full bg-neutral-100" />
            )}
            <input type="file" name="photo" accept="image/*" />
            <Button variant="outline" type="submit" disabled={pending}>
              Upload photo
            </Button>
          </form>
        </section>

        <section className="ui-card p-6">
          <h2 className="text-2xl text-black">Personal information</h2>
          <p className="mt-2 text-sm font-medium text-muted">
            Profile field edits need backend `PATCH /auth/me`. Showing current
            account details for now.
          </p>
          <form className="mt-4 grid gap-4 sm:grid-cols-2">
            <Input
              label="Full name"
              name="fullName"
              defaultValue={user?.full_name || ""}
              readOnly
            />
            <Input
              label="Email"
              name="email"
              type="email"
              defaultValue={user?.email || ""}
              readOnly
            />
            <Input
              label="Phone"
              name="phone"
              defaultValue={user?.phone || ""}
              readOnly
            />
            <div className="sm:col-span-2">
              <Button type="button" disabled>
                Save changes (waiting on API)
              </Button>
            </div>
          </form>
        </section>

        <section className="ui-card p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl text-black">Identity verification</h2>
            <Badge>{kycStatus}</Badge>
          </div>
          <Link href="/verify-identity" className="mt-4 inline-block">
            <Button variant="outline">Verify identity</Button>
          </Link>
        </section>

        <section className="rounded-[var(--radius-lg)] bg-red-50 p-6">
          <h2 className="text-2xl text-danger">Danger zone</h2>
          <form onSubmit={onDelete}>
            <Textarea
              className="mt-4 bg-card"
              label="Feedback"
              name="deletionFeedback"
              placeholder="Tell us why you're leaving..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
            <Button
              variant="danger"
              className="mt-4"
              type="submit"
              disabled={pending}
            >
              Request account deletion
            </Button>
          </form>
        </section>
      </div>
    </PageShell>
  );
}
