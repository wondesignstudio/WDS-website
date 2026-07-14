import Link from "next/link";

import { ProjectList } from "@/components/admin/project-list";
import { getAdminAccess } from "@/lib/auth/admin";
import { listAdminProjectCovers, listAdminProjects } from "@/lib/content/admin";

export const dynamic = "force-dynamic";

export default async function AdminProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; created?: string }>;
}) {
  const params = await searchParams;
  const access = await getAdminAccess();
  if (access.state !== "allowed") return null;

  const [projects, covers] = await Promise.all([
    listAdminProjects(access.client),
    listAdminProjectCovers(access.client),
  ]);
  const view = params.view === "table" ? "table" : "gallery";

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="text-sm font-semibold text-zinc-500">Portfolio</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">프로젝트 관리</h1>
          <p className="mt-3 text-sm text-zinc-500">목록 공개와 상세 공개를 분리해 관리합니다.</p>
        </div>
        <Link className="rounded-xl bg-zinc-950 px-5 py-3 text-sm font-semibold text-white" href="/admin/projects/new">
          <span className="text-white">새 프로젝트 추가</span>
        </Link>
      </div>

      {params.created === "1" ? (
        <p className="mt-6 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800" role="status">새 프로젝트를 추가했습니다.</p>
      ) : null}

      {projects.length === 0 ? (
        <section className="mt-8" aria-label="프로젝트 목록">
          <div className="rounded-2xl bg-white px-6 py-16 text-center">
            <p className="text-sm text-zinc-500">등록된 프로젝트가 없습니다.</p>
            <Link className="mt-4 inline-flex rounded-lg bg-zinc-950 px-4 py-2 text-sm font-semibold text-white" href="/admin/projects/new"><span className="text-white">첫 프로젝트 추가</span></Link>
          </div>
        </section>
      ) : (
        <ProjectList projects={projects} covers={covers} initialView={view} />
      )}
    </main>
  );
}
