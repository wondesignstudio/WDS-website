"use client";

import { useActionState } from "react";

import {
  updateMediaAction,
  uploadMediaAction,
} from "@/app/admin/content-actions";
import type { AdminMediaAsset, ManagedProject } from "@/lib/content/types";

import { ContentActionMessage } from "./content-action-message";
import { MediaDeleteAction } from "./media-delete-action";

const initialState = { status: "idle" } as const;

function ProjectSelect({ projects, defaultValue }: { projects: ManagedProject[]; defaultValue?: string | null }) {
  return (
    <select className="mt-2 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 font-normal" name="projectId" defaultValue={defaultValue ?? ""}>
      <option value="">연결 안 함</option>
      {projects.map((project) => (
        <option key={project.id} value={project.id}>{project.title}</option>
      ))}
    </select>
  );
}

export function MediaUploadForm({ projects }: { projects: ManagedProject[] }) {
  const [state, formAction, pending] = useActionState(uploadMediaAction, initialState);

  return (
    <form action={formAction} className="mt-8 grid gap-5 rounded-2xl border border-zinc-200 bg-white p-6 md:grid-cols-2">
      <label className="text-sm font-semibold text-zinc-700 md:col-span-2">
        이미지 파일
        <input className="mt-2 block w-full rounded-lg border border-zinc-300 px-3 py-2 font-normal" name="file" type="file" accept="image/jpeg,image/png,image/webp" required />
        <span className="mt-2 block font-normal text-zinc-500">JPG, PNG, WebP · 최대 10MB</span>
      </label>
      <label className="text-sm font-semibold text-zinc-700">
        자산 유형
        <select className="mt-2 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 font-normal" name="kind" defaultValue="project_image">
          <option value="project_image">프로젝트 이미지</option>
          <option value="client_logo">고객 로고</option>
        </select>
      </label>
      <label className="text-sm font-semibold text-zinc-700">
        연결 프로젝트
        <ProjectSelect projects={projects} />
      </label>
      <label className="text-sm font-semibold text-zinc-700">
        고객사명
        <input className="mt-2 w-full rounded-lg border border-zinc-300 px-3 py-2 font-normal" name="clientName" maxLength={120} placeholder="고객 로고일 때 필수" />
      </label>
      <label className="text-sm font-semibold text-zinc-700">
        대체 텍스트
        <input className="mt-2 w-full rounded-lg border border-zinc-300 px-3 py-2 font-normal" name="altText" required maxLength={300} />
      </label>
      <label className="text-sm font-semibold text-zinc-700 md:col-span-2">
        캡션
        <input className="mt-2 w-full rounded-lg border border-zinc-300 px-3 py-2 font-normal" name="caption" maxLength={500} />
      </label>
      <label className="text-sm font-semibold text-zinc-700">
        승인 상태
        <select className="mt-2 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 font-normal" name="approvalStatus" defaultValue="draft">
          <option value="draft">검토 전</option>
          <option value="approved">승인</option>
          <option value="rejected">사용 안 함</option>
        </select>
      </label>
      <label className="text-sm font-semibold text-zinc-700">
        노출 순서
        <input className="mt-2 w-full rounded-lg border border-zinc-300 px-3 py-2 font-normal" name="sortOrder" type="number" defaultValue={0} required />
      </label>
      <label className="flex items-center gap-2 text-sm font-semibold md:col-span-2">
        <input name="isPublished" type="checkbox" />
        공개 사이트에 노출
      </label>
      <div className="md:col-span-2">
        <button className="rounded-lg bg-zinc-950 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50" type="submit" disabled={pending}>
          {pending ? "업로드 중…" : "이미지 업로드"}
        </button>
        <ContentActionMessage state={state} />
      </div>
    </form>
  );
}

export function MediaAssetEditor({ asset, projects }: { asset: AdminMediaAsset; projects: ManagedProject[] }) {
  const [state, formAction, pending] = useActionState(updateMediaAction, initialState);

  return (
    <article className="grid gap-5 rounded-2xl border border-zinc-200 bg-white p-5 lg:grid-cols-[240px_1fr]">
      <div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="aspect-[4/3] w-full bg-zinc-100 object-contain" src={`/api/media/${asset.id}?admin=1`} alt={asset.altText} />
        <p className="mt-3 break-all text-sm text-zinc-500">{asset.originalName}</p>
        <p className="mt-1 text-xs text-zinc-400">{(asset.byteSize / 1024 / 1024).toFixed(2)}MB</p>
      </div>
      <div>
        <form action={formAction} className="grid gap-4 md:grid-cols-2">
          <input type="hidden" name="id" value={asset.id} />
          <label className="text-sm font-semibold text-zinc-700">
            자산 유형
            <select className="mt-2 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 font-normal" name="kind" defaultValue={asset.kind}>
              <option value="project_image">프로젝트 이미지</option>
              <option value="client_logo">고객 로고</option>
            </select>
          </label>
          <label className="text-sm font-semibold text-zinc-700">
            연결 프로젝트
            <ProjectSelect projects={projects} defaultValue={asset.projectId} />
          </label>
          <label className="text-sm font-semibold text-zinc-700">
            고객사명
            <input className="mt-2 w-full rounded-lg border border-zinc-300 px-3 py-2 font-normal" name="clientName" defaultValue={asset.clientName ?? ""} maxLength={120} />
          </label>
          <label className="text-sm font-semibold text-zinc-700">
            대체 텍스트
            <input className="mt-2 w-full rounded-lg border border-zinc-300 px-3 py-2 font-normal" name="altText" defaultValue={asset.altText} required maxLength={300} />
          </label>
          <label className="text-sm font-semibold text-zinc-700 md:col-span-2">
            캡션
            <input className="mt-2 w-full rounded-lg border border-zinc-300 px-3 py-2 font-normal" name="caption" defaultValue={asset.caption} maxLength={500} />
          </label>
          <label className="text-sm font-semibold text-zinc-700">
            승인 상태
            <select className="mt-2 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 font-normal" name="approvalStatus" defaultValue={asset.approvalStatus}>
              <option value="draft">검토 전</option>
              <option value="approved">승인</option>
              <option value="rejected">사용 안 함</option>
            </select>
          </label>
          <label className="text-sm font-semibold text-zinc-700">
            노출 순서
            <input className="mt-2 w-full rounded-lg border border-zinc-300 px-3 py-2 font-normal" name="sortOrder" type="number" defaultValue={asset.sortOrder} required />
          </label>
          <label className="flex items-center gap-2 text-sm font-semibold md:col-span-2">
            <input name="isPublished" type="checkbox" defaultChecked={asset.isPublished} />
            공개 사이트에 노출
          </label>
          <div className="flex items-center gap-3 md:col-span-2">
            <button className="rounded-lg bg-zinc-950 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50" type="submit" disabled={pending}>
              {pending ? "저장 중…" : "정보 저장"}
            </button>
          </div>
          <div className="md:col-span-2"><ContentActionMessage state={state} /></div>
        </form>
        <MediaDeleteAction id={asset.id} assetName={asset.originalName} />
      </div>
    </article>
  );
}
