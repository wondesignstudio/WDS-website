import { CreateLegalDraftButton, LegalEditor } from "@/components/admin/legal-editor";
import { getAdminAccess } from "@/lib/auth/admin";
import { listLegalDocuments } from "@/lib/content/admin";
import { LEGAL_DOCUMENT_LABELS } from "@/lib/content/legal-templates";
import { LEGAL_DOCUMENT_TYPES } from "@/lib/content/schema";

export const dynamic = "force-dynamic";

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("ko-KR", { dateStyle: "medium", timeZone: "Asia/Seoul" }).format(new Date(value));
}

export default async function AdminLegalPage() {
  const access = await getAdminAccess();
  if (access.state !== "allowed") return null;

  const documents = await listLegalDocuments(access.client);

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <div>
        <p className="text-sm font-semibold text-zinc-500">Legal</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">법적 문서 관리</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-600">공개 중인 문서는 직접 덮어쓰지 않습니다. 초안을 저장한 뒤 발행하면 이전 공개 버전은 자동으로 보관됩니다.</p>
      </div>

      <section className="mt-8 grid gap-4 md:grid-cols-2">
        {LEGAL_DOCUMENT_TYPES.map((type) => {
          const published = documents.find((document) => document.documentType === type && document.status === "published");
          const draft = documents.find((document) => document.documentType === type && document.status === "draft");
          return (
            <article key={type} className="rounded-2xl border border-zinc-200 bg-white p-5">
              <h2 className="text-xl font-semibold">{LEGAL_DOCUMENT_LABELS[type]}</h2>
              {published ? (
                <dl className="mt-4 grid gap-2 text-sm">
                  <div className="flex justify-between gap-4"><dt className="text-zinc-500">공개 버전</dt><dd className="font-semibold">{published.version}</dd></div>
                  <div className="flex justify-between gap-4"><dt className="text-zinc-500">시행일</dt><dd>{formatDate(published.effectiveAt)}</dd></div>
                </dl>
              ) : <p className="mt-4 text-sm text-zinc-500">공개된 버전이 없습니다.</p>}
              {!draft ? <div className="mt-5"><CreateLegalDraftButton documentType={type} /></div> : <p className="mt-5 text-sm font-semibold text-amber-800">편집 중인 초안이 있습니다.</p>}
            </article>
          );
        })}
      </section>

      <section className="mt-10 grid gap-8">
        {documents.filter((document) => document.status === "draft").map((draft) => (
          <LegalEditor key={draft.id} draft={draft} />
        ))}
      </section>
    </main>
  );
}
