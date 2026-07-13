"use client";

import { useActionState } from "react";

import { createProjectAction, updateProjectAction } from "@/app/admin/content-actions";
import type { ManagedProject } from "@/lib/content/types";

import { ContentActionMessage } from "./content-action-message";
import { MarkdownEditor } from "./markdown-editor";

const initialState = { status: "idle" } as const;

export function ProjectEditor({ project }: { project?: ManagedProject }) {
  const action = project ? updateProjectAction : createProjectAction;
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="mt-8 space-y-8">
      {project ? <input type="hidden" name="id" value={project.id} /> : null}

      <section className="grid gap-5 rounded-2xl border border-zinc-200 bg-white p-6 md:grid-cols-2">
        <label className="text-sm font-semibold text-zinc-700">
          프로젝트명
          <input className="mt-2 w-full rounded-lg border border-zinc-300 px-3 py-2 font-normal" name="title" defaultValue={project?.title} required maxLength={120} />
        </label>
        <label className="text-sm font-semibold text-zinc-700">
          슬러그
          <input className="mt-2 w-full rounded-lg border border-zinc-300 px-3 py-2 font-normal" name="slug" defaultValue={project?.slug} required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" maxLength={80} placeholder="project-name" />
        </label>
        <label className="text-sm font-semibold text-zinc-700">
          고객사명
          <input className="mt-2 w-full rounded-lg border border-zinc-300 px-3 py-2 font-normal" name="clientName" defaultValue={project?.clientName ?? ""} maxLength={120} />
        </label>
        <label className="text-sm font-semibold text-zinc-700">
          프로젝트 유형
          <input className="mt-2 w-full rounded-lg border border-zinc-300 px-3 py-2 font-normal" name="projectType" defaultValue={project?.type} required maxLength={120} />
        </label>
        <label className="text-sm font-semibold text-zinc-700 md:col-span-2">
          한 줄 설명
          <textarea className="mt-2 min-h-24 w-full rounded-lg border border-zinc-300 px-3 py-2 font-normal" name="summary" defaultValue={project?.summary} required maxLength={500} />
        </label>
        <label className="text-sm font-semibold text-zinc-700 md:col-span-2">
          수행 범위
          <textarea className="mt-2 min-h-28 w-full rounded-lg border border-zinc-300 px-3 py-2 font-normal" name="scopes" defaultValue={project?.scopes.join("\n")} required placeholder="한 줄에 하나씩 입력" />
        </label>
        <label className="text-sm font-semibold text-zinc-700">
          상태 문구
          <input className="mt-2 w-full rounded-lg border border-zinc-300 px-3 py-2 font-normal" name="statusLabel" defaultValue={project?.status ?? "출시"} required maxLength={40} />
        </label>
        <label className="text-sm font-semibold text-zinc-700">
          목록 순서
          <input className="mt-2 w-full rounded-lg border border-zinc-300 px-3 py-2 font-normal" name="sortOrder" type="number" defaultValue={project?.sortOrder ?? 0} required />
        </label>
        <label className="text-sm font-semibold text-zinc-700">
          비주얼 톤
          <select className="mt-2 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 font-normal" name="visualTone" defaultValue={project?.visualTone ?? "white"}>
            <option value="white">White</option>
            <option value="black">Black</option>
            <option value="orange">Orange</option>
          </select>
        </label>
        <div className="flex flex-wrap items-center gap-6 pt-7 text-sm">
          <label className="flex items-center gap-2 font-semibold">
            <input name="isPublished" type="checkbox" defaultChecked={project?.isPublished} />
            목록 공개
          </label>
          <label className="flex items-center gap-2 font-semibold">
            <input name="detailPublished" type="checkbox" defaultChecked={project?.detailPublished} />
            상세 공개
          </label>
        </div>
      </section>

      {!project ? (
        <section className="grid gap-5 rounded-2xl border border-zinc-200 bg-white p-6 md:grid-cols-2">
          <div className="md:col-span-2">
            <h2 className="text-xl font-semibold">대표 이미지</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-500">프로젝트를 만들면서 첫 이미지를 함께 등록할 수 있습니다. 추가 이미지는 저장 후 프로젝트 편집 화면에서 관리합니다.</p>
          </div>
          <label className="text-sm font-semibold text-zinc-700 md:col-span-2">
            이미지 파일 <span className="font-normal text-zinc-500">(선택)</span>
            <input className="mt-2 block w-full rounded-lg border border-zinc-300 px-3 py-2 font-normal" name="projectImage" type="file" accept="image/jpeg,image/png,image/webp" />
            <span className="mt-2 block font-normal text-zinc-500">JPG, PNG, WebP · 최대 10MB · 한 번에 1개</span>
          </label>
          <label className="text-sm font-semibold text-zinc-700">
            이미지 대체 텍스트
            <input className="mt-2 w-full rounded-lg border border-zinc-300 px-3 py-2 font-normal" name="imageAltText" maxLength={300} placeholder="이미지를 선택했다면 필수" />
          </label>
          <label className="text-sm font-semibold text-zinc-700">
            이미지 캡션
            <input className="mt-2 w-full rounded-lg border border-zinc-300 px-3 py-2 font-normal" name="imageCaption" maxLength={500} />
          </label>
          <label className="flex items-center gap-2 text-sm font-semibold md:col-span-2">
            <input name="publishProjectImage" type="checkbox" />
            업로드와 동시에 승인·공개
          </label>
        </section>
      ) : null}

      <section className="grid gap-5 rounded-2xl border border-zinc-200 bg-white p-6">
        <h2 className="text-xl font-semibold">상세 이야기</h2>
        {[
          ["challenge", "고객의 과제", project?.challenge],
          ["roleDescription", "WDS의 역할", project?.roleDescription],
          ["approach", "접근 방식", project?.approach],
          ["outcome", "결과", project?.outcome],
        ].map(([name, label, value]) => <MarkdownEditor key={name} name={name ?? ""} label={label ?? ""} defaultValue={value ?? ""} />)}
      </section>

      <div className="flex items-center gap-4">
        <button className="rounded-lg bg-zinc-950 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50" type="submit" disabled={pending}>
          {pending ? "저장 중…" : project ? "프로젝트 저장" : "프로젝트 추가"}
        </button>
      </div>
      <ContentActionMessage state={state} />
    </form>
  );
}
