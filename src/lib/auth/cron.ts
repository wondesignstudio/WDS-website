import { timingSafeEqual } from "node:crypto";

export class CronConfigurationError extends Error {
  constructor() {
    super("CRON_SECRET is not configured.");
    this.name = "CronConfigurationError";
  }
}

function getCronSecret() {
  const secret = process.env.CRON_SECRET?.trim();

  if (!secret) {
    throw new CronConfigurationError();
  }

  return secret;
}

export function isAuthorizedCronRequest(request: Request) {
  const expected = `Bearer ${getCronSecret()}`;
  const received = request.headers.get("authorization") ?? "";
  const expectedBuffer = Buffer.from(expected);
  const receivedBuffer = Buffer.from(received);

  return (
    expectedBuffer.length === receivedBuffer.length &&
    timingSafeEqual(expectedBuffer, receivedBuffer)
  );
}
