import { Suspense } from "react";
import VerifyEmailClient from "./verify-client";

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="page-x mx-auto max-w-md space-y-4 py-16">
          <div className="mx-auto h-4 w-24 animate-pulse rounded-[8px] bg-[#f4f4f5]" />
          <div className="h-8 w-full animate-pulse rounded-[8px] bg-[#f4f4f5]" />
          <div className="h-40 animate-pulse rounded-[16px] bg-[#f4f4f5]" />
        </div>
      }
    >
      <VerifyEmailClient />
    </Suspense>
  );
}
