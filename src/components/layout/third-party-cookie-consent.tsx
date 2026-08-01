"use client";

import { useEffect } from "react";
import Script from "next/script";

declare global {
  interface Window {
    CookieConsent?: {
      run: (config: Record<string, unknown>) => void;
    };
  }
}

export function ThirdPartyCookieConsent() {
  const initConsent = () => {
    if (typeof window !== "undefined" && window.CookieConsent) {
      try {
        window.CookieConsent.run({
          guiOptions: {
            consentModal: {
              layout: "box bottom right",
              position: "bottom right",
              transition: "slide",
            },
          },
          categories: {
            necessary: {
              enabled: true,
              readOnly: true,
            },
            analytics: {},
          },
          language: {
            default: "en",
            translations: {
              en: {
                consentModal: {
                  title: "Cookie Consent",
                  description:
                    "We use essential cookies and analytics to ensure optimal performance, secure authentication, and personalized service in compliance with NDPA and GDPR rules.",
                  acceptAllBtn: "Accept all",
                  acceptNecessaryBtn: "Reject optional",
                },
                preferencesModal: {
                  title: "Cookie Preferences",
                  acceptAllBtn: "Accept all",
                  acceptNecessaryBtn: "Reject all",
                  savePreferencesBtn: "Save preferences",
                  closeIconLabel: "Close modal",
                  sections: [
                    {
                      title: "Strictly Necessary Cookies",
                      description:
                        "These cookies are essential for the proper functioning of 9jaconnect, secure authentication, and account access.",
                    },
                    {
                      title: "Performance & Analytics",
                      description:
                        "These cookies help us analyze site traffic and improve platform performance.",
                    },
                  ],
                },
              },
            },
          },
        });
      } catch {
        // Prevent duplicate initialization
      }
    }
  };

  useEffect(() => {
    initConsent();
  }, []);

  return (
    <>
      {/* Vanilla Cookie Consent official stylesheet */}
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/vanilla-cookieconsent@3.0.1/dist/cookieconsent.css"
      />
      <Script
        id="cookie-consent-script"
        src="https://cdn.jsdelivr.net/npm/vanilla-cookieconsent@3.0.1/dist/cookieconsent.umd.js"
        strategy="afterInteractive"
        onLoad={initConsent}
      />
    </>
  );
}
