import { getSupabaseServiceClient } from "@/lib/supabase/service";
import type {
  ClaimedEmailDelivery,
  StoredInquiryForEmail,
} from "@/lib/contact/types";

import { getEmailConfig, getResend } from "./resend";
import { renderConfirmation, renderInternalNotification } from "./templates";

type RawDelivery = {
  id: number;
  inquiry_id: number;
  kind: ClaimedEmailDelivery["kind"];
  attempt_count: number;
};

type RawStoredInquiry = {
  id: number;
  public_id: string;
  created_at: string;
  company_name: string;
  contact_name: string;
  email: string;
  phone: string | null;
  project_type: StoredInquiryForEmail["projectType"];
  project_background: string;
  budget_range: StoredInquiryForEmail["budgetRange"];
  expected_scope: string | null;
  desired_schedule: string | null;
  reference_links: string[];
  privacy_consent_at: string;
  privacy_policy_version: typeof import("@/lib/contact/schema").CONTACT_PRIVACY_POLICY_VERSION;
};

const RETRY_DELAYS_MS = [5 * 60_000, 15 * 60_000, 60 * 60_000, 6 * 60 * 60_000];
const MAX_ATTEMPTS = 5;

type DeliveryResult =
  | "sent"
  | "retry_scheduled"
  | "terminal_failed"
  | "state_update_failed";

function mapDelivery(row: RawDelivery): ClaimedEmailDelivery {
  return {
    id: row.id,
    inquiryId: row.inquiry_id,
    kind: row.kind,
    attemptCount: row.attempt_count,
  };
}

function mapInquiry(row: RawStoredInquiry): StoredInquiryForEmail {
  return {
    id: row.id,
    publicId: row.public_id,
    createdAt: row.created_at,
    companyName: row.company_name,
    contactName: row.contact_name,
    email: row.email,
    phone: row.phone ?? undefined,
    projectType: row.project_type,
    projectBackground: row.project_background,
    budgetRange: row.budget_range,
    expectedScope: row.expected_scope ?? undefined,
    desiredSchedule: row.desired_schedule ?? undefined,
    referenceLinks: row.reference_links ?? [],
    privacyConsent: true,
    privacyConsentAt: row.privacy_consent_at,
    privacyPolicyVersion: row.privacy_policy_version,
    website: "",
  };
}

function errorCode(error: unknown) {
  if (error && typeof error === "object" && "name" in error) {
    return String(error.name).slice(0, 100);
  }

  return "email_delivery_error";
}

async function claimDeliveries(inquiryId?: number) {
  const client = getSupabaseServiceClient();
  const { data, error } = await client.rpc("claim_email_deliveries", {
    p_batch_size: inquiryId ? 2 : 20,
    p_inquiry_id: inquiryId ?? null,
  });

  if (error) {
    throw new Error("Email outbox claim failed.");
  }

  return ((data ?? []) as RawDelivery[]).map(mapDelivery);
}

async function loadInquiries(inquiryIds: number[]) {
  if (inquiryIds.length === 0) {
    return new Map<number, StoredInquiryForEmail>();
  }

  const client = getSupabaseServiceClient();
  const { data, error } = await client
    .from("contact_inquiries")
    .select(
      "id,public_id,created_at,company_name,contact_name,email,phone,project_type,project_background,budget_range,expected_scope,desired_schedule,reference_links,privacy_consent_at,privacy_policy_version",
    )
    .in("id", inquiryIds);

  if (error) {
    throw new Error("Email inquiry lookup failed.");
  }

  return new Map(
    ((data ?? []) as RawStoredInquiry[]).map((row) => [row.id, mapInquiry(row)]),
  );
}

async function markSent(deliveryId: number, providerMessageId: string) {
  const client = getSupabaseServiceClient();
  const { data, error } = await client.rpc("mark_email_delivery_sent", {
    p_delivery_id: deliveryId,
    p_provider_message_id: providerMessageId,
  });

  if (error || data !== true) {
    throw new Error("Email delivery state update failed.");
  }
}

