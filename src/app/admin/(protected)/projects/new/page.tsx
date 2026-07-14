import Link from "next/link";

import { ProjectEditor } from "@/components/admin/project-editor";
import { getAdminAccess } from "@/lib/auth/admin";

export const dynamic = "force-dynamic";

export default async function NewAdminProjectPage() {
  const access = await getAdminAccess();
  if (access.state !== "allowed") return null;

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <Link className="text-sm font-semibold text-zinc-500 hover:text-zinc-950" href="/admin/projects">← 프로젝트 목록</Link>
      <div className="mt-6">
        <p className="text-sm font-semibold text-zinc-500">Portfolio</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">새 프로젝트 추가</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-600">프로젝트 기본 정보와 대표 이미지, 상세 이야기를 입력합니다.</p>
      </div>
      <ProjectEditor />
    </main>
  );
}
