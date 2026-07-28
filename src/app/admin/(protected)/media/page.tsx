import Link from "next/link";

import { MediaAssetEditor } from "@/components/admin/media-manager";
import { getAdminAccess } from "@/lib/auth/admin";
import { listAdminMedia, listAdminProjects } from "@/lib/content/admin";

export const dynamic = "force-dynamic";

export default async function AdminMediaPage({
  searchParams,
}: {
  searchParams: Promise<{ uploaded?: string }>;
}) {
  const params = await searchParams;
  const access = await getAdminAccess();
  if (access.state !== "allowed") return null;

  const [projects, assets] = await Promise.all([
    listAdminProjects(access.client),
    listAdminMedia(access.client),
  ]);

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="text-sm font-semibold text-zinc-500">Assets</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">미디어 관리</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-600">승인 상태가 ‘승인’이고 공개가 켜진 파일만 공개 페이지에서 읽을 수 있습니다.</p>
        </div>
        <Link className="rounded-xl bg-zinc-950 px-5 py-3 text-sm font-semibold text-white" href="/admin/media/new"><span className="text-white">미디어 추가</span></Link>
      </div>

      {params.uploaded === "1" ? (
        <p className="mt-6 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800" role="status">미디어를 추가했습니다.</p>
      ) : null}

      <section className="mt-10">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-2xl font-semibold">업로드된 자산</h2>
          <p className="text-sm text-zinc-500">{assets.length}개</p>
        </div>
        <div className="mt-6 grid gap-5">
          {assets.length === 0 ? (
            <div className="rounded-2xl bg-white px-6 py-16 text-center">
              <p className="text-sm text-zinc-500">업로드된 자산이 없습니다.</p>
              <Link className="mt-4 inline-flex rounded-lg bg-zinc-950 px-4 py-2 text-sm font-semibold text-white" href="/admin/media/new"><span className="text-white">첫 미디어 추가</span></Link>
            </div>
          ) : assets.map((asset) => (
            <MediaAssetEditor key={asset.id} asset={asset} projects={projects} />
          ))}
        </div>
      </section>
    </main>
  );
}
