import { describe, expect, it } from "vitest";

import {
  BUDGET_RANGES,
  CONTACT_PRIVACY_POLICY_VERSION,
  contactInputSchema,
  idempotencyKeySchema,
  PROJECT_BACKGROUND_MIN_LENGTH,
  PROJECT_TYPES,
} from "@/lib/contact/schema";

const EXPECTED_PROJECT_TYPES = [
  "website_diagnostics",
  "corporate_website",
  "brand_website_renewal",
  "digital_product_uxui",
  "frontend_backend_development",
  "admin_system",
  "maintenance_operation",
  "other",
] as const;

const EXPECTED_BUDGET_RANGES = [
  "under_20m",
  "20m_50m",
  "50m_100m",
  "over_100m",
] as const;

function validContactInput(
  overrides: Record<string, unknown> = {},
): Record<string, unknown> {
  return {
    companyName: "Won Design Studio",
    contactName: "홍길동",
    email: "hello@example.com",
    projectType: "corporate_website",
    projectBackground: "기업 웹사이트 리뉴얼을 검토하고 있습니다.",
    budgetRange: "20m_50m",
    privacyConsent: true,
    privacyPolicyVersion: CONTACT_PRIVACY_POLICY_VERSION,
    ...overrides,
  };
}

describe("contactInputSchema", () => {
  it("필수 필드만으로 유효한 문의를 생성한다", () => {
    const result = contactInputSchema.parse(
      validContactInput({
        companyName: "  Won Design Studio  ",
        contactName: "  홍길동  ",
        email: "  HELLO@EXAMPLE.COM  ",
      }),
    );

    expect(result).toMatchObject({
      companyName: "Won Design Studio",
      contactName: "홍길동",
      email: "hello@example.com",
      referenceLinks: [],
      website: "",
    });
  });

  it.each([
    "companyName",
    "contactName",
    "email",
    "projectType",
    "projectBackground",
    "budgetRange",
    "privacyConsent",
    "privacyPolicyVersion",
  ])("%s가 없으면 거부한다", (field) => {
    const input = validContactInput();
    delete input[field];

    expect(contactInputSchema.safeParse(input).success).toBe(false);
  });

  it("선택 필드를 정규화하고 빈 문자열은 undefined로 변환한다", () => {
    const result = contactInputSchema.parse(
      validContactInput({
        phone: "  010-1234-5678  ",
        expectedScope: "   ",
        desiredSchedule: "  2026년 9월 시작  ",
        referenceLinks: ["  https://example.com/reference  "],
      }),
    );

    expect(result.phone).toBe("010-1234-5678");
    expect(result.expectedScope).toBeUndefined();
    expect(result.desiredSchedule).toBe("2026년 9월 시작");
    expect(result.referenceLinks).toEqual(["https://example.com/reference"]);
  });

  it("정확히 8개의 프로젝트 유형을 모두 허용한다", () => {
    expect(PROJECT_TYPES).toEqual(EXPECTED_PROJECT_TYPES);

    for (const projectType of EXPECTED_PROJECT_TYPES) {
      expect(
        contactInputSchema.safeParse(validContactInput({ projectType })).success,
      ).toBe(true);
    }
  });

  it("정확히 4개의 예산 구간을 모두 허용한다", () => {
    expect(BUDGET_RANGES).toEqual(EXPECTED_BUDGET_RANGES);

    for (const budgetRange of EXPECTED_BUDGET_RANGES) {
      expect(
        contactInputSchema.safeParse(validContactInput({ budgetRange })).success,
      ).toBe(true);
    }
  });

  it("http/https 참고 링크를 최대 5개까지 허용한다", () => {
    const referenceLinks = [
      "https://example.com/1",
      "http://example.com/2",
      "https://example.com/3",
      "https://example.com/4",
      "https://example.com/5",
    ];

    expect(
      contactInputSchema.safeParse(validContactInput({ referenceLinks })).success,
    ).toBe(true);
    expect(
      contactInputSchema.safeParse(
        validContactInput({
          referenceLinks: [...referenceLinks, "https://example.com/6"],
        }),
      ).success,
    ).toBe(false);
  });

  it.each(["ftp://example.com/file", "mailto:hello@example.com"])(
    "http/https가 아닌 참고 링크 %s를 거부한다",
    (referenceLink) => {
      expect(
        contactInputSchema.safeParse(
          validContactInput({ referenceLinks: [referenceLink] }),
        ).success,
      ).toBe(false);
    },
  );

  it("참고 링크 하나의 길이를 2,048자로 제한한다", () => {
    const prefix = "https://example.com/";
    const maximumLengthUrl = `${prefix}${"a".repeat(2_048 - prefix.length)}`;
    const tooLongUrl = `${maximumLengthUrl}a`;

    expect(
      contactInputSchema.safeParse(
        validContactInput({ referenceLinks: [maximumLengthUrl] }),
      ).success,
    ).toBe(true);
    expect(
      contactInputSchema.safeParse(
        validContactInput({ referenceLinks: [tooLongUrl] }),
      ).success,
    ).toBe(false);
  });

  it.each([false, undefined, "true"])(
    "개인정보 동의가 true가 아닌 값(%s)이면 거부한다",
    (privacyConsent) => {
      expect(
        contactInputSchema.safeParse(
          validContactInput({ privacyConsent }),
        ).success,
      ).toBe(false);
    },
  );

  it("현재 개인정보 처리방침 버전만 허용한다", () => {
    expect(
      contactInputSchema.safeParse(
        validContactInput({ privacyPolicyVersion: "legacy" }),
      ).success,
    ).toBe(false);
  });

  it("프로젝트 배경을 DB와 동일하게 최소 20자로 제한한다", () => {
    expect(PROJECT_BACKGROUND_MIN_LENGTH).toBe(20);
    expect(
      contactInputSchema.safeParse(
        validContactInput({
          projectBackground: "가".repeat(PROJECT_BACKGROUND_MIN_LENGTH - 1),
        }),
      ).success,
    ).toBe(false);
    expect(
      contactInputSchema.safeParse(
        validContactInput({
          projectBackground: "가".repeat(PROJECT_BACKGROUND_MIN_LENGTH),
        }),
      ).success,
    ).toBe(true);
  });

  it("서버가 스팸으로 처리할 수 있도록 채워진 허니팟 값도 구조적으로는 허용한다", () => {
    const result = contactInputSchema.safeParse(
      validContactInput({ website: "bot-filled-value" }),
    );

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.website).toBe("bot-filled-value");
    }
  });
});

describe("idempotencyKeySchema", () => {
  it("유효한 UUID를 허용한다", () => {
    expect(
      idempotencyKeySchema.safeParse(
        "550e8400-e29b-41d4-a716-446655440000",
      ).success,
    ).toBe(true);
  });

  it.each([undefined, null, "", "not-a-uuid", "550e8400-e29b-41d4-a716"])(
    "UUID가 아닌 멱등성 키(%s)를 거부한다",
    (value) => {
      expect(idempotencyKeySchema.safeParse(value).success).toBe(false);
    },
  );
});
