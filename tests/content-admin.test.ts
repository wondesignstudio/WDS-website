import { existsSync, readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { parseLegalContent } from "@/components/legal/managed-legal-page";
import { parseRichText } from "@/components/content/rich-text";
import {
  legalDocumentInputSchema,
  mediaMetadataInputSchema,
  portfolioProjectInputSchema,
} from "@/lib/content/schema";

const migration = readFileSync(
  new URL(
    "../supabase/migrations/202607140001_content_admin.sql",
    import.meta.url,
  ),
  "utf8",
);
const detailPublicationMigration = readFileSync(
  new URL(
    "../supabase/migrations/202607140002_publish_seeded_project_details.sql",
    import.meta.url,
  ),
  "utf8",
);
const projectDeleteMigration = readFileSync(
  new URL(
    "../supabase/migrations/202607140003_project_media_delete_cascade.sql",
    import.meta.url,
  ),
  "utf8",
);
const projectOrderMigration = readFileSync(
  new URL(
    "../supabase/migrations/202607140004_normalize_project_order.sql",
    import.meta.url,
  ),
  "utf8",
);
const contentActions = readFileSync(
  new URL("../src/app/admin/content-actions.ts", import.meta.url),
  "utf8",
);
const mediaDeleteComponent = readFileSync(
  new URL("../src/components/admin/media-delete-action.tsx", import.meta.url),
  "utf8",
);
const projectsPage = readFileSync(
  new URL("../src/app/admin/(protected)/projects/page.tsx", import.meta.url),
  "utf8",
);
const projectListComponent = readFileSync(
  new URL("../src/components/admin/project-list.tsx", import.meta.url),
  "utf8",
);
const mediaPage = readFileSync(
  new URL("../src/app/admin/(protected)/media/page.tsx", import.meta.url),
  "utf8",
);
const inquiryPage = readFileSync(
  new URL("../src/app/admin/(protected)/inquiries/page.tsx", import.meta.url),
  "utf8",
);
const inquiryListComponent = readFileSync(
  new URL("../src/components/admin/inquiry-list-table.tsx", import.meta.url),
  "utf8",
);
const inquiryRepository = readFileSync(
  new URL("../src/lib/contact/admin.ts", import.meta.url),
  "utf8",
);
const adminAuthorization = readFileSync(
  new URL("../src/lib/auth/admin.ts", import.meta.url),
  "utf8",
);
const navigationFeedback = readFileSync(
  new URL("../src/components/admin/admin-navigation-feedback.tsx", import.meta.url),
  "utf8",
);

describe("content admin migration security contracts", () => {
  it("프로젝트·미디어·법적 문서 모두 관리자 RLS를 강제한다", () => {
    for (const table of ["portfolio_projects", "media_assets", "legal_documents"]) {
      expect(migration).toContain(`alter table public.${table} enable row level security;`);
      expect(migration).toContain(`alter table public.${table} force row level security;`);
    }
    expect(migration.match(/select private\.is_admin\(\)/g)?.length).toBeGreaterThanOrEqual(7);
  });

  it("미디어 버킷은 비공개이고 이미지 형식과 10MB 제한을 둔다", () => {
    expect(migration).toContain("'wds-media'");
    expect(migration).toContain("10485760");
    expect(migration).toContain("array['image/jpeg', 'image/png', 'image/webp']");
    expect(migration).toContain("false,");
  });

  it("법적 문서는 초안과 공개 버전을 하나씩만 유지하고 관리자만 발행한다", () => {
    expect(migration).toContain("legal_documents_one_draft_idx");
    expect(migration).toContain("legal_documents_one_published_idx");
    expect(migration).toContain("if not private.is_admin()");
    expect(migration).toContain("set status = 'archived'");
  });

  it("승인되지 않은 미디어와 비공개 프로젝트 상세의 공개를 DB에서 거부한다", () => {
    expect(migration).toContain("check (not is_published or approval_status = 'approved')");
    expect(migration).toContain("check (not detail_published or is_published)");
  });

  it("기본 프로젝트 3건의 목록 링크와 상세 공개 상태를 일치시킨다", () => {
    expect(detailPublicationMigration).toContain("set detail_published = true");
    for (const slug of ["marketing-catnip", "timeattack", "questboard"]) {
      expect(detailPublicationMigration).toContain(`'${slug}'`);
    }
  });

  it("프로젝트 삭제 시 연결된 미디어 정보도 같은 DB 트랜잭션에서 삭제한다", () => {
    expect(projectDeleteMigration).toContain("references public.portfolio_projects(id)");
    expect(projectDeleteMigration).toContain("on delete cascade");
  });

  it("프로젝트 노출 순서를 1부터 연속된 값으로 정규화한다", () => {
    expect(projectOrderMigration).toContain("row_number() over");
    expect(projectOrderMigration).toContain("normalized_order");
    expect(projectOrderMigration).toContain("check (sort_order >= 1)");
    expect(contentActions).toContain("normalizeProjectSortOrders");
  });
});

describe("project content renderer", () => {
  it("프로젝트 본문의 소제목·목록·문단을 안전한 블록으로 파싱한다", () => {
    expect(parseRichText("### 목표\n\n핵심 **문장**입니다.\n\n- 첫째\n- 둘째")).toEqual([
      { type: "subheading", text: "목표" },
      { type: "paragraph", text: "핵심 **문장**입니다." },
      { type: "list", items: ["첫째", "둘째"] },
    ]);
  });
});

describe("media permanent deletion contracts", () => {
  const deleteAction = contentActions.slice(
    contentActions.indexOf("export async function deleteMediaAction"),
    contentActions.indexOf("export async function createLegalDraftAction"),
  );

  it("삭제 확인과 Storage·DB 결과를 모두 검증한다", () => {
    expect(deleteAction).toContain('formData.get("confirmed") !== "true"');
    expect(deleteAction).toContain("error: storageError");
    expect(deleteAction).toContain("error: deleteError");
    expect(deleteAction).toContain('.select("id")');
    expect(deleteAction.indexOf('.from("wds-media")')).toBeLessThan(
      deleteAction.indexOf(".delete()"),
    );
  });

  it("확인 모달과 진행·성공·오류 피드백을 제공한다", () => {
    expect(mediaDeleteComponent).toContain("useActionState(deleteMediaAction");
    expect(mediaDeleteComponent).toContain("dialog.showModal()");
    expect(mediaDeleteComponent).toContain('pending ? "삭제 중…"');
    expect(mediaDeleteComponent).toContain('state.status === "success"');
    expect(mediaDeleteComponent).toContain("<ContentActionMessage state={state} />");
  });
});

describe("admin content navigation contracts", () => {
  it("프로젝트와 미디어 등록을 각각 전용 페이지로 분리한다", () => {
    expect(projectsPage).toContain('href="/admin/projects/new"');
    expect(projectsPage).not.toContain("<ProjectEditor");
    expect(mediaPage).toContain('href="/admin/media/new"');
    expect(mediaPage).not.toContain("<MediaUploadForm");
  });

  it("프로젝트 목록에서 갤러리와 테이블 보기를 제공한다", () => {
    expect(projectsPage).toContain("<ProjectList");
    expect(projectListComponent).toContain("useState(initialView)");
    expect(projectListComponent).toContain('setView("gallery")');
    expect(projectListComponent).toContain('setView("table")');
    expect(projectListComponent).toContain("대표 이미지 없음");
    expect(projectListComponent).toContain("<ProjectRowActions");
  });

  it("문의 목록에 문의 배경 요약과 명시적인 상세 보기 액션을 제공한다", () => {
    expect(inquiryRepository).toContain("project_type,project_background,budget_range");
    expect(inquiryPage).toContain("<InquiryListTable");
    expect(inquiryListComponent).toContain("{item.projectBackground}");
    expect(inquiryListComponent).toContain("문의 상세 보기");
  });

  it("관리자 인증을 요청 단위로 재사용하고 짧은 이동에는 로딩을 표시하지 않는다", () => {
    expect(adminAuthorization).toContain("cache(async function getAdminAccess");
    expect(navigationFeedback).toContain("const FEEDBACK_DELAY_MS = 240");
    expect(existsSync(new URL("../src/app/admin/(protected)/loading.tsx", import.meta.url))).toBe(false);
  });
});

describe("content admin input contracts", () => {
  it("상세 공개 전에 프로젝트 목록 공개를 요구한다", () => {
    const result = portfolioProjectInputSchema.safeParse({
      slug: "test-project",
      title: "테스트",
      clientName: "",
      summary: "프로젝트 요약",
      projectType: "웹사이트",
      scopes: ["기획"],
      statusLabel: "출시",
      visualTone: "white",
      challenge: "",
      roleDescription: "",
      approach: "",
      outcome: "",
      sortOrder: 1,
      isPublished: false,
      detailPublished: true,
    });
    expect(result.success).toBe(false);
  });

  it("프로젝트 노출 순서는 1 이상의 정수만 허용한다", () => {
    const input = {
      slug: "test-project",
      title: "테스트",
      clientName: "",
      summary: "프로젝트 요약",
      projectType: "웹사이트",
      scopes: ["기획"],
      statusLabel: "출시",
      visualTone: "white" as const,
      challenge: "",
      roleDescription: "",
      approach: "",
      outcome: "",
      isPublished: false,
      detailPublished: false,
    };

    expect(portfolioProjectInputSchema.safeParse({ ...input, sortOrder: 0 }).success).toBe(false);
    expect(portfolioProjectInputSchema.safeParse({ ...input, sortOrder: 1 }).success).toBe(true);
  });

  it("승인된 자산만 공개할 수 있다", () => {
    const result = mediaMetadataInputSchema.safeParse({
      projectId: "550e8400-e29b-41d4-a716-446655440000",
      kind: "project_image",
      altText: "프로젝트 화면",
      caption: "",
      clientName: "",
      approvalStatus: "draft",
      isPublished: true,
      sortOrder: 0,
    });
    expect(result.success).toBe(false);
  });

  it("법적 문서 본문은 최소 길이와 허용 유형을 검증한다", () => {
    expect(legalDocumentInputSchema.safeParse({
      documentType: "privacy",
      title: "개인정보처리방침",
      version: "2026-07-14",
      summary: "",
      content: "## 1. 목적\n\n충분한 길이의 개인정보 처리방침 본문입니다.",
      effectiveAt: "2026-07-14",
    }).success).toBe(true);
  });
});

describe("legal document renderer", () => {
  it("HTML을 실행하지 않고 허용한 문단 구조만 파싱한다", () => {
    const blocks = parseLegalContent(
      "## 1. 목적\n\n<script>alert('x')</script>\n\n### 세부\n\n- 첫째\n- 둘째",
    );
    expect(blocks).toEqual([
      { type: "section", text: "1. 목적" },
      { type: "paragraph", text: "<script>alert('x')</script>" },
      { type: "subheading", text: "세부" },
      { type: "list", items: ["첫째", "둘째"] },
    ]);
  });
});
