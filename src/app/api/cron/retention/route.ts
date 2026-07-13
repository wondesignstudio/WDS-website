import { NextResponse } from "next/server";

import {
  CronConfigurationError,
  isAuthorizedCronRequest,
} from "@/lib/auth/cron";
import {
  purgeExpiredInquiries,
  purgeExpiredRateLimits,
} from "@/lib/contact/repository";
import { SupabaseConfigurationError } from "@/lib/supabase/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    if (!isAuthorizedCronRequest(request)) {
      return NextResponse.json({ ok: false }, { status: 401 });
    }

    const [deletedInquiries, deletedRateLimitRows] = await Promise.all([
      purgeExpiredInquiries(),
      purgeExpiredRateLimits(),
    ]);

    return NextResponse.json({
      ok: true,
      deletedInquiries,
      deletedRateLimitRows,
    });
  } catch (error) {
    if (
      error instanceof CronConfigurationError ||
      error instanceof SupabaseConfigurationError
    ) {
      return NextResponse.json(
        { ok: false, code: "SERVICE_NOT_CONFIGURED" },
        { status: 503 },
      );
    }

    console.error("Retention cron failed");
    return NextResponse.json(
      { ok: false, code: "RETENTION_FAILED" },
      { status: 500 },
    );
  }
}
