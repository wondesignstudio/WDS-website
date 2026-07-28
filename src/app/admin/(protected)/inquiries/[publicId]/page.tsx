import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";

import { DeleteInquiryForm } from "@/components/admin/delete-inquiry-form";
import { MemoEditor } from "@/components/admin/memo-editor";
import { RetryFailedEmailsForm } from "@/components/admin/retry-failed-emails-form";
import { StatusEditor } from "@/components/admin/status-editor";
import { getAdminAccess } from "@/lib/auth/admin";
import { getInquiryDetail } from "@/lib/contact/admin";
import {
  getBudgetRangeLabel,
  getInquiryStatusLabel,
  getProjectTypeLabel,
} from "@/lib/contact/schema";

export const dynamic = "force-dynamic";

function formatDate(value: string | null) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "Asia/Seoul",
  }).format(new Date(value));
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-2 border-b border-zinc-100 py-4 last:border-0 md:grid-cols-[180px_1fr]">
      <dt className="text-sm font-medium text-zinc-500">{label}</dt>
      <dd className="whitespace-pre-wrap break-words text-sm leading-7 text-zinc-900">{children}</dd>
    </div>
  );
}

export default async function InquiryDetailPage({
  params,
}: {
  params: Promise<{ publicId: string }>;
}) {
  const { publicId } = await params;
  if (!z.string().uuid().safeParse(publicId).success) {
    notFound();
  }

  const access = await getAdminAccess();
  if (access.state !== "allowed") {
    return null;
  }

  const inquiry = await getInquiryDetail(access.client, publicId);
  if (!inquiry) {
    notFound();
  }

  const failedDeliveries = inquiry.deliveries.filter(
    (delivery) => delivery.status === "failed",
  );

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <Link className="text-sm font-medium text-zinc-600 hover:text-zinc-950" href="/admin/inquiries">
        ← 문의 목록
      </Link>

      <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm text-zinc-500">{formatDate(inquiry.createdAt)} 접수</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">{inquiry.companyName}</h1>
          <p className="mt-2 text-zinc-600">{inquiry.contactName} · {inquiry.email}</p>
        </div>
        <span className="rounded-full bg-zinc-950 px-4 py-2 text-sm font-semibold text-white">
          {getInquiryStatusLabel(inquiry.status)}
        </span>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="grid gap-6">
          <section className="rounded-2xl border border-zinc-200 bg-white p-6">
            <h2 className="text-lg font-semibold">문의 내용</h2>
            <dl className="mt-3">
              <DetailRow label="프로젝트 유형">{getProjectTypeLabel(inquiry.projectType)}</DetailRow>
              <DetailRow label="예산 범위">{getBudgetRangeLabel(inquiry.budgetRange)}</DetailRow>
              <DetailRow label="문제와 배경">{inquiry.projectBackground}</DetailRow>
              <DetailRow label="예상 업무 범위">{inquiry.expectedScope || "—"}</DetailRow>
              <DetailRow label="희망 일정">{inquiry.desiredSchedule || "—"}</DetailRow>
              <DetailRow label="참고 링크">
                {inquiry.referenceLinks.length ? (
                  <ul className="grid gap-1">
                    {inquiry.referenceLinks.map((link) => (
                      <li key={link}>
                        <a className="underline" href={link} target="_blank" rel="noreferrer">
                          {link}
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : "—"}
              </DetailRow>
            </dl>
          </section>

          <section className="rounded-2xl border border-zinc-200 bg-white p-6">
            <h2 className="text-lg font-semibold">연락 및 동의</h2>
            <dl className="mt-3">
              <DetailRow label="이메일"><a className="underline" href={`mailto:${inquiry.email}`}>{inquiry.email}</a></DetailRow>
              <DetailRow label="전화">{inquiry.phone || "—"}</DetailRow>
              <DetailRow label="개인정보 동의">{formatDate(inquiry.privacyConsentAt)} · {inquiry.privacyPolicyVersion}</DetailRow>
              <DetailRow label="자동 삭제 예정">{formatDate(inquiry.purgeAfter)}</DetailRow>
            </dl>
          </section>

          <section className="rounded-2xl border border-zinc-200 bg-white p-6">
            <h2 className="text-lg font-semibold">이메일 처리</h2>
            {failedDeliveries.length > 0 ? (
              <div
                className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-950"
                role="alert"
              >
                <p className="font-semibold">
                  최종 발송 실패 {failedDeliveries.length}건을 확인해 주세요.
                </p>
                <p className="mt-1 leading-6">
                  발송 설정과 오류 코드를 확인한 뒤 재시도 대기열에 넣을 수 있습니다.
                </p>
                <RetryFailedEmailsForm
                  publicId={inquiry.publicId}
                  failedCount={failedDeliveries.length}
                />
              </div>
            ) : null}
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {inquiry.deliveries.map((delivery) => (
                <article
                  key={delivery.id}
                  className={
                    delivery.status === "failed"
                      ? "rounded-xl border border-red-200 bg-red-50 p-4 text-sm"
                      : "rounded-xl bg-zinc-50 p-4 text-sm"
                  }
                >
                  <p className="font-semibold">{delivery.kind === "internal" ? "내부 알림" : "사용자 자동회신"}</p>
                  <p className="mt-2 text-zinc-600">상태: {delivery.status} · 시도 {delivery.attemptCount}회</p>
                  <p className="mt-1 text-zinc-600">발송: {formatDate(delivery.sentAt)}</p>
                  {delivery.lastErrorCode ? <p className="mt-1 text-red-700">오류: {delivery.lastErrorCode}</p> : null}
                </article>
              ))}
            </div>
          </section>
        </div>

        <aside className="grid content-start gap-6">
          <section className="rounded-2xl border border-zinc-200 bg-white p-5">
            <h2 className="mb-4 text-lg font-semibold">상태 관리</h2>
            <StatusEditor
              publicId={inquiry.publicId}
              status={inquiry.status}
              customerRecordReference={inquiry.customerRecordReference}
              customerRecordTransferredAt={inquiry.customerRecordTransferredAt}
            />
          </section>
          <section className="rounded-2xl border border-zinc-200 bg-white p-5">
            <h2 className="mb-4 text-lg font-semibold">메모</h2>
            <MemoEditor publicId={inquiry.publicId} memo={inquiry.internalMemo} />
            {inquiry.memoUpdatedAt ? <p className="mt-3 text-sm text-zinc-500">최근 저장 {formatDate(inquiry.memoUpdatedAt)}</p> : null}
          </section>
          <section className="rounded-2xl border border-red-200 bg-white p-5">
            <h2 className="font-semibold text-red-800">영구 삭제</h2>
            <p className="my-3 text-sm leading-6 text-zinc-600">문의와 연결된 이메일 처리 기록을 즉시 삭제합니다.</p>
            <DeleteInquiryForm publicId={inquiry.publicId} />
          </section>
        </aside>
      </div>
    </main>
  );
}
