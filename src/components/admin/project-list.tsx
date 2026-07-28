"use client";

import Link from "next/link";
import { useState } from "react";

import type { AdminProjectCover, ManagedProject } from "@/lib/content/types";

import { ProjectRowActions } from "./project-row-actions";

function ProjectStatus({ project }: { project: ManagedProject }) {
  return (
    <div className="flex flex-wrap gap-2">
      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
        project.isPublished ? "bg-emerald-50 text-emerald-800" : "bg-zinc-100 text-zinc-600"
      }`}>
        {project.isPublished ? "목록 공개" : "비공개"}
      </span>
      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
        project.detailPublished ? "bg-blue-50 text-blue-800" : "bg-zinc-100 text-zinc-600"
      }`}>
        {project.detailPublished ? "상세 공개" : "상세 비공개"}
      </span>
    </div>
  );
}

function coverMap(media: AdminProjectCover[]) {
  const covers = new Map<string, AdminProjectCover>();

  for (const asset of media) {
    if (!covers.has(asset.projectId)) {
      covers.set(asset.projectId, asset);
    }
  }

  return covers;
}

export function ProjectGallery({ projects, covers: projectCovers }: { projects: ManagedProject[]; covers: AdminProjectCover[] }) {
  const covers = coverMap(projectCovers);

  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {projects.map((project) => {
        const cover = covers.get(project.id);

        return (
          <article key={project.id} className="overflow-hidden rounded-2xl bg-white shadow-[0_1px_0_rgba(0,0,0,0.06)]">
            <Link className="group block" href={`/admin/projects/${project.id}`}>
              <div className="relative aspect-[4/3] overflow-hidden bg-zinc-100">
                {cover ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                    src={`/api/media/${cover.id}?admin=1`}
                    alt={cover.altText}
                  />
                ) : (
                  <div className="flex size-full items-center justify-center text-sm font-semibold text-zinc-400">
                    대표 이미지 없음
                  </div>
                )}
                <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-zinc-800 backdrop-blur">
                  노출 순서 {project.sortOrder}
                </span>
              </div>
              <div className="p-5">
                <p className="text-sm font-semibold text-zinc-500">{project.type}</p>
                <h2 className="mt-2 text-xl font-semibold tracking-tight group-hover:underline group-hover:underline-offset-4">
                  {project.title}
                </h2>
                <p className="mt-2 line-clamp-2 min-h-12 text-sm leading-6 text-zinc-600">{project.summary}</p>
                <div className="mt-4"><ProjectStatus project={project} /></div>
              </div>
            </Link>
            <div className="px-5 pb-5">
              <ProjectRowActions id={project.id} title={project.title} />
            </div>
          </article>
        );
      })}
    </div>
  );
}

export function ProjectTable({ projects }: { projects: ManagedProject[] }) {
  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-[0_1px_0_rgba(0,0,0,0.06)]">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[880px] border-collapse text-left text-sm">
          <thead className="bg-zinc-50 text-zinc-500">
            <tr>
              <th className="px-5 py-3 font-semibold">노출 순서</th>
              <th className="px-5 py-3 font-semibold">프로젝트</th>
              <th className="px-5 py-3 font-semibold">유형</th>
              <th className="px-5 py-3 font-semibold">공개 상태</th>
              <th className="px-5 py-3 font-semibold">관리</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {projects.map((project) => (
              <tr key={project.id} className="hover:bg-zinc-50/70">
                <td className="px-5 py-4 text-zinc-500">{project.sortOrder}</td>
                <td className="px-5 py-4">
                  <Link className="font-semibold hover:underline" href={`/admin/projects/${project.id}`}>{project.title}</Link>
                  <p className="mt-1 text-zinc-500">/{project.slug}</p>
                </td>
                <td className="px-5 py-4">{project.type}</td>
                <td className="px-5 py-4"><ProjectStatus project={project} /></td>
                <td className="px-5 py-4"><ProjectRowActions id={project.id} title={project.title} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function ProjectList({
  projects,
  covers,
  initialView = "gallery",
}: {
  projects: ManagedProject[];
  covers: AdminProjectCover[];
  initialView?: "gallery" | "table";
}) {
  const [view, setView] = useState(initialView);

  return (
    <>
      <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm font-semibold text-zinc-500">총 {projects.length}개 프로젝트</p>
        <div className="flex rounded-xl bg-zinc-200/70 p-1" aria-label="프로젝트 보기 방식">
          <button
            aria-pressed={view === "gallery"}
            className={`flex min-h-10 items-center gap-2 rounded-lg px-3 text-sm font-semibold ${
              view === "gallery" ? "bg-white text-zinc-950 shadow-sm" : "text-zinc-600 hover:text-zinc-950"
            }`}
            type="button"
            onClick={() => setView("gallery")}
          >
            <svg aria-hidden="true" className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
              <rect x="4" y="4" width="6" height="6" rx="1" />
              <rect x="14" y="4" width="6" height="6" rx="1" />
              <rect x="4" y="14" width="6" height="6" rx="1" />
              <rect x="14" y="14" width="6" height="6" rx="1" />
            </svg>
            갤러리
          </button>
          <button
            aria-pressed={view === "table"}
            className={`flex min-h-10 items-center gap-2 rounded-lg px-3 text-sm font-semibold ${
              view === "table" ? "bg-white text-zinc-950 shadow-sm" : "text-zinc-600 hover:text-zinc-950"
            }`}
            type="button"
            onClick={() => setView("table")}
          >
            <svg aria-hidden="true" className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
              <path strokeLinecap="round" d="M5 7h14M5 12h14M5 17h14" />
            </svg>
            테이블
          </button>
        </div>
      </div>
      <section className="mt-5" aria-label={view === "gallery" ? "프로젝트 갤러리" : "프로젝트 테이블"}>
        {view === "gallery" ? (
          <ProjectGallery projects={projects} covers={covers} />
        ) : (
          <ProjectTable projects={projects} />
        )}
      </section>
    </>
  );
}
