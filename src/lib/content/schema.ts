import { z } from "zod";

export const PROJECT_VISUAL_TONES = ["orange", "black", "white"] as const;
export const MEDIA_KINDS = ["project_image", "client_logo"] as const;
export const MEDIA_APPROVAL_STATUSES = ["draft", "approved", "rejected"] as const;
export const LEGAL_DOCUMENT_TYPES = ["privacy", "terms"] as const;

const optionalText = (maximum: number) =>
  z
    .string()
    .trim()
    .max(maximum)
    .transform((value) => value || null);

export const portfolioProjectInputSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(2)
    .max(80)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "영문 소문자, 숫자, 하이픈만 사용할 수 있습니다."),
  title: z.string().trim().min(1).max(120),
  clientName: optionalText(120),
  summary: z.string().trim().min(1).max(500),
  projectType: z.string().trim().min(1).max(120),
  scopes: z.array(z.string().trim().min(1).max(80)).min(1).max(20),
  statusLabel: z.string().trim().min(1).max(40),
  visualTone: z.enum(PROJECT_VISUAL_TONES),
  challenge: z.string().trim().max(5_000),
  roleDescription: z.string().trim().max(5_000),
  approach: z.string().trim().max(5_000),
  outcome: z.string().trim().max(5_000),
  sortOrder: z.number().int().min(1, "노출 순서는 1 이상이어야 합니다.").max(10_000),
  isPublished: z.boolean(),
  detailPublished: z.boolean(),
}).refine((value) => !value.detailPublished || value.isPublished, {
  message: "상세 공개 전에 프로젝트 목록을 먼저 공개해 주세요.",
  path: ["detailPublished"],
});

export const mediaMetadataInputSchema = z.object({
  projectId: z.string().uuid().nullable(),
  kind: z.enum(MEDIA_KINDS),
  altText: z.string().trim().min(1).max(300),
  caption: z.string().trim().max(500),
  clientName: optionalText(120),
  approvalStatus: z.enum(MEDIA_APPROVAL_STATUSES),
  isPublished: z.boolean(),
  sortOrder: z.number().int().min(-10_000).max(10_000),
}).superRefine((value, context) => {
  if (value.kind === "project_image" && !value.projectId) {
    context.addIssue({
      code: "custom",
      path: ["projectId"],
      message: "프로젝트 이미지는 연결할 프로젝트가 필요합니다.",
    });
  }

  if (value.kind === "client_logo" && !value.clientName) {
    context.addIssue({
      code: "custom",
      path: ["clientName"],
      message: "고객 로고에는 고객사명이 필요합니다.",
    });
  }

  if (value.isPublished && value.approvalStatus !== "approved") {
    context.addIssue({
      code: "custom",
      path: ["isPublished"],
      message: "승인된 자산만 공개할 수 있습니다.",
    });
  }
});

export const legalDocumentInputSchema = z.object({
  documentType: z.enum(LEGAL_DOCUMENT_TYPES),
  title: z.string().trim().min(1).max(120),
  version: z.string().trim().min(1).max(64),
  summary: z.string().trim().max(500),
  content: z.string().trim().min(20).max(100_000),
  effectiveAt: z.string().date().nullable(),
});

export type PortfolioProjectInput = z.infer<typeof portfolioProjectInputSchema>;
export type MediaMetadataInput = z.infer<typeof mediaMetadataInputSchema>;
export type LegalDocumentType = (typeof LEGAL_DOCUMENT_TYPES)[number];
export type LegalDocumentInput = z.infer<typeof legalDocumentInputSchema>;
