import { Suspense } from "react";
import OpsResetPasswordInner from "./reset-client";

export default function OpsResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-md px-4 py-16 text-base font-semibold text-muted">
          Loading…
        </div>
      }
    >
      <OpsResetPasswordInner />
    </Suspense>
  );
}
