"use client";

import { detectUserLocale } from "@/lib/locale";

export type AnalyticsEventParams = Record<string, string | number | boolean | null | undefined>;

declare global {
  interface Window {
    gtag?: (command: string, action: string, params?: Record<string, unknown>) => void;
    dataLayer?: unknown[];
  }
}

/**
 * Track custom events with automatic locale parameters (e.g., locale: "ng-en").
 */
export function trackEvent(eventName: string, params: AnalyticsEventParams = {}): void {
  if (typeof window === "undefined") return;

  const currentLocale = detectUserLocale();
  const payload = {
    ...params,
    locale: currentLocale,
    timestamp: new Date().toISOString(),
  };

  // Google Analytics (GA4) integration if present
  if (typeof window.gtag === "function") {
    window.gtag("event", eventName, payload);
  }

  // Developer console logger during local dev
  if (process.env.NODE_ENV === "development") {
    console.log(`[Analytics Track] ${eventName}:`, payload);
  }
}

/**
 * Track page views with current route and country locale context.
 */
export function trackPageView(pageName: string): void {
  trackEvent("page_view", { page_title: pageName, page_location: typeof window !== "undefined" ? window.location.href : "" });
}