async function markFailed(delivery: ClaimedEmailDelivery, error: unknown) {
  const terminal = delivery.attemptCount >= MAX_ATTEMPTS;
  const failureCode = errorCode(error);
  const retryDelay = RETRY_DELAYS_MS[Math.max(0, delivery.attemptCount - 1)];
  const nextAttemptAt = terminal
    ? null
    : new Date(Date.now() + (retryDelay ?? RETRY_DELAYS_MS.at(-1)!)).toISOString();
  const client = getSupabaseServiceClient();
  const { data, error: updateError } = await client.rpc("mark_email_delivery_failed", {
    p_delivery_id: delivery.id,
    p_error_code: failureCode,
    p_terminal: terminal,
    p_next_attempt_at: nextAttemptAt,
  });

  const statePersisted = !updateError && data === true;

  console.error("Contact email delivery failed", {
    deliveryId: delivery.id,
    inquiryId: delivery.inquiryId,
    kind: delivery.kind,
    attemptCount: delivery.attemptCount,
    terminal,
    errorCode: failureCode,
    statePersisted,
  });

  if (!statePersisted) return "state_update_failed" as const;
  return terminal ? ("terminal_failed" as const) : ("retry_scheduled" as const);
}

async function sendOne(
  delivery: ClaimedEmailDelivery,
  inquiry: StoredInquiryForEmail | undefined,
) {
  if (!inquiry) {
    return markFailed(delivery, { name: "inquiry_not_found" });
  }

  try {
    const config = getEmailConfig();
    const resend = getResend();
    const adminUrl = new URL(
      `/admin/inquiries/${inquiry.publicId}`,
      config.siteUrl,
    ).toString();
    const rendered =
      delivery.kind === "internal"
        ? renderInternalNotification(inquiry, adminUrl, config.subjectPrefix)
        : renderConfirmation(inquiry, config.subjectPrefix);
    const recipient =
      delivery.kind === "internal" ? config.notificationTo : inquiry.email;
    const replyTo = config.confirmationReplyTo;
    const { data, error } = await resend.emails.send(
      {
        from: config.from,
        to: [recipient],
        replyTo,
        subject: rendered.subject,
        text: rendered.text,
        html: rendered.html,
      },
      {
        idempotencyKey: `wds-contact/${inquiry.id}/${delivery.kind}/v1`,
      },
    );

    if (error || !data?.id) {
      throw Object.assign(new Error("Resend rejected the message."), {
        name: error?.name || "resend_error",
      });
    }

    await markSent(delivery.id, data.id);
    return "sent" as const;
  } catch (error) {
    return markFailed(delivery, error);
  }
}

async function processClaimed(deliveries: ClaimedEmailDelivery[]) {
  const inquiryIds = [...new Set(deliveries.map((item) => item.inquiryId))];
  const inquiries = await loadInquiries(inquiryIds);
  const results: DeliveryResult[] = await Promise.all(
    deliveries.map((delivery) =>
      sendOne(delivery, inquiries.get(delivery.inquiryId)),
    ),
  );

  return {
    claimed: deliveries.length,
    sent: results.filter((result) => result === "sent").length,
    retryScheduled: results.filter((result) => result === "retry_scheduled")
      .length,
    terminalFailed: results.filter((result) => result === "terminal_failed")
      .length,
    stateUpdateFailed: results.filter(
      (result) => result === "state_update_failed",
    ).length,
  };
}

async function countUnresolvedEmailFailures() {
  const client = getSupabaseServiceClient();
  const { count, error } = await client
    .from("inquiry_email_deliveries")
    .select("id", { count: "exact", head: true })
    .eq("status", "failed");

  if (error || count === null) {
    throw new Error("Unable to count unresolved email failures.");
  }

  return count;
}

export async function deliverInquiryEmails(inquiryId: number) {
  return processClaimed(await claimDeliveries(inquiryId));
}

export async function processPendingEmailDeliveries() {
  const result = await processClaimed(await claimDeliveries());
  return {
    ...result,
    unresolvedFailed: await countUnresolvedEmailFailures(),
  };
}
