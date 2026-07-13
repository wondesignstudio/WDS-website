import Link from "next/link";

import { ProjectEditor } from "@/components/admin/project-editor";
import { getAdminAccess } from "@/lib/auth/admin";
import { listAdminProjects } from "@/lib/content/admin";

export const dynamic = "force-dynamic";

export default async function AdminProjectsPage() {
  const access = await getAdminAccess();
  if (access.state !== "allowed") return null;

  const projects = await listAdminProjects(access.client);

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-zinc-500">Portfolio</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">프로젝트 관리</h1>
        </div>
        <p className="text-sm text-zinc-500">목록 공개와 상세 공개를 분리해 관리합니다.</p>
      </div>

      <section className="mt-8 overflow-hidden rounded-2xl border border-zinc-200 bg-white">
        {projects.length === 0 ? (
          <p className="px-6 py-12 text-center text-zinc-500">등록된 프로젝트가 없습니다.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-left text-sm">
              <thead className="bg-zinc-50 text-zinc-500">
                <tr>
                  <th className="px-5 py-3 font-semibold">순서</th>
                  <th className="px-5 py-3 font-semibold">프로젝트</th>
                  <th className="px-5 py-3 font-semibold">유형</th>
                  <th className="px-5 py-3 font-semibold">공개 상태</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {projects.map((project) => (
                  <tr key={project.id}>
                    <td className="px-5 py-4 text-zinc-500">{project.sortOrder}</td>
                    <td className="px-5 py-4">
                      <Link className="font-semibold hover:underline" href={`/admin/projects/${project.id}`}>{project.title}</Link>
                      <p className="mt-1 text-zinc-500">/{project.slug}</p>
                    </td>
                    <td className="px-5 py-4">{project.type}</td>
                    <td className="px-5 py-4">
                      <span className="font-semibold">{project.isPublished ? "목록 공개" : "비공개"}</span>
                      <p className="mt-1 text-zinc-500">{project.detailPublished ? "상세 공개" : "상세 비공개"}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="mt-14">
        <h2 className="text-2xl font-semibold">새 프로젝트 추가</h2>
        <ProjectEditor />
      </section>
    </main>
  );
}
