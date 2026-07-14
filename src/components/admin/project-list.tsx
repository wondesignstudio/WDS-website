import Link from "next/link";

import type { AdminMediaAsset, ManagedProject } from "@/lib/content/types";

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

function coverMap(media: AdminMediaAsset[]) {
  const covers = new Map<string, AdminMediaAsset>();

  for (const asset of media) {
    if (asset.kind === "project_image" && asset.projectId && !covers.has(asset.projectId)) {
      covers.set(asset.projectId, asset);
    }
  }

  return covers;
}

export function ProjectGallery({ projects, media }: { projects: ManagedProject[]; media: AdminMediaAsset[] }) {
  const covers = coverMap(media);

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
                  순서 {project.sortOrder}
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
              <th className="px-5 py-3 font-semibold">순서</th>
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
