"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { GoogleSignInButton } from "@/components/ui/google-sign-in-button";
import { Input } from "@/components/ui/input";
import { PageShell } from "@/components/ui/primitives";
import { useAuth } from "@/components/providers/auth-provider";
import { ApiError } from "@/lib/api/types";
import { isGoogleAuthConfigured } from "@/lib/google-auth";

function redirectAfterAuth(
  router: ReturnType<typeof useRouter>,
  userType?: string | null,
) {
  const next = new URLSearchParams(window.location.search).get("next");
  if (next?.startsWith("/")) {
    router.push(next);
    return;
  }
  if (userType === "professional") {
    router.push("/dashboard/professional");
    return;
  }
  router.push("/dashboard/customer");
}

export default function LoginPage() {
  const router = useRouter();
  const { login, loginWithGoogle } = useAuth();
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
      const user = await login(email, password);
      redirectAfterAuth(router, user?.user_type);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.code === "auth_email_not_verified") {
          setError(
            "Please verify your email before logging in. Check your inbox for the link.",
          );
        } else {
          setError(err.message);
        }
      } else {
        setError("Unable to log in. Please try again.");
      }
    } finally {
      setPending(false);
    }
  }

  async function onGoogleCredential(idToken: string) {
    setError("");
    setPending(true);
    try {
      const user = await loginWithGoogle(idToken);
      redirectAfterAuth(router, user?.user_type);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Google sign-in failed. Please try again.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <PageShell title="Login">
      <div className="mx-auto max-w-lg ui-card p-8 sm:p-10">
        {isGoogleAuthConfigured() ? (
          <>
            <GoogleSignInButton
              text="signin_with"
              onCredential={onGoogleCredential}
              disabled={pending}
            />
            <div className="my-8 flex items-center gap-4 text-sm font-bold uppercase tracking-wide text-muted">
              <span className="h-px flex-1 bg-[#ececee]" />
              or
              <span className="h-px flex-1 bg-[#ececee]" />
            </div>
          </>
        ) : null}
        <form className="space-y-5" onSubmit={onSubmit}>
          <Input label="Email" name="email" type="email" required />
          <Input label="Password" name="password" type="password" required />
          {error ? (
            <p className="text-base font-semibold text-danger">{error}</p>
          ) : null}
          <div className="flex justify-end">
            <Link
              href="/forgot-password"
              className="text-base font-bold text-black hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <Button type="submit" className="w-full" size="lg" disabled={pending}>
            {pending ? "Logging in…" : "Login"}
          </Button>
        </form>
        <p className="mt-8 text-center text-base font-medium text-muted">
          New here?{" "}
          <Link href="/signup/customer" className="font-bold text-black">
            Sign Up as Customer
          </Link>{" "}
          or{" "}
          <Link href="/signup/professional" className="font-bold text-black">
            Professional
          </Link>
        </p>
      </div>
    </PageShell>
  );
}
