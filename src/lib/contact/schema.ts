import { z } from "zod";

export const CONTACT_PRIVACY_POLICY_VERSION = "2026-07-14";
export const PROJECT_BACKGROUND_MIN_LENGTH = 20;

export const PROJECT_TYPE_OPTIONS = [
  { value: "website_diagnostics", label: "웹사이트 진단" },
  { value: "corporate_website", label: "기업 웹사이트" },
  { value: "brand_website_renewal", label: "브랜드 및 웹사이트 리뉴얼" },
  { value: "digital_product_uxui", label: "디지털 제품 UX/UI" },
  {
    value: "frontend_backend_development",
    label: "프론트엔드 또는 백엔드 개발",
  },
  { value: "admin_system", label: "관리자 시스템" },
  { value: "maintenance_operation", label: "유지보수 및 운영" },
  { value: "other", label: "기타" },
] as const;

export const BUDGET_RANGE_OPTIONS = [
  { value: "under_20m", label: "2천만 원 미만" },
  { value: "20m_50m", label: "2천만 원 이상 5천만 원 미만" },
  { value: "50m_100m", label: "5천만 원 이상 1억 원 미만" },
  { value: "over_100m", label: "1억 원 이상" },
] as const;

export const INQUIRY_STATUS_OPTIONS = [
  { value: "new", label: "신규" },
  { value: "contacted", label: "연락 완료" },
  { value: "consulting", label: "상담 중" },
  { value: "converted", label: "고객 전환" },
  { value: "closed", label: "종료·비전환" },
] as const;

export const PROJECT_TYPES = PROJECT_TYPE_OPTIONS.map(
  (option) => option.value,
) as [
  (typeof PROJECT_TYPE_OPTIONS)[number]["value"],
  ...(typeof PROJECT_TYPE_OPTIONS)[number]["value"][],
];

export const BUDGET_RANGES = BUDGET_RANGE_OPTIONS.map(
  (option) => option.value,
) as [
  (typeof BUDGET_RANGE_OPTIONS)[number]["value"],
  ...(typeof BUDGET_RANGE_OPTIONS)[number]["value"][],
];

export const INQUIRY_STATUSES = INQUIRY_STATUS_OPTIONS.map(
  (option) => option.value,
) as [
  (typeof INQUIRY_STATUS_OPTIONS)[number]["value"],
  ...(typeof INQUIRY_STATUS_OPTIONS)[number]["value"][],
];

const optionalText = (maximum: number) =>
  z
    .string()
    .trim()
    .max(maximum, `최대 ${maximum.toLocaleString("ko-KR")}자까지 입력할 수 있습니다.`)
    .optional()
    .transform((value) => value || undefined);

const referenceLinkSchema = z
  .string()
  .trim()
  .max(2_048, "링크 주소가 너무 깁니다.")
  .url("올바른 링크 주소를 입력해 주세요.")
  .refine((value) => {
    const protocol = new URL(value).protocol;
    return protocol === "http:" || protocol === "https:";
  }, "http 또는 https 링크만 입력할 수 있습니다.");

export const contactInputSchema = z
  .object({
    companyName: z
      .string()
      .trim()
      .min(1, "회사명을 입력해 주세요.")
      .max(100, "회사명은 100자까지 입력할 수 있습니다."),
    contactName: z
      .string()
      .trim()
      .min(1, "담당자명을 입력해 주세요.")
      .max(80, "담당자명은 80자까지 입력할 수 있습니다."),
    email: z
      .string()
      .trim()
      .min(1, "업무 이메일을 입력해 주세요.")
      .toLowerCase()
      .email("올바른 이메일 주소를 입력해 주세요.")
      .max(254, "올바른 이메일 주소를 입력해 주세요."),
    phone: optionalText(30).refine(
      (value) => !value || /^[0-9+().\-\s]+$/.test(value),
      "전화번호 형식을 확인해 주세요.",
    ),
    projectType: z.enum(PROJECT_TYPES, {
      error: "프로젝트 유형을 선택해 주세요.",
    }),
    projectBackground: z
      .string()
      .trim()
      .min(
        PROJECT_BACKGROUND_MIN_LENGTH,
        `현재 문제와 추진 배경을 ${PROJECT_BACKGROUND_MIN_LENGTH}자 이상 입력해 주세요.`,
      )
      .max(5_000, "현재 문제와 추진 배경은 5,000자까지 입력할 수 있습니다."),
    budgetRange: z.enum(BUDGET_RANGES, {
      error: "예산 범위를 선택해 주세요.",
    }),
    expectedScope: optionalText(2_000),
    desiredSchedule: optionalText(500),
    referenceLinks: z
      .array(referenceLinkSchema)
      .max(5, "참고 링크는 최대 5개까지 입력할 수 있습니다.")
      .default([]),
    privacyConsent: z.literal(true, {
      error: "개인정보 수집 및 이용에 동의해 주세요.",
    }),
    privacyPolicyVersion: z.literal(CONTACT_PRIVACY_POLICY_VERSION),
    website: z.string().max(200).optional().default(""),
  })
  .strict();

export const idempotencyKeySchema = z.string().uuid();

export const inquiryStatusSchema = z.enum(INQUIRY_STATUSES);

export type ContactInput = z.infer<typeof contactInputSchema>;
export type InquiryStatus = z.infer<typeof inquiryStatusSchema>;

export function getProjectTypeLabel(value: string) {
  return (
    PROJECT_TYPE_OPTIONS.find((option) => option.value === value)?.label ?? value
  );
}

export function getBudgetRangeLabel(value: string) {
  return (
    BUDGET_RANGE_OPTIONS.find((option) => option.value === value)?.label ?? value
  );
}

export function getInquiryStatusLabel(value: string) {
  return (
    INQUIRY_STATUS_OPTIONS.find((option) => option.value === value)?.label ??
    value
  );
}
