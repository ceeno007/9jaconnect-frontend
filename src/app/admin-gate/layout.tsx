import type { Metadata } from "next";
import { AdminAuthProvider } from "@/components/providers/admin-auth-provider";

export const metadata: Metadata = {
  title: "Sign in",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
};

export default function AdminGateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminAuthProvider>{children}</AdminAuthProvider>;
}
