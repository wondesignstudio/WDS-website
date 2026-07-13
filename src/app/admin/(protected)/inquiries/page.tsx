import Link from "next/link";

import { getAdminAccess } from "@/lib/auth/admin";
import { listInquiries } from "@/lib/contact/admin";
import {
  getInquiryStatusLabel,
  getProjectTypeLabel,
  INQUIRY_STATUS_OPTIONS,
  PROJECT_TYPE_OPTIONS,
} from "@/lib/contact/schema";

export const dynamic = "force-dynamic";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Seoul",
  }).format(new Date(value));
}

function createNextHref(
  params: { q?: string; status?: string; projectType?: string },
  cursor: number,
) {
  const search = new URLSearchParams();
  if (params.q) search.set("q", params.q);
  if (params.status) search.set("status", params.status);
  if (params.projectType) search.set("projectType", params.projectType);
  search.set("cursor", String(cursor));
  return `/admin/inquiries?${search.toString()}`;
}

export default async function InquiryListPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    status?: string;
    projectType?: string;
    cursor?: string;
    deleted?: string;
  }>;
}) {
  const params = await searchParams;
  const access = await getAdminAccess();

  if (access.state !== "allowed") {
    return null;
  }

  const cursor = Number(params.cursor);
  const result = await listInquiries(access.client, {
    query: params.q,
    status: params.status,
    projectType: params.projectType,
    cursor: Number.isSafeInteger(cursor) && cursor > 0 ? cursor : undefined,
  });

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-500">
            Contact
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">문의 관리</h1>
        </div>
        <p className="text-sm text-zinc-500">한 페이지에 최대 25건</p>
      </div>

      {params.deleted === "1" ? (
        <p className="mt-6 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-800" role="status">
          문의를 영구 삭제했습니다.
        </p>
      ) : null}

      <form className="mt-8 grid gap-3 rounded-2xl border border-zinc-200 bg-white p-4 md:grid-cols-[minmax(220px,1fr)_200px_220px_auto]">
        <label className="text-sm font-semibold text-zinc-600">
          검색
          <input
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm font-normal"
            name="q"
            defaultValue={params.q ?? ""}
            minLength={2}
            placeholder="회사, 이름, 이메일, 전화"
          />
        </label>
        <label className="text-sm font-semibold text-zinc-600">
          상태
          <select
            className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-normal"
            name="status"
            defaultValue={params.status ?? ""}
          >
            <option value="">전체 상태</option>
            {INQUIRY_STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm font-semibold text-zinc-600">
          프로젝트 유형
          <select
            className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-normal"
            name="projectType"
            defaultValue={params.projectType ?? ""}
          >
            <option value="">전체 유형</option>
            {PROJECT_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <div className="flex items-end gap-2">
          <button className="rounded-lg bg-zinc-950 px-4 py-2 text-sm font-semibold text-white">
            적용
          </button>
          <Link className="rounded-lg border border-zinc-300 px-4 py-2 text-sm" href="/admin/inquiries">
            초기화
          </Link>
        </div>
      </form>

      <section className="mt-6 overflow-hidden rounded-2xl border border-zinc-200 bg-white">
        {result.items.length === 0 ? (
          <div className="px-6 py-16 text-center text-zinc-500">
            조건에 맞는 문의가 없습니다.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] border-collapse text-left text-sm">
              <thead className="bg-zinc-50 text-sm uppercase tracking-wide text-zinc-500">
                <tr>
                  <th className="px-5 py-3 font-semibold">접수</th>
                  <th className="px-5 py-3 font-semibold">회사 / 담당자</th>
                  <th className="px-5 py-3 font-semibold">프로젝트</th>
                  <th className="px-5 py-3 font-semibold">연락처</th>
                  <th className="px-5 py-3 font-semibold">상태</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {result.items.map((item) => (
                  <tr key={item.publicId} className="hover:bg-zinc-50">
                    <td className="whitespace-nowrap px-5 py-4 text-zinc-500">
                      {formatDate(item.createdAt)}
                    </td>
                    <td className="px-5 py-4">
                      <Link className="font-semibold hover:underline" href={`/admin/inquiries/${item.publicId}`}>
                        {item.companyName}
                      </Link>
                      <p className="mt-1 text-zinc-500">{item.contactName}</p>
                    </td>
                    <td className="px-5 py-4">{getProjectTypeLabel(item.projectType)}</td>
                    <td className="px-5 py-4">
                      <p>{item.email}</p>
                      {item.phone ? <p className="mt-1 text-zinc-500">{item.phone}</p> : null}
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold">
                        {getInquiryStatusLabel(item.status)}
                      </span>
                      {item.failedEmailCount > 0 ? (
                        <p
                          className="mt-2 text-sm font-semibold text-red-700"
                          role="status"
                        >
                          이메일 실패 {item.failedEmailCount}건
                        </p>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {result.nextCursor ? (
        <div className="mt-6 flex justify-end">
          <Link
            className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold"
            href={createNextHref(params, result.nextCursor)}
          >
            다음 25건
          </Link>
        </div>
      ) : null}
    </main>
  );
}
