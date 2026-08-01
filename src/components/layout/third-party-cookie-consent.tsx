"use client";

import Script from "next/script";

declare global {
  interface Window {
    cookieconsent?: {
      run: (config: Record<string, unknown>) => void;
    };
  }
}

export function ThirdPartyCookieConsent() {
  return (
    <Script
      id="cookie-consent-script"
      src="//www.cookieconsent.com/releases/4.0.0/cookieconsent.min.js"
      strategy="afterInteractive"
      onLoad={() => {
        if (typeof window !== "undefined" && window.cookieconsent) {
          window.cookieconsent.run({
            notice_banner_type: "headline",
            consent_type: "express",
            palette: "light",
            change_preferences_selector: "#changePreferences",
            language: "en",
            website_name: "9jaconnect",
            cookies_policy_url: "https://9jaconnect.vercel.app/privacy",
          });
        }
      }}
    />
  );
}
