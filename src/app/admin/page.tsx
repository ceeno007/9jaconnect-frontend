import { notFound } from "next/navigation";

export default function AdminIndexPage() {
  // Authenticated users are redirected by the admin gate; others 404.
  notFound();
}
