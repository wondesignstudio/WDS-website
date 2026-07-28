import { readFileSync } from "node:fs";

import { afterEach, describe, expect, it, vi } from "vitest";

import {
  ANALYTICS_CONSENT_EVENT,
  ANALYTICS_CONSENT_KEY,
  resetAnalyticsConsent,
  sendPageView,
} from "@/components/analytics/analytics-consent";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("AnalyticsConsent page_view 준비 상태", () => {
  it("gtag 초기화 전에는 page_view를 보내지 않는다", () => {
    vi.stubGlobal("window", {
      location: { href: "https://wondesign.studio/" },
    });

    expect(sendPageView("/")).toBe(false);
  });

  it("gtag 초기화 후 현재 경로의 page_view를 정확히 한 번 보낸다", () => {
    const gtag = vi.fn();
    vi.stubGlobal("window", {
      gtag,
      location: { href: "https://wondesign.studio/services" },
    });

    expect(sendPageView("/services")).toBe(true);
    expect(gtag).toHaveBeenCalledOnce();
    expect(gtag).toHaveBeenCalledWith("event", "page_view", {
      page_path: "/services",
      page_location: "https://wondesign.studio/services",
    });
  });

  it("인라인 GA 초기화 완료 신호 뒤에만 page_view effect를 활성화한다", () => {
    const source = readFileSync(
      new URL(
        "../src/components/analytics/analytics-consent.tsx",
        import.meta.url,
      ),
      "utf8",
    );

    expect(source).toContain("onReady={handleAnalyticsReady}");
    expect(source).toContain('consent === "granted" && analyticsReady');
  });
});

describe("AnalyticsConsent 선택 변경", () => {
  it("저장된 분석 선택을 지우고 변경 이벤트를 알린다", () => {
    const removeItem = vi.fn();
    const dispatchEvent = vi.fn();
    vi.stubGlobal("window", {
      localStorage: { removeItem },
      dispatchEvent,
    });

    resetAnalyticsConsent();

    expect(removeItem).toHaveBeenCalledWith(ANALYTICS_CONSENT_KEY);
    expect(dispatchEvent).toHaveBeenCalledOnce();
    expect(dispatchEvent.mock.calls[0]?.[0]).toBeInstanceOf(Event);
    expect(dispatchEvent.mock.calls[0]?.[0].type).toBe(ANALYTICS_CONSENT_EVENT);
  });
});
