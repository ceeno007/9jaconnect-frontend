import { EmptyState, PageShell } from "@/components/ui/primitives";

export default function AdminUsersPage() {
  return (
    <PageShell
      title="Manage users"
      description="Searchable user table with detail view. View or deactivate accounts."
    >
      <EmptyState
        title="User management not connected"
        description="This screen will load from the admin users API once it is available on production."
      />
    </PageShell>
  );
}
