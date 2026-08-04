import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="page-x mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center py-20 text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-black">
        404
      </p>
      <h1 className="mt-3 text-4xl text-black">
        Page not found
      </h1>
      <p className="mt-3 text-muted">
        That route isn&apos;t available. Head back home and continue from there.
      </p>
      <Link href="/" className="mt-8">
        <Button size="lg">Back to home</Button>
      </Link>
    </div>
  );
}
