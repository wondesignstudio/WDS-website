import { readFileSync } from "node:fs";

import { afterEach, describe, expect, it, vi } from "vitest";

import { trackEvent } from "@/lib/analytics/client";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("trackEvent", () => {
  it("브라우저나 gtag가 없어도 외부 호출 없이 종료한다", () => {
    vi.stubGlobal("window", undefined);

    expect(() => trackEvent("contact_start")).not.toThrow();
  });

  it("전환 이벤트에 명시적으로 주어진 매개변수만 전달한다", () => {
    const gtag = vi.fn();
    vi.stubGlobal("window", { gtag });

    trackEvent("contact_submit_success");

    expect(gtag).toHaveBeenCalledOnce();
    expect(gtag).toHaveBeenCalledWith(
      "event",
      "contact_submit_success",
      {},
    );
  });
});

describe("문의 전환 분석의 PII 분리 계약", () => {
  it("문의 폼의 GA 호출은 이벤트명만 보내고 폼 필드를 매개변수로 보내지 않는다", () => {
    const source = readFileSync(
      new URL("../src/components/contact/contact-form.tsx", import.meta.url),
      "utf8",
    );
    const calls = [
      ...source.matchAll(
        /trackEvent\(\s*["']([^"']+)["']\s*(?:,\s*([\s\S]*?))?\)/g,
      ),
    ].map((match) => ({
      name: match[1],
      parameters: match[2]?.trim(),
    }));

    expect(calls).toEqual([
      { name: "contact_start", parameters: undefined },
      { name: "contact_submit_success", parameters: undefined },
    ]);
  });
});
