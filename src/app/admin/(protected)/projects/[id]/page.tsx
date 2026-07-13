import Link from "next/link";
import { notFound } from "next/navigation";

import { ProjectEditor } from "@/components/admin/project-editor";
import { ProjectMediaEditor } from "@/components/admin/project-media-editor";
import { getAdminAccess } from "@/lib/auth/admin";
import { getAdminProject, listAdminProjectMedia } from "@/lib/content/admin";

export const dynamic = "force-dynamic";

export default async function AdminProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const access = await getAdminAccess();
  if (access.state !== "allowed") return null;

  const [project, media] = await Promise.all([
    getAdminProject(access.client, id),
    listAdminProjectMedia(access.client, id),
  ]);
  if (!project) notFound();

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <Link className="text-sm font-semibold text-zinc-500 hover:text-zinc-950" href="/admin/projects">← 프로젝트 목록</Link>
      <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-zinc-500">Portfolio</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">{project.title}</h1>
        </div>
        {project.detailPublished ? <Link className="text-sm font-semibold underline underline-offset-4" href={`/work/${project.slug}`} target="_blank">공개 페이지 확인</Link> : <span className="text-sm font-semibold text-zinc-500">상세 페이지 미공개</span>}
      </div>
      <ProjectEditor project={project} />
      <ProjectMediaEditor project={project} assets={media} />
    </main>
  );
}
