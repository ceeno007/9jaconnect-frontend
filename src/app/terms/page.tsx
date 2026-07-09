import type { Metadata } from "next";
import Link from "next/link";
import { LegalDoc, LegalSection } from "@/components/legal/legal-doc";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Terms governing use of the 9jaconnect marketplace for customers and professionals in Nigeria.",
};

const EFFECTIVE = "9 July 2026";

export default function TermsPage() {
  return (
    <LegalDoc title="Terms of Service" effectiveDate={EFFECTIVE}>
      <LegalSection title="1. Who we are">
        <p>
          These Terms of Service (“Terms”) govern your access to and use of the
          9jaconnect website, apps, and related services (the “Platform”)
          operated by {SITE.legalName} (“9jaconnect”, “we”, “us”, or “our”).
        </p>
        <p>
          Contact: {SITE.email} · {SITE.phone} · {SITE.address}.
        </p>
        <p>
          By creating an account, accessing the Platform, listing services, or
          requesting services, you agree to these Terms and our{" "}
          <Link href="/privacy" className="font-bold text-black underline">
            Privacy Policy
          </Link>
          . If you do not agree, do not use the Platform.
        </p>
      </LegalSection>

      <LegalSection title="2. What 9jaconnect is (and is not)">
        <p>
          9jaconnect is an online directory and marketplace technology that
          helps customers discover and contact independent sole-trader
          professionals in Nigeria, and helps those professionals present their
          services.
        </p>
        <p>
          <strong className="font-bold text-black">
            We are not the employer, agent, partner, joint venturer, or insurer
            of any professional or customer.
          </strong>{" "}
          We do not provide the underlying trade services (for example plumbing,
          electrical, cleaning, caregiving, or repairs). Any service engagement
          is a contract solely between the customer and the professional.
        </p>
        <p>
          We do not guarantee that any professional is available, licensed for a
          particular job, insured, or suitable for your needs. “Verified” or
          similar badges mean only that certain identity or document checks were
          submitted or reviewed under our processes — not that we warrant skill,
          safety, legality, or outcomes.
        </p>
      </LegalSection>

      <LegalSection title="3. Eligibility and accounts">
        <p>You must:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>be at least 18 years old;</li>
          <li>have legal capacity to enter a binding contract under Nigerian law;</li>
          <li>
            provide accurate, current registration information and keep it
            updated;
          </li>
          <li>
            keep login credentials confidential and promptly notify us of
            unauthorised access.
          </li>
        </ul>
        <p>
          You may register as a <strong className="text-black">Customer</strong>{" "}
          (to request services) or a{" "}
          <strong className="text-black">Professional</strong> (to list as a
          sole trader). One person may hold both roles only if permitted by the
          Platform and accurately disclosed.
        </p>
        <p>
          We may refuse, suspend, or terminate accounts that appear fraudulent,
          abusive, incomplete, or in breach of these Terms or our{" "}
          <Link
            href="/listing-guidelines"
            className="font-bold text-black underline"
          >
            Listing Guidelines
          </Link>
          .
        </p>
      </LegalSection>

      <LegalSection title="4. Sole-trader professionals only">
        <p>
          Professional listings are intended for independent sole traders /
          artisans operating in their personal capacity. You must not present a
          company, agency, or multi-employee business as a sole-trader listing
          unless we expressly allow a different listing type.
        </p>
        <p>
          Professionals are solely responsible for taxes, pensions, permits,
          trade licences, insurance, tools, and compliance with all applicable
          Nigerian federal, state, and local laws for the services they offer.
        </p>
      </LegalSection>

      <LegalSection title="5. Customer responsibilities">
        <p>Customers agree to:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            describe jobs accurately and provide safe access to the work
            location;
          </li>
          <li>
            independently assess a professional’s suitability, rates, and
            credentials before hiring;
          </li>
          <li>
            negotiate and pay the professional directly unless we later
            introduce a payment feature and say otherwise in writing;
          </li>
          <li>
            not request illegal, unsafe, discriminatory, or exploitative work;
          </li>
          <li>
            treat professionals respectfully and comply with ticket, messaging,
            and review rules.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="6. Professional responsibilities">
        <p>Professionals agree to:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            list only services they are competent and legally allowed to
            perform;
          </li>
          <li>
            keep profile information, rates, location, and availability truthful;
          </li>
          <li>
            respond to service tickets in good faith and honour agreed quotes
            where accepted;
          </li>
          <li>
            not misrepresent verification, ratings, experience, or identity;
          </li>
          <li>
            comply with the Listing Guidelines and not solicit users off-platform
            in ways that evade Platform rules or safety features.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="7. Service tickets, messaging, quotes, and reviews">
        <p>
          The Platform may provide tickets, messaging, quotes, status updates,
          disputes, and reviews to help organise engagements. Those tools do not
          make 9jaconnect a party to the service contract.
        </p>
        <p>
          Quotes, confirmations, and messages create expectations between users.
          You remain responsible for documenting your own commercial terms
          (scope, price, timing, materials, cancellations) outside or inside the
          Platform.
        </p>
        <p>
          Reviews must be honest, based on a real completed engagement, and free
          of unlawful, defamatory, or abusive content. We may remove or limit
          reviews that violate these Terms.
        </p>
      </LegalSection>

      <LegalSection title="8. Fees and payments">
        <p>
          Unless we publish otherwise, customers pay professionals directly.
          9jaconnect may charge listing, featured, subscription, or other
          platform fees to professionals. Fee amounts and billing terms will be
          shown at purchase or in-product.
        </p>
        <p>
          You are responsible for all applicable taxes. We are not responsible
          for unpaid invoices between users, cash disputes, or chargebacks on
          payments made outside the Platform.
        </p>
      </LegalSection>

      <LegalSection title="9. Identity checks and safety">
        <p>
          We may request identity documents, phone verification, or other checks
          for customers or professionals. Submission does not create a warranty.
          Always meet in safe conditions, verify identity in person where
          appropriate, and use common-sense precautions for home access and
          caregiving work.
        </p>
        <p>
          Report suspected fraud, harassment, or illegal activity to{" "}
          {SITE.email} and, where needed, to Nigerian law enforcement.
        </p>
      </LegalSection>

      <LegalSection title="10. Acceptable use">
        <p>You must not:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>break any applicable law or third-party right;</li>
          <li>scrape, reverse engineer, or overload the Platform;</li>
          <li>upload malware, spam, or deceptive content;</li>
          <li>impersonate others or create fake reviews or listings;</li>
          <li>
            use the Platform for trafficking, exploitation, hate, or violence;
          </li>
          <li>
            collect other users’ personal data for unsolicited marketing without
            lawful basis.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="11. Intellectual property">
        <p>
          The Platform, branding, and software are owned by 9jaconnect or its
          licensors. You receive a limited, revocable, non-exclusive licence to
          use the Platform for its intended purpose.
        </p>
        <p>
          You retain ownership of content you upload (photos, descriptions,
          messages) and grant us a worldwide, royalty-free licence to host,
          display, and process that content to operate and improve the Platform.
          You represent you have rights to that content.
        </p>
      </LegalSection>

      <LegalSection title="12. Privacy">
        <p>
          We process personal data as described in our{" "}
          <Link href="/privacy" className="font-bold text-black underline">
            Privacy Policy
          </Link>
          , in line with the Nigeria Data Protection Act, 2023 (NDPA) and
          applicable NDPC guidance.
        </p>
      </LegalSection>

      <LegalSection title="13. Disclaimers">
        <p>
          THE PLATFORM IS PROVIDED “AS IS” AND “AS AVAILABLE”. TO THE MAXIMUM
          EXTENT PERMITTED BY NIGERIAN LAW, WE DISCLAIM ALL WARRANTIES, EXPRESS
          OR IMPLIED, INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR
          PURPOSE, AND NON-INFRINGEMENT.
        </p>
        <p>
          We do not warrant uninterrupted or error-free service, accurate
          listings, successful hires, or the conduct of any user.
        </p>
      </LegalSection>

      <LegalSection title="14. Limitation of liability">
        <p>
          To the maximum extent permitted by law, 9jaconnect and its officers,
          employees, and agents will not be liable for indirect, incidental,
          special, consequential, punitive, or exemplary damages, or for lost
          profits, data, goodwill, or business opportunities, arising from the
          Platform or any user-to-user engagement.
        </p>
        <p>
          Our total aggregate liability for claims relating to the Platform in
          any 12-month period will not exceed the greater of (a) the fees you
          paid us for Platform access in that period, or (b) ₦50,000.
        </p>
        <p>
          Nothing in these Terms excludes liability that cannot be excluded
          under Nigerian law, including liability for fraud or death/personal
          injury caused by negligence where such exclusion is prohibited.
          Consumer rights under the Federal Competition and Consumer Protection
          Act (FCCPA) remain available where they apply and cannot be waived.
        </p>
      </LegalSection>

      <LegalSection title="15. Indemnity">
        <p>
          You agree to indemnify and hold harmless 9jaconnect from claims,
          losses, and expenses (including reasonable legal fees) arising from
          your content, your services or hiring decisions, your breach of these
          Terms, or your violation of law or third-party rights.
        </p>
      </LegalSection>

      <LegalSection title="16. Suspension and termination">
        <p>
          You may stop using the Platform at any time. You may request account
          deletion through in-product settings or by emailing {SITE.email},
          subject to legal retention needs.
        </p>
        <p>
          We may suspend or terminate access immediately for breach, risk to
          users, legal compliance, or prolonged inactivity. Sections that by
          nature should survive (including IP, disclaimers, liability limits,
          indemnity, and dispute terms) will survive termination.
        </p>
      </LegalSection>

      <LegalSection title="17. Changes">
        <p>
          We may update these Terms. We will post the revised version with a new
          effective date and, where required, provide additional notice. Continued
          use after the effective date constitutes acceptance.
        </p>
      </LegalSection>

      <LegalSection title="18. Governing law and disputes">
        <p>
          These Terms are governed by the laws of the Federal Republic of
          Nigeria. Courts in Lagos State, Nigeria shall have exclusive
          jurisdiction, without prejudice to mandatory consumer protections.
        </p>
        <p>
          Before filing a claim, you agree to attempt good-faith resolution by
          contacting {SITE.email}. Users should first try to resolve
          customer–professional disputes directly; Platform tools may assist but
          do not obligate us to mediate or decide commercial outcomes.
        </p>
      </LegalSection>

      <LegalSection title="19. General">
        <p>
          If any provision is unenforceable, the remainder stays in effect.
          These Terms are the entire agreement regarding the Platform and
          supersede prior conflicting terms for that subject. You may not assign
          these Terms without our consent; we may assign them in connection with
          a reorganisation or sale. Our failure to enforce a provision is not a
          waiver.
        </p>
      </LegalSection>
    </LegalDoc>
  );
}
