"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageShell } from "@/components/ui/primitives";
import { useAuth } from "@/components/providers/auth-provider";
import { ApiError } from "@/lib/api/types";

export default function CustomerSignupPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") || "");
    const confirmPassword = String(form.get("confirmPassword") || "");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setPending(true);
    try {
      await register({
        full_name: String(form.get("fullName") || "").trim(),
        email: String(form.get("email") || "").trim(),
        phone: String(form.get("phone") || "").trim(),
        password,
        user_type: "customer",
      });
      router.push("/signup/customer/check-email");
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Could not create account. Please try again.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <PageShell title="Sign Up as Customer">
      <div className="mx-auto max-w-lg ui-card p-6 sm:p-8">
        <form className="space-y-4" onSubmit={onSubmit}>
          <Input label="Full name" name="fullName" required />
          <Input label="Email" name="email" type="email" required />
          <Input label="Phone" name="phone" required />
          <Input label="Password" name="password" type="password" required />
          <Input
            label="Confirm password"
            name="confirmPassword"
            type="password"
            required
          />
          {error ? (
            <p className="text-base font-semibold text-danger">{error}</p>
          ) : null}
          <p className="text-sm font-medium text-muted">
            By creating an account you agree to our{" "}
            <Link href="/terms" className="font-bold text-black underline">
              Terms
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="font-bold text-black underline">
              Privacy Policy
            </Link>
            .
          </p>
          <Button type="submit" className="w-full" size="lg" disabled={pending}>
            {pending ? "Creating account…" : "Create customer account"}
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-muted">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-black">
            Login
          </Link>
        </p>
      </div>
    </PageShell>
  );
}
