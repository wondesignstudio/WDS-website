import { describe, expect, it } from "vitest";

import type { StoredInquiryForEmail } from "@/lib/contact/types";
import {
  renderConfirmation,
  renderInternalNotification,
} from "@/lib/email/templates";
import { CONTACT_PRIVACY_POLICY_VERSION } from "@/lib/contact/schema";

function storedInquiry(
  overrides: Partial<StoredInquiryForEmail> = {},
): StoredInquiryForEmail {
  return {
    id: 1,
    publicId: "f3196463-d58d-49ea-af8f-a0923f2cb350",
    createdAt: "2026-07-13T00:00:00.000Z",
    companyName: "Won Design Studio",
    contactName: "홍길동",
    email: "hello@example.com",
    phone: "010-1234-5678",
    projectType: "corporate_website",
    projectBackground: "기업 웹사이트 리뉴얼",
    budgetRange: "20m_50m",
    expectedScope: "기획부터 개발까지",
    desiredSchedule: "2026년 9월 시작",
    referenceLinks: ["https://example.com/reference"],
    privacyConsent: true,
    privacyConsentAt: "2026-07-13T00:00:00.000Z",
    privacyPolicyVersion: CONTACT_PRIVACY_POLICY_VERSION,
    website: "",
    ...overrides,
  };
}

describe("email templates", () => {
  it("내부 알림에는 개인정보 원문을 넣지 않고 관리자 URL을 이스케이프한다", () => {
    const inquiry = storedInquiry({
      companyName: 'ACME <script>alert("company")</script> & Co',
      contactName: "홍길동 <img src=x onerror=alert(1)>",
      phone: "<svg onload=alert(1)>",
      projectBackground: '<b>문제 & "배경"</b>',
      expectedScope: "'기획' & <em>개발</em>",
      referenceLinks: [
        'https://example.com/?query=<script>&quote="unsafe"',
      ],
    });
    const adminUrl =
      'https://admin.example/inquiries/1?next="><script>alert(1)</script>&x=1';

    const rendered = renderInternalNotification(inquiry, adminUrl, "[DEV] ");

    expect(rendered.html).not.toContain("<script>");
    expect(rendered.html).not.toContain("<img src=x");
    expect(rendered.html).not.toContain("<svg onload");
    expect(rendered.html).not.toContain("<b>문제");
    expect(rendered.html).not.toContain("ACME");
    expect(rendered.html).not.toContain("홍길동");
    expect(rendered.html).not.toContain("010-1234-5678");
    expect(rendered.html).not.toContain("hello@example.com");
    expect(rendered.html).not.toContain("기획");
    expect(rendered.text).toContain(inquiry.publicId);
    expect(rendered.html).toContain(
      "next=&quot;&gt;&lt;script&gt;alert(1)&lt;/script&gt;&amp;x=1",
    );
  });

  it("문의자 확인 HTML에서 담당자명을 이스케이프한다", () => {
    const rendered = renderConfirmation(
      storedInquiry({
        contactName: '홍길동 <script>alert("name")</script> & Co',
      }),
      "",
    );

    expect(rendered.html).not.toContain("<script>");
    expect(rendered.html).toContain(
      "홍길동 &lt;script&gt;alert(&quot;name&quot;)&lt;/script&gt; &amp; Co",
    );
    expect(rendered.text).toContain("다음 영업일까지 답변드리겠습니다.");
  });
});
