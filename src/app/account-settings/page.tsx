"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge, EmptyState, PageShell } from "@/components/ui/primitives";
import { useAuth } from "@/components/providers/auth-provider";
import { listLgas, listStates } from "@/lib/api";
import {
  getCustomerVerificationStatus,
  requestAccountDeletion,
  updateMe,
  uploadProfilePhoto,
} from "@/lib/api/auth-client";
import type { Lga, State } from "@/lib/api/types";
import { ApiError } from "@/lib/api/types";

export default function AccountSettingsPage() {
  const { user, isAuthenticated, loading, refreshUser } = useAuth();
  const [kycStatus, setKycStatus] = useState("Not started");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [pending, setPending] = useState(false);
  const [reason, setReason] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [stateId, setStateId] = useState("");
  const [lgaId, setLgaId] = useState("");
  const [states, setStates] = useState<State[]>([]);
  const [lgas, setLgas] = useState<Lga[]>([]);

  useEffect(() => {
    void listStates().then(setStates);
  }, []);

  useEffect(() => {
    if (!user) return;
    setFullName(user.full_name || "");
    setPhone(user.phone || "");
    setWhatsapp(user.whatsapp_number || "");
    setStateId(user.home_state_id || "");
    setLgaId(user.home_lga_id || "");
  }, [user]);

  useEffect(() => {
    if (!stateId) {
      setLgas([]);
      return;
    }
    void listLgas(stateId).then(setLgas);
  }, [stateId]);

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
        home_state_id: stateId || null,
        home_lga_id: lgaId || null,
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
            <Select
              label="Home state"
              name="homeState"
              placeholder="Select state"
              value={stateId}
              onChange={(e) => {
                setStateId(e.target.value);
                setLgaId("");
              }}
              options={states.map((s) => ({ label: s.name, value: s.id }))}
            />
            <Select
              label="Home LGA"
              name="homeLga"
              placeholder={stateId ? "Select LGA" : "Select state first"}
              value={lgaId}
              onChange={(e) => setLgaId(e.target.value)}
              disabled={!stateId}
              options={lgas.map((l) => ({ label: l.name, value: l.id }))}
            />
            <div className="sm:col-span-2">
              <Button type="submit" disabled={pending}>
                {pending ? "Saving…" : "Save changes"}
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
