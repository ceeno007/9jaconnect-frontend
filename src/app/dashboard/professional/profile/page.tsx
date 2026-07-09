"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState, PageShell } from "@/components/ui/primitives";
import { FormSkeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/components/providers/auth-provider";
import {
  listCategories,
  listLgas,
  listStates,
  listSubcategories,
} from "@/lib/api";
import {
  getMyProfessional,
  updateProfessional,
} from "@/lib/api/auth-client";
import { nairaToKobo } from "@/lib/api/mappers";
import type { Category, Lga, State, Subcategory } from "@/lib/api/types";
import { ApiError } from "@/lib/api/types";

export default function ProfessionalProfileEditPage() {
  const { isAuthenticated, loading: authLoading, user } = useAuth();
  const [professionalId, setProfessionalId] = useState(
    user?.professional_id || "",
  );
  const [states, setStates] = useState<State[]>([]);
  const [lgas, setLgas] = useState<Lga[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [stateId, setStateId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [lgaId, setLgaId] = useState("");
  const [subcategoryId, setSubcategoryId] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [years, setYears] = useState("0");
  const [hourly, setHourly] = useState("");
  const [daily, setDaily] = useState("");
  const [monthly, setMonthly] = useState("");
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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

  useEffect(() => {
    if (authLoading || !isAuthenticated) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    void getMyProfessional()
      .then((pro) => {
        if (cancelled) return;
        setProfessionalId(pro.id);
        setBusinessName(pro.business_name || "");
        setDescription(pro.service_description || "");
        setAddress(
          ("business_address" in pro &&
            String(pro.business_address || "")) ||
            "",
        );
        setYears(String(pro.years_of_experience ?? 0));
        setStateId(pro.state_id || "");
        setLgaId(pro.lga_id || "");
        setCategoryId(pro.category_id || "");
        setSubcategoryId(pro.subcategory_id || "");
        setHourly(
          pro.hourly_rate_kobo != null
            ? String(Math.round(pro.hourly_rate_kobo / 100))
            : "",
        );
        setDaily(
          pro.daily_rate_kobo != null
            ? String(Math.round(pro.daily_rate_kobo / 100))
            : "",
        );
        setMonthly(
          pro.monthly_rate_kobo != null
            ? String(Math.round(pro.monthly_rate_kobo / 100))
            : "",
        );
      })
      .catch(() => {
        if (!cancelled) setError("Could not load professional profile.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [authLoading, isAuthenticated]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!professionalId) return;
    setError("");
    setSuccess("");
    setPending(true);
    try {
      await updateProfessional(professionalId, {
        business_name: businessName,
        service_description: description,
        business_address: address || null,
        years_of_experience: Number(years) || 0,
        state_id: stateId,
        lga_id: lgaId,
        category_id: categoryId,
        subcategory_id: subcategoryId,
        hourly_rate_kobo: hourly ? nairaToKobo(Number(hourly)) : null,
        daily_rate_kobo: daily ? nairaToKobo(Number(daily)) : null,
        monthly_rate_kobo: monthly ? nairaToKobo(Number(monthly)) : null,
      });
      setSuccess("Profile saved.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not save profile.");
    } finally {
      setPending(false);
    }
  }

  if (!authLoading && !isAuthenticated) {
    return (
      <PageShell title="Edit public profile">
        <EmptyState
          title="Sign in required"
          description="Log in as a professional to edit your public profile."
        />
        <div className="mt-4">
          <Link href="/login?next=/dashboard/professional/profile">
            <Button>Login</Button>
          </Link>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell title="Edit public profile">
      {loading ? (
        <FormSkeleton />
      ) : (
        <form className="mx-auto max-w-2xl space-y-6" onSubmit={onSubmit}>
          {error ? (
            <p className="text-base font-semibold text-danger">{error}</p>
          ) : null}
          {success ? (
            <p className="text-base font-semibold text-black">{success}</p>
          ) : null}

          <section className="ui-card p-6">
            <h2 className="text-2xl text-black">Basic information</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Input
                  label="Trade name"
                  name="tradeName"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  required
                />
              </div>
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
                placeholder="Select subcategory"
                value={subcategoryId}
                onChange={(e) => setSubcategoryId(e.target.value)}
                options={subcategories.map((s) => ({
                  label: s.name,
                  value: s.id,
                }))}
              />
            </div>
          </section>

          <section className="ui-card p-6">
            <h2 className="text-2xl text-black">Service description</h2>
            <Textarea
              className="mt-4"
              label="First-person description"
              name="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
            <div className="mt-4">
              <Input
                label="Years of experience"
                name="years"
                type="number"
                min={0}
                value={years}
                onChange={(e) => setYears(e.target.value)}
                required
              />
            </div>
          </section>

          <section className="ui-card p-6">
            <h2 className="text-2xl text-black">Your rates</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <Input
                label="Hourly (₦)"
                name="hourlyRate"
                type="number"
                value={hourly}
                onChange={(e) => setHourly(e.target.value)}
              />
              <Input
                label="Day rate (₦)"
                name="dayRate"
                type="number"
                value={daily}
                onChange={(e) => setDaily(e.target.value)}
              />
              <Input
                label="Monthly (₦)"
                name="projectRate"
                type="number"
                value={monthly}
                onChange={(e) => setMonthly(e.target.value)}
              />
            </div>
          </section>

          <section className="ui-card p-6">
            <h2 className="text-2xl text-black">Location</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
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
                placeholder="Select LGA"
                value={lgaId}
                onChange={(e) => setLgaId(e.target.value)}
                options={lgas.map((l) => ({ label: l.name, value: l.id }))}
              />
              <div className="sm:col-span-2">
                <Input
                  label="Address"
                  name="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
            </div>
          </section>

          <Button type="submit" size="lg" disabled={pending}>
            {pending ? "Saving…" : "Save profile"}
          </Button>
        </form>
      )}
    </PageShell>
  );
}
