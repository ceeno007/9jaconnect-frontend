import type { Metadata, Viewport } from "next";
import { Inter, Source_Serif_4 } from "next/font/google";
import { CookieBanner } from "@/components/layout/cookie-banner";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { AuthProvider } from "@/components/providers/auth-provider";
import { MotionProvider } from "@/components/providers/motion-provider";
import { ToastProvider } from "@/components/ui/toast";
import "./globals.css";

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const sourceSerif = Source_Serif_4({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "9jaconnect - Hire trusted Nigerian professionals",
    template: "%s · 9jaconnect",
  },
  description:
    "Find verified sole-trader professionals across Nigeria. Search by state, LGA, and category, then hire with confidence.",
  keywords: [
    "Nigerian professionals",
    "handyman Nigeria",
    "electrician Lagos",
    "plumber Abuja",
    "hire tradespeople Nigeria",
    "9jaconnect",
  ],
  openGraph: {
    title: "9jaconnect - Hire trusted Nigerian professionals",
    description:
      "Find verified sole-trader professionals across Nigeria. Search by state, LGA, and category.",
    url: "https://9jaconnect.vercel.app",
    siteName: "9jaconnect",
    locale: "en_NG",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "9jaconnect - Hire trusted Nigerian professionals",
    description: "Find verified sole-trader professionals across Nigeria.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${sourceSerif.variable} h-full`}
    >
      <body
        className="flex min-h-full flex-col antialiased"
        suppressHydrationWarning
      >
        <MotionProvider>
          <AuthProvider>
            <ToastProvider>
              <Navbar />
              <main className="flex-1">{children}</main>
              <Footer />
              <CookieBanner />
            </ToastProvider>
          </AuthProvider>
        </MotionProvider>
      </body>
    </html>
  );
}
