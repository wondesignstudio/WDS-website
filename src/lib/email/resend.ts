import { Resend } from "resend";

export class EmailConfigurationError extends Error {
  readonly missing: string[];

  constructor(missing: string[]) {
    super(`이메일 환경 변수가 없습니다: ${missing.join(", ")}`);
    this.name = "EmailConfigurationError";
    this.missing = missing;
  }
}

let resend: Resend | null = null;

export function getEmailConfig() {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.RESEND_FROM_EMAIL?.trim();
  const notificationTo = process.env.CONTACT_NOTIFICATION_TO?.trim();
  const confirmationReplyTo =
    process.env.CONTACT_CONFIRMATION_REPLY_TO?.trim() || notificationTo;
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://wondesign.studio";
  const subjectPrefix = process.env.EMAIL_SUBJECT_PREFIX?.trim() || "";
  const missing: string[] = [];

  if (!apiKey) missing.push("RESEND_API_KEY");
  if (!from) missing.push("RESEND_FROM_EMAIL");
  if (!notificationTo) missing.push("CONTACT_NOTIFICATION_TO");
  if (!confirmationReplyTo) missing.push("CONTACT_CONFIRMATION_REPLY_TO");

  if (!apiKey || !from || !notificationTo || !confirmationReplyTo) {
    throw new EmailConfigurationError(missing);
  }

  return {
    apiKey,
    from,
    notificationTo,
    confirmationReplyTo,
    siteUrl,
    subjectPrefix,
  };
}

export function getResend() {
  if (resend) {
    return resend;
  }

  const { apiKey } = getEmailConfig();
  resend = new Resend(apiKey);
  return resend;
}
