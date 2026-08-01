"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Cookie, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const CONSENT_KEY = "9jaconnect.cookie_consent";

export function CookieBanner() {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem(CONSENT_KEY);
    if (!stored) {
      // Delay slightly for smooth entrance after initial page paint
      const timer = setTimeout(() => setVisible(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = (type: "all" | "essential") => {
    localStorage.setItem(CONSENT_KEY, type);
    setVisible(false);
  };

  if (!mounted || !visible) return null;

  return (
    <div
      role="region"
      aria-label="Cookie consent banner"
      className="fixed bottom-4 right-4 z-[9999] max-w-[420px] w-[calc(100vw-2rem)] rounded-2xl bg-white p-5 shadow-2xl border border-neutral-200 transition-all duration-300 animate-in fade-in slide-in-from-bottom-5"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5 text-neutral-900">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-lime-100 text-lime-700">
            <Cookie className="h-5 w-5" />
          </div>
          <h3 className="text-[16px] font-bold tracking-tight">Cookie Preferences</h3>
        </div>
        <button
          type="button"
          onClick={() => handleAccept("essential")}
          className="rounded-lg p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 transition-colors"
          aria-label="Close cookie banner"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <p className="text-[13px] font-normal leading-relaxed text-neutral-600 mb-4">
        We use essential cookies and analytics to ensure smooth performance, secure authentication, and personalized service in compliance with NDPA and GDPR rules. Learn more in our{" "}
        <Link href="/privacy" className="font-semibold text-neutral-900 underline hover:text-lime-700">
          Privacy Policy
        </Link>.
      </p>

      <div className="flex flex-wrap items-center justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => handleAccept("essential")}
          className="rounded-lg text-[13px] font-medium border-neutral-200 hover:bg-neutral-50 px-3.5 py-2 h-auto"
        >
          Essential Only
        </Button>
        <Button
          type="button"
          size="sm"
          onClick={() => handleAccept("all")}
          className="rounded-lg bg-[#84cc16] hover:bg-[#65a30d] text-white font-bold text-[13px] px-4 py-2 h-auto shadow-xs"
        >
          Accept All
        </Button>
      </div>
    </div>
  );
}
