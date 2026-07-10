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
  requestAccountDeletion,
  submitProfessionalVerification,
  updateMe,
  uploadProfilePhoto,
} from "@/lib/api/auth-client";
import { ApiError } from "@/lib/api/types";

export default function ProfessionalSettingsPage() {
  const { user, isAuthenticated, loading, refreshUser } = useAuth();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [pending, setPending] = useState(false);
  const [reason, setReason] = useState("");
  const [docType, setDocType] = useState("nin");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");

  useEffect(() => {
    if (!user) return;
    setFullName(user.full_name || "");
    setPhone(user.phone || "");
    setWhatsapp(user.whatsapp_number || "");
  }, [user]);

  if (!loading && !isAuthenticated) {
    return (
      <PageShell title="Professional settings">
        <EmptyState
          title="Sign in required"
          description="Log in as a professional to manage settings."
        />
        <div className="mt-4">
          <Link href="/login?next=/dashboard/professional/settings">
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

  async function onSaveProfile(event: FormEvent) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setPending(true);
    try {
      await updateMe({
        full_name: fullName.trim(),
        phone: phone.trim() || null,
        whatsapp_number: whatsapp.trim() || null,
      });
      await refreshUser();
      setSuccess("Profile updated.");
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Could not update profile.",
      );
    } finally {
      setPending(false);
    }
  }

  async function onVerify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");
    const professionalId = user?.professional_id;
    if (!professionalId) {
      setError("Professional profile not found on this account.");
      return;
    }
    const form = new FormData(event.currentTarget);
    const file = form.get("file");
    if (!(file instanceof File) || !file.size) {
      setError("Choose a verification document.");
      return;
    }
    setPending(true);
    try {
      await submitProfessionalVerification(professionalId, docType, file);
      setSuccess("Verification document submitted.");
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
    <PageShell title="Professional settings">
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
          <form className="mt-4 grid gap-4 sm:grid-cols-2" onSubmit={onSaveProfile}>
            <Input
              label="Full name"
              name="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
            <Input
              label="Email"
              name="email"
              type="email"
              value={user?.email || ""}
              readOnly
              hint="Email changes need a separate verification flow."
            />
            <Input
              label="Phone"
              name="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <Input
              label="WhatsApp"
              name="whatsapp"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
            />
            <div className="sm:col-span-2">
              <Button type="submit" disabled={pending}>
                {pending ? "Saving…" : "Save changes"}
              </Button>
            </div>
          </form>
        </section>

        <section className="ui-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl text-black">Verification status</h2>
            <Badge className="bg-neutral-100 text-black">
              {String(user?.kyc_status || "pending").replaceAll("_", " ")}
            </Badge>
          </div>
          <form className="space-y-4" onSubmit={onVerify}>
            <label className="flex flex-col gap-2.5">
              <span className="text-lg font-bold text-foreground">
                Document type
              </span>
              <select
                className="field-surface w-full text-foreground outline-none"
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
              >
                <option value="nin">NIN</option>
                <option value="drivers_license">Driver licence</option>
                <option value="passport">Passport</option>
                <option value="cac">CAC / business doc</option>
              </select>
            </label>
            <input
              type="file"
              name="file"
              accept="image/*,application/pdf"
              required
              className="block w-full text-sm"
            />
            <Button type="submit" disabled={pending}>
              Upload verification document
            </Button>
          </form>
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
