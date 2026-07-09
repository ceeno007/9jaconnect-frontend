import type { Metadata } from "next";
import Link from "next/link";
import { LegalDoc, LegalSection } from "@/components/legal/legal-doc";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How 9jaconnect collects, uses, and protects personal data under the Nigeria Data Protection Act.",
};

const EFFECTIVE = "9 July 2026";

export default function PrivacyPage() {
  return (
    <LegalDoc title="Privacy Policy" effectiveDate={EFFECTIVE}>
      <LegalSection title="1. Introduction">
        <p>
          This Privacy Policy explains how {SITE.legalName} (“9jaconnect”, “we”,
          “us”) collects, uses, stores, shares, and protects personal data when
          you use our Platform.
        </p>
        <p>
          We process personal data in accordance with the Nigeria Data
          Protection Act, 2023 (NDPA), applicable Nigeria Data Protection
          Commission (NDPC) guidance (including the GAID where applicable), and
          other Nigerian laws.
        </p>
        <p>
          Contact for privacy requests: {SITE.email}. Postal: {SITE.address}.
        </p>
      </LegalSection>

      <LegalSection title="2. Who this policy covers">
        <p>
          This policy applies to customers, professionals, visitors, and other
          users of 9jaconnect websites and apps. It does not cover third-party
          websites linked from the Platform.
        </p>
        <p>
          Depending on the activity, 9jaconnect typically acts as a{" "}
          <strong className="text-black">data controller</strong> for account,
          directory, and platform-operation data. Where we process data solely
          on another organisation’s documented instructions, we act as a
          processor for that processing.
        </p>
      </LegalSection>

      <LegalSection title="3. Personal data we collect">
        <p>Depending on how you use the Platform, we may collect:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong className="text-black">Identity & contact:</strong> name,
            email, phone, WhatsApp number, date of birth, gender, home
            state/LGA, profile photo.
          </li>
          <li>
            <strong className="text-black">Account & security:</strong>{" "}
            passwords (hashed), authentication tokens, verification status,
            login metadata.
          </li>
          <li>
            <strong className="text-black">Professional listing:</strong>{" "}
            business/trade name, service description, rates, experience,
            address, category, gallery images, referral codes.
          </li>
          <li>
            <strong className="text-black">KYC / verification:</strong>{" "}
            government ID type and images, business documents, review outcomes,
            rejection reasons.
          </li>
          <li>
            <strong className="text-black">Service activity:</strong> tickets,
            messages, quotes, disputes, reviews, ratings, proof uploads.
          </li>
          <li>
            <strong className="text-black">Technical data:</strong> IP address,
            device/browser type, pages viewed, approximate location derived from
            IP, cookies or similar technologies.
          </li>
          <li>
            <strong className="text-black">Support & compliance:</strong>{" "}
            emails, complaints, deletion requests, and records needed for legal
            obligations.
          </li>
        </ul>
        <p>
          We do not intentionally collect children’s data. The Platform is for
          users 18+.
        </p>
      </LegalSection>

      <LegalSection title="4. How we collect data">
        <ul className="list-disc space-y-2 pl-5">
          <li>directly from you (forms, uploads, messages);</li>
          <li>automatically through the Platform and analytics tools;</li>
          <li>
            from identity or security providers you authorise (for example
            Google sign-in);
          </li>
          <li>from other users when they message or review you.</li>
        </ul>
      </LegalSection>

      <LegalSection title="5. Purposes and lawful bases">
        <p>We process personal data to:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            create and manage accounts, authenticate users, and provide
            directory/search features (contract / legitimate interest);
          </li>
          <li>
            enable tickets, messaging, quotes, reviews, and support (contract);
          </li>
          <li>
            verify identity and reduce fraud/abuse (legitimate interest / legal
            obligation where applicable);
          </li>
          <li>
            improve safety, product quality, and Platform security (legitimate
            interest);
          </li>
          <li>
            send service notices (contract) and, where allowed, marketing with
            consent or soft opt-in where Nigerian law permits;
          </li>
          <li>
            comply with law, respond to lawful requests, and establish/defend
            legal claims (legal obligation / legitimate interest).
          </li>
        </ul>
        <p>
          Where processing requires consent under the NDPA, you may withdraw
          consent without affecting prior lawful processing.
        </p>
      </LegalSection>

      <LegalSection title="6. Sharing">
        <p>We may share personal data with:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            other users as needed for marketplace function (for example profile
            details shown publicly; ticket counterparties seeing messages);
          </li>
          <li>
            service providers (hosting, email, analytics, cloud storage,
            customer support) under contracts requiring confidentiality and NDPA
            safeguards;
          </li>
          <li>
            professional advisers and auditors under confidentiality;
          </li>
          <li>
            authorities when required by law or to protect rights, safety, or
            the Platform;
          </li>
          <li>
            a buyer or successor in a merger, acquisition, or asset transfer,
            subject to continued protection.
          </li>
        </ul>
        <p>
          We do not sell personal data. Public professional listings are visible
          to visitors by design.
        </p>
      </LegalSection>

      <LegalSection title="7. International transfers">
        <p>
          If we transfer personal data outside Nigeria (for example to cloud
          providers), we will use appropriate safeguards required by the NDPA /
          NDPC guidance, such as contractual protections and transfer
          assessments where required.
        </p>
      </LegalSection>

      <LegalSection title="8. Retention">
        <p>
          We keep personal data only as long as needed for the purposes above,
          including account life, dispute windows, security logs, and legal
          retention. KYC documents and ticket records may be kept longer where
          needed for fraud prevention, safety, or legal claims. When no longer
          needed, we delete or irreversibly anonymise data where feasible.
        </p>
      </LegalSection>

      <LegalSection title="9. Security">
        <p>
          We use administrative, technical, and organisational measures
          appropriate to the risk (access controls, encryption in transit where
          supported, least-privilege practices). No method is 100% secure; you
          also help by protecting your password and devices.
        </p>
      </LegalSection>

      <LegalSection title="10. Your rights">
        <p>
          Subject to the NDPA, you may request to access, correct, delete,
          restrict, or object to certain processing, and to withdraw consent
          where processing is consent-based. You may also lodge a complaint with
          the NDPC.
        </p>
        <p>
          To exercise rights, email {SITE.email} with enough detail to verify
          your identity and locate your data. We will respond within applicable
          statutory timelines.
        </p>
      </LegalSection>

      <LegalSection title="11. Cookies and similar technologies">
        <p>
          We use essential cookies for login/session security and may use
          analytics cookies to understand Platform use. You can control cookies
          through browser settings; disabling essential cookies may break core
          features.
        </p>
      </LegalSection>

      <LegalSection title="12. Children">
        <p>
          The Platform is not directed to anyone under 18. If you believe a
          minor provided data, contact {SITE.email} and we will take appropriate
          steps.
        </p>
      </LegalSection>

      <LegalSection title="13. Changes">
        <p>
          We may update this Policy and will post the revised version with a new
          effective date. Material changes may be highlighted in-product or by
          email where appropriate.
        </p>
      </LegalSection>

      <LegalSection title="14. Related documents">
        <p>
          See also our{" "}
          <Link href="/terms" className="font-bold text-black underline">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link
            href="/listing-guidelines"
            className="font-bold text-black underline"
          >
            Listing Guidelines
          </Link>
          .
        </p>
      </LegalSection>
    </LegalDoc>
  );
}
