import { MediaAssetEditor, MediaUploadForm } from "@/components/admin/media-manager";
import { getAdminAccess } from "@/lib/auth/admin";
import { listAdminMedia, listAdminProjects } from "@/lib/content/admin";

export const dynamic = "force-dynamic";

export default async function AdminMediaPage() {
  const access = await getAdminAccess();
  if (access.state !== "allowed") return null;

  const [projects, assets] = await Promise.all([
    listAdminProjects(access.client),
    listAdminMedia(access.client),
  ]);

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <div>
        <p className="text-sm font-semibold text-zinc-500">Assets</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">미디어 관리</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-600">업로드한 파일은 비공개 저장소에 보관됩니다. 승인 상태가 ‘승인’이고 공개가 켜진 파일만 공개 페이지에서 읽을 수 있습니다.</p>
      </div>

      <MediaUploadForm projects={projects} />

      <section className="mt-14">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-2xl font-semibold">업로드된 자산</h2>
          <p className="text-sm text-zinc-500">{assets.length}개</p>
        </div>
        <div className="mt-6 grid gap-5">
          {assets.length === 0 ? (
            <p className="rounded-2xl border border-zinc-200 bg-white px-6 py-12 text-center text-zinc-500">업로드된 자산이 없습니다.</p>
          ) : assets.map((asset) => (
            <MediaAssetEditor key={asset.id} asset={asset} projects={projects} />
          ))}
        </div>
      </section>
    </main>
  );
}
