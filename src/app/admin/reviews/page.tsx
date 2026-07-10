import { EmptyState, PageShell } from "@/components/ui/primitives";

export default function AdminReviewsPage() {
  return (
    <PageShell
      title="Review moderation"
      description="Review list with detail view. Flag or remove reviews that violate platform rules."
    >
      <EmptyState
        title="Review moderation not connected"
        description="This screen will load from the admin reviews API once it is available on production."
      />
    </PageShell>
  );
}
