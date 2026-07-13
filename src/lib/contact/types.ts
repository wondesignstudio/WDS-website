import type { ContactInput, InquiryStatus } from "./schema";

export type ContactSubmissionOutcome =
  | { outcome: "created"; inquiryId: number }
  | { outcome: "duplicate"; inquiryId: number }
  | { outcome: "conflict" }
  | { outcome: "rate_limited" };

export type InquiryListItem = {
  id: number;
  publicId: string;
  createdAt: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string | null;
  projectType: string;
  budgetRange: string;
  status: InquiryStatus;
  failedEmailCount: number;
};

export type EmailDeliveryStatus = {
  id: number;
  kind: "internal" | "confirmation";
  status: "pending" | "processing" | "retry" | "sent" | "failed";
  attemptCount: number;
  sentAt: string | null;
  lastErrorCode: string | null;
};

export type InquiryDetail = InquiryListItem & {
  projectBackground: string;
  expectedScope: string | null;
  desiredSchedule: string | null;
  referenceLinks: string[];
  privacyConsentAt: string;
  privacyPolicyVersion: string;
  internalMemo: string;
  memoUpdatedAt: string | null;
  statusChangedAt: string;
  convertedAt: string | null;
  customerRecordTransferredAt: string | null;
  customerRecordReference: string | null;
  purgeAfter: string;
  deliveries: EmailDeliveryStatus[];
};

export type InquiryListResult = {
  items: InquiryListItem[];
  nextCursor: number | null;
};

export type StoredInquiryForEmail = ContactInput & {
  id: number;
  publicId: string;
  createdAt: string;
  privacyConsentAt: string;
};

export type ClaimedEmailDelivery = {
  id: number;
  inquiryId: number;
  kind: "internal" | "confirmation";
  attemptCount: number;
};

export type AdminActionState = {
  status: "idle" | "success" | "error";
  message: string;
};
