"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageShell } from "@/components/ui/primitives";
import { adminAuthPaths } from "@/lib/admin-paths";
import { adminForgotPassword } from "@/lib/api/admin-client";
import { ApiError } from "@/lib/api/types";

export default function OpsForgotPasswordPage() {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setPending(true);
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") || "").trim();
    try {
      await adminForgotPassword(email);
      setSuccess("If that account exists, a reset link has been sent.");
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Could not start password reset.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <PageShell title="Reset access">
      <div className="mx-auto max-w-lg ui-card p-8">
        <form className="space-y-5" onSubmit={onSubmit}>
          <Input label="Email" name="email" type="email" required />
          {error ? (
            <p className="text-base font-semibold text-danger">{error}</p>
          ) : null}
          {success ? (
            <p className="text-base font-semibold text-black">{success}</p>
          ) : null}
          <Button type="submit" className="w-full" size="lg" disabled={pending}>
            {pending ? "Sending…" : "Send reset link"}
          </Button>
        </form>
        <p className="mt-6 text-center text-sm font-medium text-muted">
          <Link href={adminAuthPaths.login} className="font-bold text-black">
            Back to sign in
          </Link>
        </p>
      </div>
    </PageShell>
  );
}
