import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { AuthProvider } from "@/components/providers/auth-provider";
import { MotionProvider } from "@/components/providers/motion-provider";
import { ToastProvider } from "@/components/ui/toast";
import "./globals.css";

const roboto = Roboto({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "9jaconnect - Hire trusted Nigerian professionals",
    template: "%s · 9jaconnect",
  },
  description:
    "Find verified sole-trader professionals across Nigeria. Search by state, LGA, and category, then hire with confidence.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${roboto.variable} h-full`}>
      <body className="flex min-h-full flex-col antialiased">
        <MotionProvider>
          <AuthProvider>
            <ToastProvider>
              <Navbar />
              <main className="flex-1">{children}</main>
              <Footer />
            </ToastProvider>
          </AuthProvider>
        </MotionProvider>
      </body>
    </html>
  );
}
