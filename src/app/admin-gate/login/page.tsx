"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/components/providers/admin-auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageShell } from "@/components/ui/primitives";
import { adminAuthPaths } from "@/lib/admin-paths";
import { ApiError } from "@/lib/api/types";

export default function OpsLoginPage() {
  const router = useRouter();
  const { login } = useAdminAuth();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setPending(true);
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") || "").trim();
    const password = String(form.get("password") || "");

    try {
      await login(email, password);
      const next = new URLSearchParams(window.location.search).get("next");
      router.replace(
        next?.startsWith("/admin") ? next : "/admin/dashboard",
      );
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Unable to sign in. Check your credentials.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <PageShell title="Sign in">
      <div className="mx-auto max-w-lg ui-card p-8 sm:p-10">
        <form className="space-y-5" onSubmit={onSubmit}>
          <Input label="Email" name="email" type="email" required />
          <Input label="Password" name="password" type="password" required />
          {error ? (
            <p className="text-base font-semibold text-danger">{error}</p>
          ) : null}
          <div className="flex justify-end">
            <Link
              href={adminAuthPaths.forgotPassword}
              className="text-base font-bold text-black hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <Button type="submit" className="w-full" size="lg" disabled={pending}>
            {pending ? "Signing in…" : "Sign in"}
          </Button>
        </form>
      </div>
    </PageShell>
  );
}
