"use client";

import { FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/toast";
import { listCategories } from "@/lib/api";
import {
  createAdminCategory,
  createAdminSubcategory,
  deleteAdminCategory,
} from "@/lib/api/admin-client";
import type { Category } from "@/lib/api/types";
import { ApiError } from "@/lib/api/types";

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function AdminCategoriesPage() {
  const toast = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function refresh() {
    setLoading(true);
    setError("");
    try {
      setCategories(await listCategories());
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Could not load categories.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  async function onCreateCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") || "").trim();
    const slug = String(form.get("slug") || slugify(name)).trim();
    const displayOrder = Number(form.get("display_order") || 0);
    try {
      await createAdminCategory({
        name,
        slug,
        display_order: displayOrder,
        icon_key: String(form.get("icon_key") || "") || null,
        is_active: true,
      });
      toast.success("Category created");
      event.currentTarget.reset();
      await refresh();
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : "Could not create category.",
      );
    } finally {
      setPending(false);
    }
  }

  async function onCreateSubcategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    const form = new FormData(event.currentTarget);
    const categoryId = String(form.get("category_id") || "");
    const name = String(form.get("name") || "").trim();
    try {
      await createAdminSubcategory(categoryId, {
        name,
        slug: String(form.get("slug") || slugify(name)).trim(),
        display_order: Number(form.get("display_order") || 0),
        risk_level:
          String(form.get("risk_level") || "standard") === "sensitive"
            ? "sensitive"
            : "standard",
        trust_badge_eligible: form.get("trust_badge_eligible") === "on",
        is_active: true,
      });
      toast.success("Subcategory created");
      event.currentTarget.reset();
      await refresh();
    } catch (err) {
      toast.error(
        err instanceof ApiError
          ? err.message
          : "Could not create subcategory.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-black">Manage categories</h1>
        <p className="mt-2 text-base font-medium text-muted">
          Create categories and subcategories for the marketplace directory.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="ui-card p-6">
          <h2 className="text-xl font-bold text-black">Add category</h2>
          <form className="mt-4 space-y-4" onSubmit={onCreateCategory}>
            <Input label="Name" name="name" required />
            <Input label="Slug" name="slug" placeholder="auto from name" />
            <Input
              label="Display order"
              name="display_order"
              type="number"
              defaultValue={0}
              required
            />
            <Input label="Icon key" name="icon_key" />
            <Button type="submit" disabled={pending}>
              Create category
            </Button>
          </form>
        </section>

        <section className="ui-card p-6">
          <h2 className="text-xl font-bold text-black">Add subcategory</h2>
          <form className="mt-4 space-y-4" onSubmit={onCreateSubcategory}>
            <label className="block text-sm font-bold text-black">
              Category
              <select
                name="category_id"
                required
                className="field-surface mt-2 block w-full rounded-[12px] px-4 py-3 text-base font-semibold"
              >
                <option value="">Select category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>
            <Input label="Name" name="name" required />
            <Input label="Slug" name="slug" placeholder="auto from name" />
            <Input
              label="Display order"
              name="display_order"
              type="number"
              defaultValue={0}
              required
            />
            <label className="block text-sm font-bold text-black">
              Risk level
              <select
                name="risk_level"
                className="field-surface mt-2 block w-full rounded-[12px] px-4 py-3 text-base font-semibold"
                defaultValue="standard"
              >
                <option value="standard">standard</option>
                <option value="sensitive">sensitive</option>
              </select>
            </label>
            <label className="flex items-center gap-2 text-sm font-bold text-black">
              <input type="checkbox" name="trust_badge_eligible" />
              Trust badge eligible
            </label>
            <Button type="submit" disabled={pending}>
              Create subcategory
            </Button>
          </form>
        </section>
      </div>

      <section className="ui-card p-6">
        <h2 className="text-xl font-bold text-black">Existing categories</h2>
        {loading ? (
          <p className="mt-4 text-sm font-medium text-muted">Loading…</p>
        ) : error ? (
          <div className="mt-4">
            <EmptyState title="Could not load categories" description={error}>
              <Button onClick={() => void refresh()}>Retry</Button>
            </EmptyState>
          </div>
        ) : categories.length === 0 ? (
          <p className="mt-4 text-sm font-medium text-muted">No categories yet.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {categories.map((category) => (
              <li
                key={category.id}
                className="flex flex-wrap items-center justify-between gap-3 border-b border-[#eee] py-3"
              >
                <div>
                  <p className="font-bold text-black">{category.name}</p>
                  <p className="text-sm text-muted">{category.slug}</p>
                </div>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => {
                    if (!window.confirm(`Delete ${category.name}?`)) return;
                    void deleteAdminCategory(category.id)
                      .then(async () => {
                        toast.success("Category deleted");
                        await refresh();
                      })
                      .catch((err) =>
                        toast.error(
                          err instanceof ApiError
                            ? err.message
                            : "Could not delete category.",
                        ),
                      );
                  }}
                >
                  Delete
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
