"use client";

import { useEffect } from "react";
import Script from "next/script";

declare global {
  interface Window {
    cookieconsent?: {
      run: (config: Record<string, unknown>) => void;
    };
  }
}

export function ThirdPartyCookieConsent() {
  const initConsent = () => {
    if (typeof window !== "undefined" && window.cookieconsent) {
      try {
        window.cookieconsent.run({
          notice_banner_type: "headline",
          consent_type: "express",
          palette: "light",
          change_preferences_selector: "#changePreferences",
          language: "en",
          website_name: "9jaconnect",
          cookies_policy_url: "https://9jaconnect.vercel.app/privacy",
        });
      } catch {
        // Prevent duplicate initialization errors
      }
    }
  };

  useEffect(() => {
    initConsent();
  }, []);

  return (
    <Script
      id="cookie-consent-script"
      src="https://www.cookieconsent.com/releases/4.0.0/cookieconsent.min.js"
      strategy="afterInteractive"
      onLoad={initConsent}
    />
  );
}
