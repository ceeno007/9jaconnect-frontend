"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { GoogleSignInButton } from "@/components/ui/google-sign-in-button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { PageShell } from "@/components/ui/primitives";
import { useAuth } from "@/components/providers/auth-provider";
import {
  listCategories,
  listLgas,
  listStates,
  listSubcategories,
} from "@/lib/api";
import type {
  Category,
  Lga,
  ProfessionalCreateRequest,
  State,
  Subcategory,
} from "@/lib/api/types";
import { ApiError } from "@/lib/api/types";
import { nairaToKobo } from "@/lib/api/mappers";
import { promptGoogleIdToken } from "@/lib/google-auth";
import { formatMoneyInput, parseMoneyInput } from "@/lib/utils";

function readProfessionalProfile(
  form: HTMLFormElement,
): ProfessionalCreateRequest | null {
  const data = new FormData(form);
  const business_name = String(data.get("businessName") || "").trim();
  const service_description = String(data.get("description") || "").trim();
  const years_of_experience = Number(data.get("years") || 0);
  const state_id = String(data.get("state") || "");
  const lga_id = String(data.get("lga") || "");
  const category_id = String(data.get("category") || "");
  const subcategory_id = String(data.get("subcategory") || "");
  const hourly = Number(parseMoneyInput(String(data.get("hourlyRate") || "")) || 0);
  const daily = Number(parseMoneyInput(String(data.get("dayRate") || "")) || 0);

  if (
    !business_name ||
    !service_description ||
    !state_id ||
    !lga_id ||
    !category_id ||
    !subcategory_id
  ) {
    return null;
  }

  return {
    business_name,
    service_description,
    business_address: String(data.get("address") || "").trim() || null,
    years_of_experience: Number.isFinite(years_of_experience)
      ? years_of_experience
      : 0,
    state_id,
    lga_id,
    category_id,
    subcategory_id,
    hourly_rate_kobo: hourly ? nairaToKobo(hourly) : null,
    daily_rate_kobo: daily ? nairaToKobo(daily) : null,
    referred_by_code: String(data.get("referralCode") || "").trim() || null,
  };
}

