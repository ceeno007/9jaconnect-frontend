import { Suspense } from "react";
import OpsResetPasswordInner from "./reset-client";

export default function OpsResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="page-x mx-auto max-w-md py-16 text-base font-semibold text-muted">
          Loading…
        </div>
      }
    >
      <OpsResetPasswordInner />
    </Suspense>
  );
}
