import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PageShell } from "@/components/ui/primitives";
import { CATEGORIES } from "@/lib/constants";

export default function AdminCategoriesPage() {
  return (
    <PageShell
      title="Manage categories"
      description="Add New Category form (name, slug, icon, short description) and existing category list."
    >
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="ui-card p-6">
          <h2 className="text-2xl text-black">
            Add new category
          </h2>
          <form className="mt-4 space-y-4">
            <Input label="Name" name="name" required />
            <Input label="Slug" name="slug" required />
            <Input label="Icon" name="icon" placeholder="Icon key or URL" />
            <Textarea label="Short description" name="description" />
            <Button type="submit">Create category</Button>
          </form>
        </section>

        <section className="ui-card p-6">
          <h2 className="text-2xl text-black">
            Existing categories
          </h2>
          <ul className="mt-4 space-y-3">
            {CATEGORIES.map((category) => (
              <li
                key={category.slug}
                className="flex items-start justify-between gap-3 rounded-[var(--radius-md)] bg-background px-4 py-3"
              >
                <div>
                  <p className="font-medium">{category.name}</p>
                  <p className="text-sm text-muted">{category.description}</p>
                  <p className="mt-1 text-xs text-muted">{category.slug}</p>
                </div>
                <Button size="sm" variant="outline">
                  Edit
                </Button>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </PageShell>
  );
}
