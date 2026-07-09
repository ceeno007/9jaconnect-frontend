import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageShell } from "@/components/ui/primitives";
import { MOCK_PROFESSIONALS } from "@/lib/constants";

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
        <table className="w-full text-left text-sm">
          <thead className="bg-neutral-50 text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Professional</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Location</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_PROFESSIONALS.map((pro) => (
              <tr key={pro.id} className="last:border-0">
                <td className="px-4 py-4">
                  <p className="font-medium text-foreground">{pro.tradeName}</p>
                  <p className="text-muted">{pro.name}</p>
                </td>
                <td className="px-4 py-4">{pro.category}</td>
                <td className="px-4 py-4">
                  {pro.state}, {pro.lga}
                </td>
                <td className="px-4 py-4">
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm">Approve</Button>
                    <Button size="sm" variant="outline">
                      Reject
                    </Button>
                    <Button size="sm" variant="danger">
                      Suspend
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
