import { getSupabaseServiceClient } from "@/lib/supabase/service";
import { getSupabaseServiceConfig } from "@/lib/supabase/config";

import type { ContactInput } from "./schema";
import type { ContactSubmissionOutcome } from "./types";

type CreateInquiryRow = {
  outcome: "created" | "duplicate" | "conflict" | "rate_limited";
  inquiry_id: number | null;
};

export class ContactPersistenceError extends Error {
  readonly operation?: string;
  readonly code?: string;

  constructor(
    message = "문의 저장에 실패했습니다.",
    metadata: { operation?: string; code?: string } = {},
  ) {
    super(message);
    this.name = "ContactPersistenceError";
    this.operation = metadata.operation;
    this.code = metadata.code;
  }
}

export async function consumeContactRateLimit(
  scope: string,
  keyDigest: string,
  windowSeconds: number,
  maximum: number,
) {
  const { url, serviceRoleKey } = getSupabaseServiceConfig();
  const response = await fetch(
    `${url}/rest/v1/rpc/consume_contact_rate_limit`,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify({
        p_scope: scope,
        p_key_digest: keyDigest,
        p_window_seconds: windowSeconds,
        p_maximum: maximum,
      }),
      cache: "no-store",
    },
  );

  const rawData = await response.text();
  let data: unknown = null;
  let errorCode: string | undefined;

  if (rawData) {
    try {
      const parsed = JSON.parse(rawData) as { code?: string } | unknown;
      if (!response.ok && typeof parsed === "object" && parsed !== null) {
        errorCode = "code" in parsed ? String(parsed.code) : undefined;
      } else {
        data = parsed;
      }
    } catch {
      errorCode = "invalid_json_response";
    }
  }

  const normalizedData =
    typeof data === "boolean"
      ? data
      : data === "true"
        ? true
        : data === "false"
          ? false
          : undefined;

  if (!response.ok || normalizedData === undefined) {
    const resultType =
      data === null ? "null" : Array.isArray(data) ? "array" : typeof data;
    throw new ContactPersistenceError("문의 요청 제한을 확인할 수 없습니다.", {
      operation: "consume_contact_rate_limit",
      code:
        errorCode ??
        (!response.ok
          ? `postgrest_${response.status}`
          : `unexpected_result_${resultType}`),
    });
  }

  return normalizedData;
}

export async function createContactInquiry(args: {
  input: ContactInput;
  submissionKey: string;
  payloadFingerprint: string;
  emailDigest: string;
}): Promise<ContactSubmissionOutcome> {
  const client = getSupabaseServiceClient();
  const { data, error } = await client.rpc("create_contact_inquiry", {
    p_submission_key: args.submissionKey,
    p_payload_fingerprint: args.payloadFingerprint,
    p_email_digest: args.emailDigest,
    p_payload: args.input,
  });

  if (error) {
    throw new ContactPersistenceError("문의 저장에 실패했습니다.", {
      operation: "create_contact_inquiry",
      code: error.code,
    });
  }

  const row = (data as CreateInquiryRow[] | null)?.[0];

  if (!row) {
    throw new ContactPersistenceError("문의 저장 결과를 확인할 수 없습니다.", {
      operation: "create_contact_inquiry",
      code: "missing_result",
    });
  }

  if (row.outcome === "created" || row.outcome === "duplicate") {
    if (typeof row.inquiry_id !== "number") {
      throw new ContactPersistenceError("문의 식별자를 확인할 수 없습니다.");
    }

    return { outcome: row.outcome, inquiryId: row.inquiry_id };
  }

  return { outcome: row.outcome };
}

export async function purgeExpiredInquiries() {
  const client = getSupabaseServiceClient();
  const { data, error } = await client.rpc("purge_expired_inquiries");

  if (error || typeof data !== "number") {
    throw new ContactPersistenceError("문의 보관기간 정리를 완료하지 못했습니다.");
  }

  return data;
}

export async function purgeExpiredRateLimits() {
  const client = getSupabaseServiceClient();
  const { data, error } = await client.rpc("purge_expired_contact_rate_limits");

  if (error || typeof data !== "number") {
    throw new ContactPersistenceError("요청 제한 기록 정리를 완료하지 못했습니다.");
  }

  return data;
}
