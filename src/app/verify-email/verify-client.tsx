"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PageShell } from "@/components/ui/primitives";
import { Skeleton } from "@/components/ui/skeleton";
import { verifyEmailRequest } from "@/lib/api";
import { ApiError } from "@/lib/api/types";

type Status = "verifying" | "success" | "error";

export default function VerifyEmailClient() {
  const searchParams = useSearchParams();
  const token = useMemo(
    () => searchParams.get("token") || searchParams.get("t") || "",
    [searchParams],
  );
  const [status, setStatus] = useState<Status>("verifying");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage(
        "Verification token is missing. Open the link from your email.",
      );
      return;
    }

    let cancelled = false;
    void verifyEmailRequest(token)
      .then((data) => {
        if (cancelled) return;
        setStatus("success");
        setMessage(
          data.message ||
            "Your email has been verified. You can log in now.",
        );
      })
      .catch((err) => {
        if (cancelled) return;
        setStatus("error");
        setMessage(
          err instanceof ApiError
            ? err.message
            : "Verification failed. The link may have expired.",
        );
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <PageShell title="Verify email">
      <div className="mx-auto max-w-md ui-card p-8 text-center">
        {status === "verifying" ? (
          <div className="space-y-4" aria-busy="true" aria-label="Verifying">
            <Skeleton className="mx-auto h-4 w-24" />
            <Skeleton className="mx-auto h-8 w-3/4" />
            <Skeleton className="mx-auto h-4 w-1/2" />
          </div>
        ) : (
          <>
            <p className="text-sm font-semibold uppercase tracking-wide text-black">
              {status === "success" ? "Success" : "Error"}
            </p>
            <h2 className="mt-3 text-2xl text-black">{message}</h2>
            <div className="mt-8">
              <Link href="/login">
                <Button size="lg" className="w-full">
                  Go to login
                </Button>
              </Link>
            </div>
          </>
        )}
      </div>
    </PageShell>
  );
}
