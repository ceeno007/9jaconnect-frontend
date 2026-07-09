"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageShell } from "@/components/ui/primitives";
import { resetPasswordRequest } from "@/lib/api";
import { ApiError } from "@/lib/api/types";

export default function ResetPasswordClient() {
  const searchParams = useSearchParams();
  const token = useMemo(
    () => searchParams.get("token") || searchParams.get("t") || "",
    [searchParams],
  );
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!token) {
      setError("Reset token is missing. Open the link from your email.");
      return;
    }

    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") || "");
    const confirmPassword = String(form.get("confirmPassword") || "");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setPending(true);
    try {
      await resetPasswordRequest(token, password);
      setSuccess(true);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Could not reset password. Please try again.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <PageShell title="Reset password">
      <div className="mx-auto max-w-md ui-card p-6 sm:p-8">
        {success ? (
          <div className="space-y-4 text-center">
            <p className="text-lg font-bold text-black">Password updated</p>
            <p className="text-base font-medium text-muted">
              You can now log in with your new password.
            </p>
            <Link href="/login">
              <Button className="w-full" size="lg">
                Go to login
              </Button>
            </Link>
          </div>
        ) : (
          <form className="space-y-4" onSubmit={onSubmit}>
            <Input
              label="New password"
              name="password"
              type="password"
              required
            />
            <Input
              label="Confirm new password"
              name="confirmPassword"
              type="password"
              required
            />
            {error ? (
              <p className="text-base font-semibold text-danger">{error}</p>
            ) : null}
            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={pending}
            >
              {pending ? "Updating…" : "Update password"}
            </Button>
          </form>
        )}
      </div>
    </PageShell>
  );
}
