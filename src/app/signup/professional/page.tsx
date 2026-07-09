"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
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
import type { Category, Lga, State, Subcategory } from "@/lib/api/types";
import { ApiError } from "@/lib/api/types";
import { nairaToKobo } from "@/lib/api/mappers";

export default function ProfessionalSignupPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [states, setStates] = useState<State[]>([]);
  const [lgas, setLgas] = useState<Lga[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [stateId, setStateId] = useState("");
  const [categoryId, setCategoryId] = useState("");

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

    const hourly = Number(form.get("hourlyRate") || 0);
    const daily = Number(form.get("dayRate") || 0);
    const years = Number(form.get("years") || 0);

    setPending(true);
    try {
      await register({
        full_name: String(form.get("fullName") || "").trim(),
        email: String(form.get("email") || "").trim(),
        phone: String(form.get("phone") || "").trim(),
        whatsapp_number: String(form.get("whatsapp") || "").trim(),
        password,
        user_type: "professional",
        professional_profile: {
          business_name: String(form.get("businessName") || "").trim(),
          service_description: String(form.get("description") || "").trim(),
          business_address: String(form.get("address") || "").trim(),
          years_of_experience: years,
          state_id: String(form.get("state") || ""),
          lga_id: String(form.get("lga") || ""),
          category_id: String(form.get("category") || ""),
          subcategory_id: String(form.get("subcategory") || ""),
          hourly_rate_kobo: hourly ? nairaToKobo(hourly) : null,
          daily_rate_kobo: daily ? nairaToKobo(daily) : null,
          referred_by_code: String(form.get("referralCode") || "").trim() || null,
        },
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

  return (
    <PageShell title="Sign Up as Professional">
      <div className="mx-auto max-w-2xl space-y-6">
        <section className="ui-card p-6 sm:p-8">
          <h2 className="text-2xl text-black">Personal Details</h2>
          <form className="mt-5 grid gap-4 sm:grid-cols-2" onSubmit={onSubmit}>
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
              type="number"
              min={0}
            />
            <Input label="Day rate (₦)" name="dayRate" type="number" min={0} />
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
            <div className="sm:col-span-2">
              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={pending}
              >
                {pending ? "Creating account…" : "Create professional account"}
              </Button>
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
