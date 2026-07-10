"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageShell } from "@/components/ui/primitives";
import { resendVerification } from "@/lib/api/auth-client";
import { ApiError } from "@/lib/api/types";

export default function CustomerCheckEmailPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function onResend() {
    setError("");
    setMessage("");
    if (!email.trim()) {
      setError("Enter the email you registered with.");
      return;
    }
    setPending(true);
    try {
      const data = await resendVerification(email.trim());
      setMessage(data.message || "Verification email sent.");
    } catch (err) {
      if (err instanceof ApiError && err.code === "auth_already_verified") {
        setMessage("This email is already verified. Redirecting to login…");
        window.setTimeout(() => router.push("/login"), 900);
        return;
      }
      setError(
        err instanceof ApiError
          ? err.message
          : "Could not resend verification email.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <PageShell title="Check your email">
      <div className="mx-auto max-w-md ui-card p-8 text-center">
        <h2 className="text-2xl text-black">We sent a verification link</h2>
        <p className="mt-3 text-sm text-muted">
          Open the email we just sent and confirm your address to continue.
        </p>
        <div className="mt-6 space-y-3 text-left">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
          />
          {error ? (
            <p className="text-sm font-semibold text-danger">{error}</p>
          ) : null}
          {message ? (
            <p className="text-sm font-semibold text-black">{message}</p>
          ) : null}
          <Button
            className="w-full"
            variant="outline"
            disabled={pending}
            onClick={() => void onResend()}
          >
            {pending ? "Sending…" : "Resend verification email"}
          </Button>
        </div>
        <Link
          href="/login"
          className="mt-4 inline-block text-sm font-medium text-black"
        >
          Back to login
        </Link>
      </div>
    </PageShell>
  );
}
