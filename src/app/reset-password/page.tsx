import { Suspense } from "react";
import ResetPasswordClient from "./reset-client";

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-md space-y-4 px-4 py-16">
          <div className="h-8 w-48 animate-pulse rounded-[8px] bg-[#f3f2f1]" />
          <div className="h-40 animate-pulse rounded-[16px] bg-[#f3f2f1]" />
        </div>
      }
    >
      <ResetPasswordClient />
    </Suspense>
  );
}
