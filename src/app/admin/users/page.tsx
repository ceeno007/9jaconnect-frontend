import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageShell } from "@/components/ui/primitives";

const users = [
  { id: "u1", name: "Ada Okafor", email: "ada@email.com", role: "Customer" },
  {
    id: "u2",
    name: "Chinedu Okeke",
    email: "chinedu@email.com",
    role: "Professional",
  },
  { id: "u3", name: "Admin User", email: "admin@9jaconnect.com", role: "Admin" },
];

export default function AdminUsersPage() {
  return (
    <PageShell
      title="Manage users"
      description="Searchable user table with detail view. View / deactivate accounts."
    >
      <div className="mb-4 max-w-sm">
        <Input label="Search users" placeholder="Name or email..." />
      </div>
      <div className="overflow-hidden ui-card">
        <table className="w-full text-left text-sm">
          <thead className="bg-neutral-50 text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">User</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="last:border-0">
                <td className="px-4 py-4">
                  <p className="font-medium">{user.name}</p>
                  <p className="text-muted">{user.email}</p>
                </td>
                <td className="px-4 py-4">{user.role}</td>
                <td className="px-4 py-4">
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      View
                    </Button>
                    <Button size="sm" variant="danger">
                      Deactivate
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageShell>
  );
}
