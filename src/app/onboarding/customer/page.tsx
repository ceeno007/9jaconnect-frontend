"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { PageShell } from "@/components/ui/primitives";
import { useAuth } from "@/components/providers/auth-provider";
import { listCategories, listLgas, listStates } from "@/lib/api";
import {
  saveCustomerPreferences,
  submitOnboarding,
} from "@/lib/api/auth-client";
import type { Category, Lga, State } from "@/lib/api/types";
import { ApiError } from "@/lib/api/types";

export default function CustomerOnboardingPage() {
  const router = useRouter();
  const { isAuthenticated, refreshUser } = useAuth();
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [states, setStates] = useState<State[]>([]);
  const [lgas, setLgas] = useState<Lga[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [stateId, setStateId] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState<"male" | "female" | "prefer_not_to_say">(
    "prefer_not_to_say",
  );
  const [lgaId, setLgaId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [projectType, setProjectType] = useState("");

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
      setLgaId("");
      return;
    }
    void listLgas(stateId).then(setLgas);
  }, [stateId]);

  async function finishOnboarding() {
    setError("");
    if (!isAuthenticated) {
      router.push("/login?next=/onboarding/customer");
      return;
    }
    if (!dob || !stateId || !lgaId) {
      setError("Please complete your details first.");
      setStep(1);
      return;
    }

    setPending(true);
    try {
      await submitOnboarding({
        date_of_birth: dob,
        gender,
        home_state_id: stateId,
        home_lga_id: lgaId,
      });
      await saveCustomerPreferences({
        primary_need: projectType || null,
        category_interests: categoryId ? [categoryId] : [],
      });
      await refreshUser();
      setStep(3);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Could not save onboarding. Please try again.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <PageShell title="Customer onboarding">
      <div className="mx-auto max-w-xl ui-card p-6 sm:p-8">
        <div className="mb-6 flex gap-2">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className={`h-1.5 flex-1 rounded-full ${
                item <= step ? "bg-black" : "bg-border"
              }`}
            />
          ))}
        </div>

        {error ? (
          <p className="mb-4 text-base font-semibold text-danger">{error}</p>
        ) : null}

        {step === 1 ? (
          <div className="space-y-4">
            <h2 className="text-2xl text-black">About yourself</h2>
            <Input
              label="Date of birth"
              name="dob"
              type="date"
              required
              value={dob}
              onChange={(e) => setDob(e.target.value)}
            />
            <Select
              label="Gender"
              name="gender"
              required
              value={gender}
              onChange={(e) =>
                setGender(
                  e.target.value as "male" | "female" | "prefer_not_to_say",
                )
              }
              options={[
                { label: "Male", value: "male" },
                { label: "Female", value: "female" },
                { label: "Prefer not to say", value: "prefer_not_to_say" },
              ]}
            />
            <Select
              label="State"
              name="state"
              required
              placeholder="Select state"
              value={stateId}
              onChange={(e) => setStateId(e.target.value)}
              options={states.map((s) => ({ label: s.name, value: s.id }))}
            />
            <Select
              label="LGA"
              name="lga"
              required
              placeholder={stateId ? "Select LGA" : "Select state first"}
              disabled={!stateId}
              value={lgaId}
              onChange={(e) => setLgaId(e.target.value)}
              options={lgas.map((l) => ({ label: l.name, value: l.id }))}
            />
            <Button
              className="w-full"
              onClick={() => {
                if (!dob || !stateId || !lgaId) {
                  setError("Please fill all required fields.");
                  return;
                }
                setError("");
                setStep(2);
              }}
            >
              Continue
            </Button>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="space-y-4">
            <h2 className="text-2xl text-black">What are you looking for?</h2>
            <Select
              label="Primary category interest"
              name="interest"
              options={categories.map((c) => ({
                label: c.name,
                value: c.id,
              }))}
              placeholder="Select category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
            />
            <Input
              label="Typical project type"
              name="projectType"
              placeholder="Repairs, installs, maintenance..."
              value={projectType}
              onChange={(e) => setProjectType(e.target.value)}
            />
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setStep(1)}
              >
                Back
              </Button>
              <Button
                className="flex-1"
                disabled={pending}
                onClick={() => void finishOnboarding()}
              >
                {pending ? "Saving…" : "Continue"}
              </Button>
            </div>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="space-y-4 text-center">
            <h2 className="text-2xl text-black">Welcome</h2>
            <p className="text-sm text-muted">
              You&apos;re set. Head into your customer dashboard to request
              services and track tickets.
            </p>
            <Button
              className="w-full"
              onClick={() => router.push("/dashboard/customer")}
            >
              Go to dashboard
            </Button>
          </div>
        ) : null}

        {!isAuthenticated ? (
          <p className="mt-6 text-center text-sm text-muted">
            <Link href="/login?next=/onboarding/customer" className="underline">
              Login
            </Link>{" "}
            to save onboarding progress.
          </p>
        ) : null}
      </div>
    </PageShell>
  );
}
