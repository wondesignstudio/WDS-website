import { after, NextResponse } from "next/server";

import {
  createContactFingerprint,
  createRateLimitDigest,
  getClientAddress,
  RateLimitConfigurationError,
} from "@/lib/contact/crypto";
import {
  ContactPersistenceError,
  consumeContactRateLimit,
  createContactInquiry,
} from "@/lib/contact/repository";
import {
  contactInputSchema,
  idempotencyKeySchema,
} from "@/lib/contact/schema";
import { deliverInquiryEmails } from "@/lib/email/outbox";
import { SupabaseConfigurationError } from "@/lib/supabase/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 32 * 1_024;

function noStoreJson(
  body: unknown,
  status: number,
  headers?: Record<string, string>,
) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
      ...headers,
    },
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";

  if (!contentType.toLowerCase().includes("application/json")) {
    return noStoreJson(
      { ok: false, code: "UNSUPPORTED_MEDIA_TYPE" },
      415,
    );
  }

  const contentLength = Number(request.headers.get("content-length") ?? "0");

  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
    return noStoreJson({ ok: false, code: "PAYLOAD_TOO_LARGE" }, 413);
  }

  let rawBody: string;
  let payload: unknown;

  try {
    rawBody = await request.text();
    if (new TextEncoder().encode(rawBody).byteLength > MAX_BODY_BYTES) {
      return noStoreJson({ ok: false, code: "PAYLOAD_TOO_LARGE" }, 413);
    }
    payload = JSON.parse(rawBody);
  } catch {
    return noStoreJson({ ok: false, code: "INVALID_JSON" }, 400);
  }

  if (
    isRecord(payload) &&
    typeof payload.website === "string" &&
    payload.website.trim().length > 0
  ) {
    return noStoreJson({ ok: true }, 200);
  }

  const submissionKeyResult = idempotencyKeySchema.safeParse(
    request.headers.get("idempotency-key"),
  );

  if (!submissionKeyResult.success) {
    return noStoreJson(
      { ok: false, code: "INVALID_IDEMPOTENCY_KEY" },
      400,
    );
  }

  try {
    const ipDigest = createRateLimitDigest(getClientAddress(request.headers));
    const ipAllowed = await consumeContactRateLimit("ip_10m", ipDigest, 600, 10);

    if (!ipAllowed) {
      return noStoreJson(
        { ok: false, code: "RATE_LIMITED" },
        429,
        { "Retry-After": "600" },
      );
    }

    const parsed = contactInputSchema.safeParse(payload);

    if (!parsed.success) {
      return noStoreJson(
        {
          ok: false,
          code: "VALIDATION_ERROR",
          fieldErrors: parsed.error.flatten().fieldErrors,
        },
        400,
      );
    }

    const result = await createContactInquiry({
      input: parsed.data,
      submissionKey: submissionKeyResult.data,
      payloadFingerprint: createContactFingerprint(parsed.data),
      emailDigest: createRateLimitDigest(parsed.data.email),
    });

    if (result.outcome === "conflict") {
      return noStoreJson({ ok: false, code: "IDEMPOTENCY_CONFLICT" }, 409);
    }

    if (result.outcome === "rate_limited") {
      return noStoreJson(
        { ok: false, code: "RATE_LIMITED" },
        429,
        { "Retry-After": "86400" },
      );
    }

    if (result.outcome === "created") {
      after(async () => {
        try {
          await deliverInquiryEmails(result.inquiryId);
        } catch {
          console.error("Initial contact email processing failed", {
            inquiryId: result.inquiryId,
          });
        }
      });
    }

    return noStoreJson(
      { ok: true },
      result.outcome === "created" ? 201 : 200,
    );
  } catch (error) {
    if (
      error instanceof SupabaseConfigurationError ||
      error instanceof RateLimitConfigurationError
    ) {
      return noStoreJson(
        { ok: false, code: "SERVICE_NOT_CONFIGURED" },
        503,
      );
    }

    if (error instanceof ContactPersistenceError) {
      console.error("Contact persistence operation failed", {
        operation: error.operation ?? "unknown",
        code: error.code ?? "unknown",
      });
      return noStoreJson({ ok: false, code: "SUBMISSION_FAILED" }, 503);
    }

    console.error("Unexpected contact submission error");
    return noStoreJson({ ok: false, code: "SUBMISSION_FAILED" }, 503);
  }
}
