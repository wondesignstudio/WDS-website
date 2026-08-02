import { NextResponse } from "next/server";

import {
  CronConfigurationError,
  isAuthorizedCronRequest,
} from "@/lib/auth/cron";
import {
  purgeExpiredInquiries,
  purgeExpiredRateLimits,
} from "@/lib/contact/repository";
import {
  completeCronRun,
  purgeExpiredCronRuns,
  startCronRun,
} from "@/lib/operations/cron-runs";
import { SupabaseConfigurationError } from "@/lib/supabase/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  let runId: number | null = null;

  try {
    if (!isAuthorizedCronRequest(request)) {
      return NextResponse.json({ ok: false }, { status: 401 });
    }

    runId = await startCronRun("retention");
    const [deletedInquiries, deletedRateLimitRows, deletedCronRuns] = await Promise.all([
      purgeExpiredInquiries(),
      purgeExpiredRateLimits(),
      purgeExpiredCronRuns(),
    ]);

    await completeCronRun(runId, "retention", "succeeded", 200, {
      deletedInquiries,
      deletedRateLimitRows,
      deletedCronRuns,
    });

    return NextResponse.json({
      ok: true,
      deletedInquiries,
      deletedRateLimitRows,
      deletedCronRuns,
    });
  } catch (error) {
    if (
      error instanceof CronConfigurationError ||
      error instanceof SupabaseConfigurationError
    ) {
      await completeCronRun(
        runId,
        "retention",
        "failed",
        503,
        {},
        "SERVICE_NOT_CONFIGURED",
      );
      return NextResponse.json(
        { ok: false, code: "SERVICE_NOT_CONFIGURED" },
        { status: 503 },
      );
    }

    console.error("Retention cron failed");
    await completeCronRun(
      runId,
      "retention",
      "failed",
      500,
      {},
      "RETENTION_FAILED",
    );
    return NextResponse.json(
      { ok: false, code: "RETENTION_FAILED" },
      { status: 500 },
    );
  }
}
