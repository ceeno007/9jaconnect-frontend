"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageShell } from "@/components/ui/primitives";
import { forgotPasswordRequest } from "@/lib/api";
import { ApiError } from "@/lib/api/types";

export default function ForgotPasswordPage() {
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
      const data = await forgotPasswordRequest(email);
      setSuccess(
        data.message ||
          "If that email exists, a reset link has been sent. Check your inbox.",
      );
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Could not send reset link. Please try again.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <PageShell title="Forgot password">
      <div className="mx-auto max-w-md ui-card p-6 sm:p-8">
        <form className="space-y-4" onSubmit={onSubmit}>
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
      </div>
    </PageShell>
  );
}
