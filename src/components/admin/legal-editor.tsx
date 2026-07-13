"use client";

import { useActionState } from "react";

import {
  createLegalDraftAction,
  publishLegalDocumentAction,
  saveLegalDraftAction,
} from "@/app/admin/content-actions";
import { LEGAL_DOCUMENT_LABELS } from "@/lib/content/legal-templates";
import type { LegalDocumentType } from "@/lib/content/schema";
import type { LegalDocument } from "@/lib/content/types";

import { ContentActionMessage } from "./content-action-message";

const initialState = { status: "idle" } as const;

export function CreateLegalDraftButton({ documentType }: { documentType: LegalDocumentType }) {
  const [state, formAction, pending] = useActionState(createLegalDraftAction, initialState);
  return (
    <form action={formAction}>
      <input type="hidden" name="documentType" value={documentType} />
      <button className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold" type="submit" disabled={pending}>
        {pending ? "초안 생성 중…" : `${LEGAL_DOCUMENT_LABELS[documentType]} 초안 만들기`}
      </button>
      <ContentActionMessage state={state} />
    </form>
  );
}

export function LegalEditor({ draft }: { draft: LegalDocument }) {
  const [saveState, saveAction, saving] = useActionState(saveLegalDraftAction, initialState);
  const [publishState, publishAction, publishing] = useActionState(publishLegalDocumentAction, initialState);

  return (
    <article className="rounded-2xl border border-zinc-200 bg-white p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-zinc-500">편집 중인 초안</p>
          <h2 className="mt-1 text-2xl font-semibold">{LEGAL_DOCUMENT_LABELS[draft.documentType]}</h2>
        </div>
        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-900">초안</span>
      </div>

      <form action={saveAction} className="mt-6 grid gap-5 md:grid-cols-2">
        <input type="hidden" name="id" value={draft.id} />
        <input type="hidden" name="documentType" value={draft.documentType} />
        <label className="text-sm font-semibold text-zinc-700">
          문서 제목
          <input className="mt-2 w-full rounded-lg border border-zinc-300 px-3 py-2 font-normal" name="title" defaultValue={draft.title} required maxLength={120} />
        </label>
        <label className="text-sm font-semibold text-zinc-700">
          버전
          <input className="mt-2 w-full rounded-lg border border-zinc-300 px-3 py-2 font-normal" name="version" defaultValue={draft.version} required maxLength={64} />
        </label>
        <label className="text-sm font-semibold text-zinc-700">
          시행일
          <input className="mt-2 w-full rounded-lg border border-zinc-300 px-3 py-2 font-normal" name="effectiveAt" type="date" defaultValue={draft.effectiveAt ?? ""} />
        </label>
        <label className="text-sm font-semibold text-zinc-700">
          소개 문구
          <input className="mt-2 w-full rounded-lg border border-zinc-300 px-3 py-2 font-normal" name="summary" defaultValue={draft.summary} maxLength={500} />
        </label>
        <label className="text-sm font-semibold text-zinc-700 md:col-span-2">
          본문
          <textarea className="mt-2 min-h-[42rem] w-full rounded-lg border border-zinc-300 px-4 py-3 font-mono text-sm font-normal leading-7" name="content" defaultValue={draft.content} required maxLength={100000} />
          <span className="mt-2 block font-normal text-zinc-500">`##`는 조항 제목, `###`는 하위 제목, `-`는 목록으로 표시됩니다. HTML은 실행되지 않습니다.</span>
        </label>
        <div className="md:col-span-2">
          <button className="rounded-lg bg-zinc-950 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50" type="submit" disabled={saving}>
            {saving ? "저장 중…" : "초안 저장"}
          </button>
          <ContentActionMessage state={saveState} />
        </div>
      </form>

      <form action={publishAction} className="mt-8 border-t border-zinc-200 pt-6">
        <input type="hidden" name="id" value={draft.id} />
        <input type="hidden" name="documentType" value={draft.documentType} />
        <p className="text-sm leading-6 text-zinc-600">발행하면 현재 공개 버전은 보관 처리되고 이 초안이 즉시 공개됩니다. 발행 전에 시행일과 연락처를 다시 확인해 주세요.</p>
        <button className="mt-4 rounded-lg bg-[#ff5c00] px-5 py-3 text-sm font-semibold text-black disabled:opacity-50" type="submit" disabled={publishing}>
          {publishing ? "발행 중…" : "새 버전 발행"}
        </button>
        <ContentActionMessage state={publishState} />
      </form>
    </article>
  );
}
