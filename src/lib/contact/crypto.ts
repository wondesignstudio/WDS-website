import { createHash, createHmac } from "node:crypto";

import type { ContactInput } from "./schema";

export class RateLimitConfigurationError extends Error {
  constructor() {
    super("RATE_LIMIT_HMAC_SECRET is not configured.");
    this.name = "RateLimitConfigurationError";
  }
}

function getRateLimitSecret() {
  const secret = process.env.RATE_LIMIT_HMAC_SECRET?.trim();

  if (!secret) {
    throw new RateLimitConfigurationError();
  }

  return secret;
}

export function createContactFingerprint(input: ContactInput) {
  return createHash("sha256").update(JSON.stringify(input)).digest("hex");
}

export function createRateLimitDigest(value: string) {
  return createHmac("sha256", getRateLimitSecret())
    .update(value)
    .digest("hex");
}

export function getClientAddress(headers: Headers) {
  const forwarded =
    headers.get("x-vercel-forwarded-for") ??
    headers.get("x-forwarded-for") ??
    headers.get("x-real-ip");

  return forwarded?.split(",")[0]?.trim() || "local-or-unknown";
}
