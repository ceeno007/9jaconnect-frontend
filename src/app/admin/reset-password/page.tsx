import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageShell } from "@/components/ui/primitives";

export default function AdminResetPasswordPage() {
  return (
    <PageShell
      title="Admin reset password"
      description="Separate route used for admin resets. New password + Confirm new password."
    >
      <div className="mx-auto max-w-md ui-card p-6 sm:p-8">
        <form className="space-y-4">
          <Input
            label="New password"
            name="password"
            type="password"
            required
          />
          <Input
            label="Confirm new password"
            name="confirmPassword"
            type="password"
            required
          />
          <Button type="submit" className="w-full" size="lg">
            Update admin password
          </Button>
        </form>
      </div>
    </PageShell>
  );
}
