"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Badge, EmptyState, PageShell } from "@/components/ui/primitives";
import { useAuth } from "@/components/providers/auth-provider";
import {
  getCustomerVerificationStatus,
  submitCustomerIdentity,
} from "@/lib/api/auth-client";
import { ApiError } from "@/lib/api/types";

export default function VerifyIdentityPage() {
  const { isAuthenticated, loading, user, refreshUser } = useAuth();
  const [status, setStatus] = useState(user?.kyc_status || "not_started");
  const [docType, setDocType] = useState("nin");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;
    void getCustomerVerificationStatus()
      .then((data) => {
        setStatus(
          String(
            data.status || data.kyc_status || user?.kyc_status || "not_started",
          ),
        );
      })
      .catch(() => undefined);
  }, [isAuthenticated, user?.kyc_status]);

  if (!loading && !isAuthenticated) {
    return (
      <PageShell title="Verify identity">
        <EmptyState
          title="Sign in required"
          description="Log in to upload your identity document."
        />
        <div className="mt-4">
          <Link href="/login?next=/verify-identity">
            <Button>Login</Button>
          </Link>
        </div>
      </PageShell>
    );
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");
    const form = new FormData(event.currentTarget);
    const file = form.get("file");
    if (!(file instanceof File) || !file.size) {
      setError("Choose an ID document to upload.");
      return;
    }
    setPending(true);
    try {
      await submitCustomerIdentity(docType, file);
      await refreshUser();
      setStatus("submitted");
      setSuccess("Document submitted for review.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Upload failed.");
    } finally {
      setPending(false);
    }
  }

  return (
    <PageShell title="Verify identity">
      <div className="mx-auto max-w-xl space-y-4 ui-card p-6 sm:p-8">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-2xl text-black">Document upload</h2>
          <Badge className="bg-neutral-100 text-black">
            {String(status).replaceAll("_", " ")}
          </Badge>
        </div>
        <p className="text-sm text-muted">
          Upload a government-issued ID. Current verification status is shown
          here after submission.
        </p>
        <form className="space-y-4" onSubmit={onSubmit}>
          <Select
            label="Document type"
            name="docType"
            value={docType}
            onChange={(e) => setDocType(e.target.value)}
            options={[
              { label: "NIN", value: "nin" },
              { label: "Driver licence", value: "drivers_license" },
              { label: "International passport", value: "passport" },
              { label: "Voter card", value: "voters_card" },
            ]}
          />
          <input
            type="file"
            name="file"
            accept="image/*,application/pdf"
            required
            className="block w-full text-sm"
          />
          {error ? (
            <p className="text-base font-semibold text-danger">{error}</p>
          ) : null}
          {success ? (
            <p className="text-base font-semibold text-black">{success}</p>
          ) : null}
          <Button className="w-full" size="lg" type="submit" disabled={pending}>
            {pending ? "Uploading…" : "Upload ID document"}
          </Button>
        </form>
      </div>
    </PageShell>
  );
}
