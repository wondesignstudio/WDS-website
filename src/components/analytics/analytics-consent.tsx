"use client";

import Link from "next/link";
import Script from "next/script";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState, useSyncExternalStore } from "react";

import { trackEvent } from "@/lib/analytics/client";

import styles from "./analytics-consent.module.css";

export const ANALYTICS_CONSENT_KEY = "wds-analytics-consent:2026-07-14";

type Consent = "granted" | "denied" | null;

export const ANALYTICS_CONSENT_EVENT = "wds-analytics-consent";

export function resetAnalyticsConsent() {
  window.localStorage.removeItem(ANALYTICS_CONSENT_KEY);
  window.dispatchEvent(new Event(ANALYTICS_CONSENT_EVENT));
}

function readConsent(): Consent {
  const saved = window.localStorage.getItem(ANALYTICS_CONSENT_KEY);
  return saved === "granted" || saved === "denied" ? saved : null;
}

function subscribeToConsent(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(ANALYTICS_CONSENT_EVENT, onStoreChange);

  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(ANALYTICS_CONSENT_EVENT, onStoreChange);
  };
}

function useHydrated() {
  return useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );
}

export function sendPageView(pathname: string) {
  if (typeof window === "undefined" || !window.gtag) {
    return false;
  }

  window.gtag("event", "page_view", {
    page_path: pathname,
    page_location: window.location.href,
  });
  return true;
}

export function AnalyticsConsent() {
  const measurementId = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID;
  const pathname = usePathname();
  const consent = useSyncExternalStore(subscribeToConsent, readConsent, () => null);
  const isReady = useHydrated();
  const [analyticsReady, setAnalyticsReady] = useState(false);

  const handleAnalyticsReady = useCallback(() => {
    setAnalyticsReady(true);
  }, []);

  useEffect(() => {
    if (consent !== "granted") {
      return;
    }

    const handleClick = (event: MouseEvent) => {
      if (!(event.target instanceof Element)) {
        return;
      }

      const target = event.target.closest<HTMLElement>("[data-analytics-event]");
      const eventName = target?.dataset.analyticsEvent;
      if (eventName) {
        trackEvent(eventName, { path: pathname });
      }
    };

    document.addEventListener("click", handleClick, { passive: true });
    return () => document.removeEventListener("click", handleClick);
  }, [consent, pathname]);

  useEffect(() => {
    if (consent === "granted" && analyticsReady) {
      sendPageView(pathname);
    }
  }, [analyticsReady, consent, pathname]);

  if (!measurementId || pathname.startsWith("/admin")) {
    return null;
  }

  const choose = (value: Exclude<Consent, null>) => {
    window.localStorage.setItem(ANALYTICS_CONSENT_KEY, value);
    window.dispatchEvent(new Event(ANALYTICS_CONSENT_EVENT));
  };

  return (
    <>
      {consent === "granted" ? (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
            strategy="afterInteractive"
          />
          <Script
            id="wds-ga4"
            strategy="afterInteractive"
            onReady={handleAnalyticsReady}
          >
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;gtag('js',new Date());gtag('config','${measurementId}',{send_page_view:false,anonymize_ip:true});`}
          </Script>
        </>
      ) : null}

      {isReady && consent === null ? (
        <aside className={styles.banner} aria-label="선택 분석 안내">
          <p>
            사이트 개선을 위한 최소한의 방문·전환 분석을 선택적으로 사용합니다. 개인 문의
            내용은 분석 도구로 보내지 않습니다. <Link href="/privacy">자세히 보기</Link>
          </p>
          <div className={styles.actions}>
            <button type="button" onClick={() => choose("denied")}>
              필수 기능만
            </button>
            <button type="button" className={styles.accept} onClick={() => choose("granted")}>
              선택 분석 허용
            </button>
          </div>
        </aside>
      ) : null}
    </>
  );
}
