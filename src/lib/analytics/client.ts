"use client";

type AnalyticsValue = string | number | boolean | undefined;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export function trackEvent(
  name: string,
  parameters: Record<string, AnalyticsValue> = {},
) {
  if (typeof window === "undefined" || !window.gtag) {
    return;
  }

  window.gtag("event", name, parameters);
}
