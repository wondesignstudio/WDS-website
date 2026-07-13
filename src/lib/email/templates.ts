import { getProjectTypeLabel } from "@/lib/contact/schema";
import type { StoredInquiryForEmail } from "@/lib/contact/types";

export type RenderedEmail = {
  subject: string;
  text: string;
  html: string;
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatKoreanDate(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Seoul",
  }).format(new Date(value));
}

export function renderInternalNotification(
  inquiry: StoredInquiryForEmail,
  adminUrl: string,
  subjectPrefix: string,
): RenderedEmail {
  const projectType = getProjectTypeLabel(inquiry.projectType);
  const subject = `${subjectPrefix}[WDS 문의] 새 상담 요청 · ${projectType}`;
  const text = [
    "새 상담 문의가 접수되었습니다.",
    "",
    `문의 ID: ${inquiry.publicId}`,
    `접수 시각: ${formatKoreanDate(inquiry.createdAt)}`,
    `프로젝트 유형: ${projectType}`,
    "",
    "개인정보가 포함된 상세 내용은 관리자에서 확인해 주세요.",
    `관리자에서 확인: ${adminUrl}`,
  ].join("\n");

  const html = `
    <div style="font-family:Arial,'Apple SD Gothic Neo',sans-serif;color:#18181b;line-height:1.6;max-width:760px;margin:0 auto">
      <h1 style="font-size:24px;margin:0 0 16px">새 상담 문의</h1>
      <p>문의 ID: <strong>${escapeHtml(inquiry.publicId)}</strong></p>
      <p>접수 시각: ${escapeHtml(formatKoreanDate(inquiry.createdAt))}</p>
      <p>프로젝트 유형: ${escapeHtml(projectType)}</p>
      <p>개인정보가 포함된 상세 내용은 인증된 관리자 화면에서 확인해 주세요.</p>
      <p style="margin-top:20px"><a href="${escapeHtml(adminUrl)}" style="color:#18181b;font-weight:700">관리자에서 문의 확인</a></p>
    </div>`;

  return { subject, text, html };
}

export function renderConfirmation(
  inquiry: StoredInquiryForEmail,
  subjectPrefix: string,
): RenderedEmail {
  const subject = `${subjectPrefix}[WDS] 상담 문의가 접수되었습니다`;
  const text = `${inquiry.contactName}님, 안녕하세요.\n\nWon Design Studio에 보내주신 상담 문의를 확인했습니다. 담당자가 내용을 검토한 뒤 다음 영업일까지 답변드리겠습니다.\n\n감사합니다.\nWon Design Studio`;
  const html = `
    <div style="font-family:Arial,'Apple SD Gothic Neo',sans-serif;color:#18181b;line-height:1.75;max-width:600px;margin:0 auto;padding:24px">
      <p>${escapeHtml(inquiry.contactName)}님, 안녕하세요.</p>
      <p>Won Design Studio에 보내주신 상담 문의를 확인했습니다.</p>
      <p>담당자가 내용을 검토한 뒤 <strong>다음 영업일까지</strong> 답변드리겠습니다.</p>
      <p style="margin-top:32px">감사합니다.<br />Won Design Studio</p>
    </div>`;

  return { subject, text, html };
}
