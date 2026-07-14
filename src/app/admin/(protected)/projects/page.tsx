import Link from "next/link";

import { ProjectGallery, ProjectTable } from "@/components/admin/project-list";
import { getAdminAccess } from "@/lib/auth/admin";
import { listAdminMedia, listAdminProjects } from "@/lib/content/admin";

export const dynamic = "force-dynamic";

function ViewToggle({ view }: { view: "gallery" | "table" }) {
  return (
    <div className="flex rounded-xl bg-zinc-200/70 p-1" aria-label="프로젝트 보기 방식">
      <Link
        aria-current={view === "gallery" ? "page" : undefined}
        className={`flex min-h-10 items-center gap-2 rounded-lg px-3 text-sm font-semibold ${
          view === "gallery" ? "bg-white text-zinc-950 shadow-sm" : "text-zinc-600 hover:text-zinc-950"
        }`}
        href="/admin/projects?view=gallery"
      >
        <svg aria-hidden="true" className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
          <rect x="4" y="4" width="6" height="6" rx="1" />
          <rect x="14" y="4" width="6" height="6" rx="1" />
          <rect x="4" y="14" width="6" height="6" rx="1" />
          <rect x="14" y="14" width="6" height="6" rx="1" />
        </svg>
        갤러리
      </Link>
      <Link
        aria-current={view === "table" ? "page" : undefined}
        className={`flex min-h-10 items-center gap-2 rounded-lg px-3 text-sm font-semibold ${
          view === "table" ? "bg-white text-zinc-950 shadow-sm" : "text-zinc-600 hover:text-zinc-950"
        }`}
        href="/admin/projects?view=table"
      >
        <svg aria-hidden="true" className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
          <path strokeLinecap="round" d="M5 7h14M5 12h14M5 17h14" />
        </svg>
        테이블
      </Link>
    </div>
  );
}

export default async function AdminProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; created?: string }>;
}) {
  const params = await searchParams;
  const access = await getAdminAccess();
  if (access.state !== "allowed") return null;

  const [projects, media] = await Promise.all([
    listAdminProjects(access.client),
    listAdminMedia(access.client),
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

      <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm font-semibold text-zinc-500">총 {projects.length}개 프로젝트</p>
        <ViewToggle view={view} />
      </div>

      <section className="mt-5" aria-label={view === "gallery" ? "프로젝트 갤러리" : "프로젝트 테이블"}>
        {projects.length === 0 ? (
          <div className="rounded-2xl bg-white px-6 py-16 text-center">
            <p className="text-sm text-zinc-500">등록된 프로젝트가 없습니다.</p>
            <Link className="mt-4 inline-flex rounded-lg bg-zinc-950 px-4 py-2 text-sm font-semibold text-white" href="/admin/projects/new"><span className="text-white">첫 프로젝트 추가</span></Link>
          </div>
        ) : view === "gallery" ? (
          <ProjectGallery projects={projects} media={media} />
        ) : (
          <ProjectTable projects={projects} />
        )}
      </section>
    </main>
  );
}
