import Link from "next/link";

import { MediaUploadForm } from "@/components/admin/media-manager";
import { getAdminAccess } from "@/lib/auth/admin";
import { listAdminProjects } from "@/lib/content/admin";

export const dynamic = "force-dynamic";

export default async function NewAdminMediaPage() {
  const access = await getAdminAccess();
  if (access.state !== "allowed") return null;
  const projects = await listAdminProjects(access.client);

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <Link className="text-sm font-semibold text-zinc-500 hover:text-zinc-950" href="/admin/media">← 미디어 목록</Link>
      <div className="mt-6">
        <p className="text-sm font-semibold text-zinc-500">Assets</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">미디어 추가</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-600">프로젝트 이미지 또는 고객 로고를 비공개 Storage에 업로드합니다.</p>
      </div>
      <MediaUploadForm projects={projects} />
    </main>
  );
}
