import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { PageShell } from "@/components/ui/primitives";

export default function AdminCommunicationsPage() {
  return (
    <PageShell
      title="Communications"
      description="Platform communications tools/sections. Treat as locked pending admin confirmation on exact actions."
    >
      <div className="mx-auto max-w-2xl space-y-4 ui-card p-6">
        <h2 className="text-2xl text-black">
          Compose platform message
        </h2>
        <Textarea
          label="Message"
          name="message"
          placeholder="Email or messaging oriented communication..."
        />
        <Button>Send communication</Button>
      </div>
    </PageShell>
  );
}
