import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requireAdminAction: vi.fn(),
  revalidatePath: vi.fn(),
  from: vi.fn(),
  rpc: vi.fn(),
}));

vi.mock("@/lib/auth/admin", () => ({
  requireAdminAction: mocks.requireAdminAction,
  AdminAuthorizationError: class extends Error {},
}));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));

import { AdminAuthorizationError } from "@/lib/auth/admin";
import {
  createLegalDraftAction,
  publishLegalDocumentAction,
  saveLegalDraftAction,
} from "@/app/admin/content-actions";
import { LEGAL_DOCUMENT_TEMPLATES } from "@/lib/content/legal-templates";

const idle = { status: "idle" } as const;
const documentId = "550e8400-e29b-41d4-a716-446655440000";

function form(values: Record<string, string>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(values)) data.set(key, value);
  return data;
}

function query(result: { data: unknown; error: unknown }) {
  const builder = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockResolvedValue(result),
    insert: vi.fn().mockResolvedValue({ error: null }),
  };
  mocks.from.mockReturnValueOnce(builder);
  return builder;
}

function draftForm(overrides: Record<string, string> = {}) {
  return form({
    id: documentId,
    documentType: "privacy",
    title: "개인정보처리방침",
    version: "test-v2",
    summary: "공개되지 않는 로컬 회귀 테스트",
    content: "## 테스트\n\n실제 운영 문서나 데이터베이스에 저장하지 않는 테스트 본문입니다.",
    effectiveAt: "2026-09-03",
    ...overrides,
  });
}

beforeEach(() => {
  vi.resetAllMocks();
  mocks.requireAdminAction.mockResolvedValue({
    client: { from: mocks.from, rpc: mocks.rpc },
  });
});

describe("legal actions authorization", () => {
  it.each([
    ["초안 생성", createLegalDraftAction],
    ["초안 저장", saveLegalDraftAction],
    ["발행", publishLegalDocumentAction],
  ])("%s 전에 관리자 권한을 확인하고 비인가 요청을 차단한다", async (_name, action) => {
    mocks.requireAdminAction.mockRejectedValue(new AdminAuthorizationError("권한 없음"));

    expect(await action(idle, draftForm())).toEqual({ status: "error", message: "권한 없음" });
    expect(mocks.from).not.toHaveBeenCalled();
    expect(mocks.rpc).not.toHaveBeenCalled();
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });
});

describe("legal draft creation", () => {
  it("동일 유형의 기존 초안이 있으면 생성하지 않는다", async () => {
    query({ data: { id: documentId }, error: null });

    const result = await createLegalDraftAction(idle, form({ documentType: "privacy" }));

    expect(result.status).toBe("error");
    expect(mocks.from).toHaveBeenCalledTimes(1);
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });

  it("현재 공개 문서를 새 초안으로 복제하고 공개 페이지는 갱신하지 않는다", async () => {
    query({ data: null, error: null });
    const published = {
      title: "현재 개인정보처리방침",
      version: "old-v1",
      summary: "현재 요약",
      content: "현재 공개된 충분한 길이의 개인정보처리방침 본문입니다.",
      effective_at: "2026-07-28",
    };
    const publishedQuery = query({ data: published, error: null });
    const insertQuery = query({ data: null, error: null });

    expect((await createLegalDraftAction(idle, form({ documentType: "privacy" }))).status).toBe("success");
    expect(publishedQuery.eq).toHaveBeenCalledWith("status", "published");
    expect(insertQuery.insert).toHaveBeenCalledWith(expect.objectContaining({
      document_type: "privacy",
      title: published.title,
      content: published.content,
      summary: published.summary,
      effective_at: published.effective_at,
      status: "draft",
    }));
    expect(mocks.revalidatePath.mock.calls).toEqual([["/admin/legal"]]);
  });

  it("공개본이 없으면 유형별 기본 템플릿을 비공개 초안으로 생성한다", async () => {
    query({ data: null, error: null });
    query({ data: null, error: null });
    const insertQuery = query({ data: null, error: null });

    expect((await createLegalDraftAction(idle, form({ documentType: "terms" }))).status).toBe("success");
    expect(insertQuery.insert).toHaveBeenCalledWith(expect.objectContaining({
      document_type: "terms",
      content: LEGAL_DOCUMENT_TEMPLATES.terms,
      status: "draft",
    }));
  });

  it("조회 오류를 초안 없음으로 오인해 새 문서를 생성하지 않는다", async () => {
    query({ data: null, error: new Error("private database details") });
    const result = await createLegalDraftAction(idle, form({ documentType: "privacy" }));
    expect(result.status).toBe("error");
    if (result.status !== "error") throw new Error("Expected a safe error response");
    expect(result.message).not.toContain("private database details");
    expect(mocks.from).toHaveBeenCalledTimes(1);
  });
});

describe("legal draft saving", () => {
  it("선택한 유형의 초안만 수정하고 공개본은 건드리지 않는다", async () => {
    const updateQuery = query({ data: { id: documentId }, error: null });

    expect((await saveLegalDraftAction(idle, draftForm())).status).toBe("success");
    expect(updateQuery.eq.mock.calls).toEqual([
      ["id", documentId], ["document_type", "privacy"], ["status", "draft"],
    ]);
    expect(updateQuery.update).toHaveBeenCalledWith(expect.objectContaining({ version: "test-v2" }));
    expect(mocks.revalidatePath.mock.calls).toEqual([["/admin/legal"]]);
  });

  it.each<Record<string, string>>([
    { id: "not-a-uuid" },
    { documentType: "invalid" },
    { content: "짧음" },
    { effectiveAt: "2026-02-30" },
  ])("유효하지 않은 입력은 저장 전에 차단한다: %j", async (input) => {
    expect((await saveLegalDraftAction(idle, draftForm(input))).status).toBe("error");
    expect(mocks.from).not.toHaveBeenCalled();
  });

  it("없거나 이미 발행된 초안을 저장 성공으로 표시하지 않는다", async () => {
    query({ data: null, error: null });
    expect((await saveLegalDraftAction(idle, draftForm())).status).toBe("error");
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });
});

describe("legal publishing contract (mocked database, not production E2E)", () => {
  it.each([ ["privacy", "/privacy"], ["terms", "/terms"] ])(
    "%s 발행 성공 시 RPC를 1회 호출하고 관련 공개 캐시를 갱신한다",
    async (documentType, publicPath) => {
      mocks.rpc.mockResolvedValue({ data: true, error: null });

      expect((await publishLegalDocumentAction(idle, form({ id: documentId, documentType }))).status).toBe("success");
      expect(mocks.rpc).toHaveBeenCalledExactlyOnceWith("publish_legal_document", { p_document_id: documentId });
      expect(mocks.revalidatePath.mock.calls).toEqual([["/admin/legal"], [publicPath], ["/"]]);
    },
  );

  it.each([
    { data: false, error: null },
    { data: null, error: new Error("private database details") },
  ])("발행 실패는 성공 안내나 캐시 갱신을 만들지 않는다", async (response) => {
    mocks.rpc.mockResolvedValue(response);
    const result = await publishLegalDocumentAction(idle, draftForm());
    expect(result.status).toBe("error");
    if (result.status !== "error") throw new Error("Expected a safe error response");
    expect(result.message).not.toContain("private database details");
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });

  it("잘못된 문서 ID로 발행 RPC를 실행하지 않는다", async () => {
    expect((await publishLegalDocumentAction(idle, draftForm({ id: "invalid" }))).status).toBe("error");
    expect(mocks.rpc).not.toHaveBeenCalled();
  });
});
