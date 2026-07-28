import Link from "next/link";

import {
  getBudgetRangeLabel,
  getInquiryStatusLabel,
  getProjectTypeLabel,
} from "@/lib/contact/schema";
import type { InquiryListItem } from "@/lib/contact/types";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Seoul",
  }).format(new Date(value));
}

export function InquiryListTable({ items }: { items: InquiryListItem[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[1180px] border-collapse text-left text-sm">
        <thead className="bg-zinc-50 text-sm uppercase tracking-wide text-zinc-500">
          <tr>
            <th className="px-5 py-3 font-semibold">접수</th>
            <th className="px-5 py-3 font-semibold">회사 / 담당자</th>
            <th className="px-5 py-3 font-semibold">문의 요약</th>
            <th className="px-5 py-3 font-semibold">연락처</th>
            <th className="px-5 py-3 font-semibold">상태</th>
            <th className="px-5 py-3 font-semibold">관리</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100">
          {items.map((item) => (
            <tr key={item.publicId} className="hover:bg-zinc-50">
              <td className="whitespace-nowrap px-5 py-4 text-zinc-500">{formatDate(item.createdAt)}</td>
              <td className="px-5 py-4">
                <Link className="font-semibold hover:underline" href={`/admin/inquiries/${item.publicId}`}>
                  {item.companyName}
                </Link>
                <p className="mt-1 text-zinc-500">{item.contactName}</p>
              </td>
              <td className="max-w-sm px-5 py-4">
                <p className="font-semibold">{getProjectTypeLabel(item.projectType)} · {getBudgetRangeLabel(item.budgetRange)}</p>
                <p className="mt-2 line-clamp-2 leading-6 text-zinc-500">{item.projectBackground}</p>
              </td>
              <td className="px-5 py-4">
                <p>{item.email}</p>
                {item.phone ? <p className="mt-1 text-zinc-500">{item.phone}</p> : null}
              </td>
              <td className="px-5 py-4">
                <span className="inline-flex rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold">
                  {getInquiryStatusLabel(item.status)}
                </span>
                {item.failedEmailCount > 0 ? (
                  <p className="mt-2 text-sm font-semibold text-red-700" role="status">
                    이메일 실패 {item.failedEmailCount}건
                  </p>
                ) : null}
              </td>
              <td className="px-5 py-4">
                <Link
                  className="inline-flex min-h-10 items-center rounded-lg bg-zinc-950 px-4 text-sm font-semibold text-white"
                  href={`/admin/inquiries/${item.publicId}`}
                  aria-label={`${item.companyName} 문의 상세 보기`}
                >
                  <span className="text-white">상세 보기</span>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
