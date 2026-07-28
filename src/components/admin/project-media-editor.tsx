"use client";

import { useActionState } from "react";

import { updateMediaAction, uploadMediaAction } from "@/app/admin/content-actions";
import type { AdminMediaAsset, ManagedProject } from "@/lib/content/types";

import { ContentActionMessage } from "./content-action-message";
import { MediaDeleteAction } from "./media-delete-action";

const initialState = { status: "idle" } as const;

export function ProjectImageUploadForm({ project }: { project: ManagedProject }) {
  const [state, formAction, pending] = useActionState(uploadMediaAction, initialState);

  return (
    <form action={formAction} className="mt-6 grid gap-5 rounded-2xl border border-zinc-200 bg-white p-6 md:grid-cols-2">
      <input type="hidden" name="projectId" value={project.id} />
      <input type="hidden" name="kind" value="project_image" />
      <input type="hidden" name="clientName" value="" />
      <label className="text-sm font-semibold text-zinc-700 md:col-span-2">
        이미지 파일
        <input className="mt-2 block w-full rounded-lg border border-zinc-300 px-3 py-2 font-normal" name="file" type="file" accept="image/jpeg,image/png,image/webp" required />
        <span className="mt-2 block font-normal text-zinc-500">JPG, PNG, WebP · 최대 10MB · 한 번에 1개</span>
      </label>
      <label className="text-sm font-semibold text-zinc-700">
        대체 텍스트
        <input className="mt-2 w-full rounded-lg border border-zinc-300 px-3 py-2 font-normal" name="altText" required maxLength={300} placeholder={`${project.title} 프로젝트 화면 설명`} />
      </label>
      <label className="text-sm font-semibold text-zinc-700">
        캡션
        <input className="mt-2 w-full rounded-lg border border-zinc-300 px-3 py-2 font-normal" name="caption" maxLength={500} />
      </label>
      <label className="text-sm font-semibold text-zinc-700">
        승인 상태
        <select className="mt-2 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 font-normal" name="approvalStatus" defaultValue="draft">
          <option value="draft">검토 전</option>
          <option value="approved">승인</option>
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
          {pending ? "업로드 중…" : "프로젝트 이미지 업로드"}
        </button>
        <ContentActionMessage state={state} />
      </div>
    </form>
  );
}

function ProjectImageAssetEditor({ asset, project }: { asset: AdminMediaAsset; project: ManagedProject }) {
  const [state, formAction, pending] = useActionState(updateMediaAction, initialState);

  return (
    <article className="grid gap-5 rounded-2xl border border-zinc-200 bg-white p-5 lg:grid-cols-[240px_1fr]">
      <div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="aspect-[4/3] w-full bg-zinc-100 object-contain" src={`/api/media/${asset.id}?admin=1`} alt={asset.altText} />
        <p className="mt-3 break-all text-sm text-zinc-500">{asset.originalName}</p>
      </div>
      <div>
        <form action={formAction} className="grid gap-4 md:grid-cols-2">
          <input type="hidden" name="id" value={asset.id} />
          <input type="hidden" name="kind" value="project_image" />
          <input type="hidden" name="projectId" value={project.id} />
          <input type="hidden" name="clientName" value="" />
          <label className="text-sm font-semibold text-zinc-700">
            대체 텍스트
            <input className="mt-2 w-full rounded-lg border border-zinc-300 px-3 py-2 font-normal" name="altText" defaultValue={asset.altText} required maxLength={300} />
          </label>
          <label className="text-sm font-semibold text-zinc-700">
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
          <div className="md:col-span-2">
            <button className="rounded-lg bg-zinc-950 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50" type="submit" disabled={pending}>{pending ? "저장 중…" : "이미지 정보 저장"}</button>
            <ContentActionMessage state={state} />
          </div>
        </form>
        <MediaDeleteAction id={asset.id} assetName={asset.originalName} />
      </div>
    </article>
  );
}

export function ProjectMediaEditor({ project, assets }: { project: ManagedProject; assets: AdminMediaAsset[] }) {
  return (
    <section className="mt-14" aria-labelledby="project-images-heading">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-zinc-500">Media</p>
          <h2 id="project-images-heading" className="mt-2 text-2xl font-semibold">프로젝트 이미지</h2>
        </div>
        <p className="text-sm text-zinc-500">승인과 공개가 모두 켜진 이미지가 순서대로 상세 페이지에 표시됩니다.</p>
      </div>
      <ProjectImageUploadForm project={project} />
      <div className="mt-6 grid gap-5">
        {assets.length ? assets.map((asset) => <ProjectImageAssetEditor key={asset.id} asset={asset} project={project} />) : <p className="rounded-2xl bg-zinc-100 px-6 py-10 text-center text-sm text-zinc-500">등록된 프로젝트 이미지가 없습니다.</p>}
      </div>
    </section>
  );
}
