import type { ReactNode } from "react";
import { PageShell } from "@/components/ui/primitives";

export function LegalSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-2xl font-bold text-black">{title}</h2>
      <div className="space-y-3 text-base font-medium leading-relaxed text-muted">
        {children}
      </div>
    </section>
  );
}

export function LegalDoc({
  title,
  effectiveDate,
  children,
}: {
  title: string;
  effectiveDate: string;
  children: ReactNode;
}) {
  return (
    <PageShell
      title={title}
      description={`Effective date: ${effectiveDate}. Please read carefully.`}
    >
      <article className="mx-auto max-w-3xl space-y-8 ui-card p-6 sm:p-10">
        <p className="rounded-[12px] bg-[#f7f7f6] px-4 py-3 text-sm font-medium leading-relaxed text-muted">
          These documents are written for a Nigerian sole-trader service
          directory marketplace. They are not a substitute for advice from a
          Nigerian lawyer. Have counsel review them before production launch,
          especially company details, fees, and dispute procedures.
        </p>
        {children}
      </article>
    </PageShell>
  );
}
