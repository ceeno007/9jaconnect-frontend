import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState, PageShell } from "@/components/ui/primitives";

export default function AdminProfessionalsPage() {
  return (
    <PageShell
      title="Manage professionals"
      description="Filterable/searchable table. Approve / reject (with reason) / suspend listings."
    >
      <div className="mb-4 max-w-sm">
        <Input label="Search professionals" placeholder="Name, trade, category..." />
      </div>
      <div className="overflow-hidden ui-card">
        <EmptyState
          title="No professionals loaded"
          description="Connect this admin table to the live professionals API. Mock listings were removed."
        >
          <Button size="sm" disabled>
            Approve
          </Button>
        </EmptyState>
      </div>
    </PageShell>
  );
}
