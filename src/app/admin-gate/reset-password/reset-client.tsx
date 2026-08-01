"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageShell } from "@/components/ui/primitives";
import { adminAuthPaths } from "@/lib/admin-paths";
import { adminResetPassword } from "@/lib/api/admin-client";
import { ApiError } from "@/lib/api/types";

export default function OpsResetPasswordInner() {
  const searchParams = useSearchParams();
  const tokenFromQuery = searchParams.get("token") || "";
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setPending(true);
    const form = new FormData(event.currentTarget);
    const token = String(form.get("token") || tokenFromQuery).trim();
    const password = String(form.get("password") || "");
    const confirm = String(form.get("confirmPassword") || "");

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      setPending(false);
      return;
    }

    if (password !== confirm) {
      setError("Passwords do not match.");
      setPending(false);
      return;
    }

    try {
      await adminResetPassword(token, password);
      setSuccess("Password updated. You can sign in with your new password.");
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Could not reset password.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <PageShell title="Set new password">
      <div className="mx-auto max-w-md ui-card p-6 sm:p-8">
        <form className="space-y-4" onSubmit={onSubmit}>
          {!tokenFromQuery ? (
            <Input label="Reset token" name="token" required />
          ) : (
            <input type="hidden" name="token" value={tokenFromQuery} />
          )}
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
          {success ? (
            <p className="text-base font-semibold text-black">{success}</p>
          ) : null}
          <Button type="submit" className="w-full" size="lg" disabled={pending}>
            {pending ? "Updating…" : "Update password"}
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