export default function ProfessionalSignupPage() {
  const router = useRouter();
  const { register, loginWithGoogle } = useAuth();
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [states, setStates] = useState<State[]>([]);
  const [lgas, setLgas] = useState<Lga[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [stateId, setStateId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const [dayRate, setDayRate] = useState("");

  useEffect(() => {
    void Promise.all([listStates(), listCategories()]).then(
      ([nextStates, nextCategories]) => {
        setStates(nextStates);
        setCategories(nextCategories);
      },
    );
  }, []);

  useEffect(() => {
    if (!stateId) {
      setLgas([]);
      return;
    }
    void listLgas(stateId).then(setLgas);
  }, [stateId]);

  useEffect(() => {
    if (!categoryId) {
      setSubcategories([]);
      return;
    }
    void listSubcategories(categoryId).then(setSubcategories);
  }, [categoryId]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") || "");
    const confirmPassword = String(form.get("confirmPassword") || "");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const profile = readProfessionalProfile(event.currentTarget);
    if (!profile) {
      setError("Please complete all required business and location fields.");
      return;
    }

    setPending(true);
    try {
      await register({
        full_name: String(form.get("fullName") || "").trim(),
        email: String(form.get("email") || "").trim(),
        phone: String(form.get("phone") || "").trim(),
        whatsapp_number: String(form.get("whatsapp") || "").trim(),
        password,
        user_type: "professional",
        professional_profile: profile,
      });
      router.push("/signup/professional/check-email");
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Could not create account. Please try again.",
      );
    } finally {
      setPending(false);
    }
  }

  async function onGoogleClick() {
    setError("");
    const form = formRef.current;
    if (!form) return;

    const profile = readProfessionalProfile(form);
    if (!profile) {
      setError(
        "Fill in your business and location details first, then sign up with Google.",
      );
      return;
    }

    setPending(true);
    try {
      const idToken = await promptGoogleIdToken();
      await loginWithGoogle(idToken, {
        user_type: "professional",
        professional_profile: profile,
      });
      router.push("/dashboard/professional");
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Google sign-up failed. Please try again.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <PageShell title="Sign Up as Professional">
      <div className="mx-auto max-w-2xl space-y-6">
        <section className="ui-card p-6 sm:p-8">
          <h2 className="text-2xl text-black">Personal Details</h2>
          <form
            ref={formRef}
            className="mt-5 grid gap-4 sm:grid-cols-2"
            onSubmit={onSubmit}
          >
            <Input label="Full name" name="fullName" required />
            <Input label="Email" name="email" type="email" required />
            <Input label="Phone" name="phone" required />
            <Input label="WhatsApp" name="whatsapp" required />
            <Input label="Password" name="password" type="password" required />
            <Input
              label="Confirm password"
              name="confirmPassword"
              type="password"
              required
            />
            <div className="sm:col-span-2">
              <Input
                label="Referral code"
                name="referralCode"
                hint="Optional"
              />
            </div>

            <div className="sm:col-span-2 mt-4 pt-6">
              <h2 className="text-2xl text-black">Business</h2>
            </div>
            <div className="sm:col-span-2">
              <Input label="Business / trade name" name="businessName" required />
            </div>
            <div className="sm:col-span-2">
              <Input
                label="Service description"
                name="description"
                required
              />
            </div>
            <Input
              label="Years of experience"
              name="years"
              type="number"
              min={0}
              required
            />
            <Input
              label="Hourly rate (₦)"
              name="hourlyRate"
              inputMode="numeric"
              value={hourlyRate}
              onChange={(e) => setHourlyRate(formatMoneyInput(e.target.value))}
              placeholder="e.g. 15,000"
            />
            <Input
              label="Day rate (₦)"
              name="dayRate"
              inputMode="numeric"
              value={dayRate}
              onChange={(e) => setDayRate(formatMoneyInput(e.target.value))}
              placeholder="e.g. 80,000"
            />
            <Select
              label="Category"
              name="category"
              required
              placeholder="Select category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              options={categories.map((c) => ({
                label: c.name,
                value: c.id,
              }))}
            />
            <Select
              label="Subcategory"
              name="subcategory"
              required
              placeholder={
                categoryId ? "Select subcategory" : "Select category first"
              }
              disabled={!categoryId}
              options={subcategories.map((s) => ({
                label: s.name,
                value: s.id,
              }))}
            />

            <div className="sm:col-span-2 mt-4 pt-6">
              <h2 className="text-2xl text-black">Your Location</h2>
            </div>
            <Select
              label="State"
              name="state"
              options={states.map((s) => ({ label: s.name, value: s.id }))}
              placeholder="Select state"
              required
              value={stateId}
              onChange={(e) => setStateId(e.target.value)}
            />
            <Select
              label="LGA"
              name="lga"
              required
              placeholder={stateId ? "Select LGA" : "Select state first"}
              disabled={!stateId}
              options={lgas.map((l) => ({ label: l.name, value: l.id }))}
            />
            <div className="sm:col-span-2">
              <Input label="Address" name="address" required />
            </div>
            {error ? (
              <p className="sm:col-span-2 text-base font-semibold text-danger">
                {error}
              </p>
            ) : null}
            <p className="sm:col-span-2 text-sm font-medium text-muted">
              By creating an account you agree to our{" "}
              <Link href="/terms" className="font-bold text-black underline">
                Terms
              </Link>
              ,{" "}
              <Link href="/privacy" className="font-bold text-black underline">
                Privacy Policy
              </Link>
              , and{" "}
              <Link
                href="/listing-guidelines"
                className="font-bold text-black underline"
              >
                Listing Guidelines
              </Link>
              .
            </p>
            <div className="sm:col-span-2 space-y-4">
              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={pending}
              >
                {pending ? "Creating account…" : "Create professional account"}
              </Button>
              <div className="flex items-center gap-4 text-sm font-bold uppercase tracking-wide text-muted">
                <span className="h-px flex-1 bg-[#dadce0]" />
                or
                <span className="h-px flex-1 bg-[#dadce0]" />
              </div>
              <GoogleSignInButton
                label="Sign up with Google"
                onClick={onGoogleClick}
                disabled={pending}
              />
              <p className="text-center text-sm font-medium text-muted">
                Fill business and location details above, then use Google to
                skip password setup.
              </p>
            </div>
          </form>
        </section>
        <p className="text-center text-sm text-muted">
          Already registered?{" "}
          <Link href="/login" className="font-medium text-black">
            Login
          </Link>
        </p>
      </div>
    </PageShell>
  );
}
