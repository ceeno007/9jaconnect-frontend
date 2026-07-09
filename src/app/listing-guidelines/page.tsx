import type { Metadata } from "next";
import Link from "next/link";
import { LegalDoc, LegalSection } from "@/components/legal/legal-doc";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Listing Guidelines",
  description:
    "Rules for professional listings on 9jaconnect, Nigeria’s sole-trader service directory.",
};

const EFFECTIVE = "9 July 2026";

export default function ListingGuidelinesPage() {
  return (
    <LegalDoc title="Listing Guidelines" effectiveDate={EFFECTIVE}>
      <LegalSection title="1. Purpose">
        <p>
          These Listing Guidelines help keep 9jaconnect accurate, safe, and fair
          for customers and sole-trader professionals. They form part of our{" "}
          <Link href="/terms" className="font-bold text-black underline">
            Terms of Service
          </Link>
          . Breaches may lead to content removal, suspension, or permanent bans.
        </p>
      </LegalSection>

      <LegalSection title="2. Who may list">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            Independent sole traders / artisans offering services in Nigeria.
          </li>
          <li>
            You must be 18+, legally able to contract, and able to perform the
            services you advertise.
          </li>
          <li>
            Do not list as a company, staffing agency, or multi-employee
            business unless we expressly offer that listing type.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="3. Accurate profiles">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            Use your real trade/business name and a truthful service
            description.
          </li>
          <li>
            Select the correct category and subcategory. Do not keyword-stuff
            unrelated trades.
          </li>
          <li>
            Rates, years of experience, location (state/LGA), and live-in
            availability must be current and honest.
          </li>
          <li>
            Photos must show your real work or relevant context. No stolen
            images, misleading stock photos presented as your work, or illegal
            content.
          </li>
          <li>
            Do not claim licences, certifications, or “verified” status you do
            not have.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="4. Allowed services">
        <p>
          List lawful consumer and small-business services consistent with
          Platform categories (for example home repairs, electrical, plumbing,
          cleaning, caregiving, beauty, events support, tutoring).
        </p>
        <p>You must hold any licence or permit required by law for that work.</p>
      </LegalSection>

      <LegalSection title="5. Prohibited listings and conduct">
        <ul className="list-disc space-y-2 pl-5">
          <li>Illegal goods/services, weapons, drugs, or stolen property.</li>
          <li>
            Sexual services, exploitation, trafficking, or anything involving
            minors.
          </li>
          <li>Hate, harassment, scams, phishing, or impersonation.</li>
          <li>
            Medical, legal, or financial advice that requires regulated
            professional status you do not hold.
          </li>
          <li>
            Fake reviews, review gating that only allows positive feedback, or
            paid ratings.
          </li>
          <li>
            Collecting deposits through deceptive urgency tactics or
            impersonating 9jaconnect staff.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="6. Safety and caregiving">
        <p>
          For domestic staff, nanny, and caregiving listings, provide clear
          scope, experience, and availability. Customers and professionals must
          still perform their own suitability checks. 9jaconnect identity checks
          are not a substitute for references, interviews, or legal employment
          compliance.
        </p>
      </LegalSection>

      <LegalSection title="7. Communication and off-platform contact">
        <p>
          Prefer Platform tickets/messages for first contact so both parties have
          a record. Sharing phone/WhatsApp is allowed when both parties choose
          to, but you remain responsible for safety and payment arrangements.
        </p>
      </LegalSection>

      <LegalSection title="8. Enforcement">
        <p>
          We may remove listings, require edits, request documents, limit
          visibility, or suspend accounts. To appeal, email {SITE.email} with
          your account email and listing details.
        </p>
      </LegalSection>

      <LegalSection title="9. Updates">
        <p>
          We may update these Guidelines. Continued listing after the effective
          date means you accept the updated rules.
        </p>
      </LegalSection>
    </LegalDoc>
  );
}
