import { NextResponse } from "next/server";

import {
  CronConfigurationError,
  isAuthorizedCronRequest,
} from "@/lib/auth/cron";
import { processPendingEmailDeliveries } from "@/lib/email/outbox";
import {
  completeCronRun,
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

    runId = await startCronRun("email_retry");
    const result = await processPendingEmailDeliveries();
    const degraded =
      result.unresolvedFailed > 0 || result.stateUpdateFailed > 0;
    const httpStatus = degraded ? 500 : 200;

    if (degraded) {
      console.error("Email retry cron completed with unresolved failures", {
        unresolvedFailed: result.unresolvedFailed,
        stateUpdateFailed: result.stateUpdateFailed,
        terminalFailed: result.terminalFailed,
      });
    }

    await completeCronRun(
      runId,
      "email_retry",
      degraded ? "degraded" : "succeeded",
      httpStatus,
      {
        claimed: result.claimed,
        sent: result.sent,
        retryScheduled: result.retryScheduled,
        terminalFailed: result.terminalFailed,
        stateUpdateFailed: result.stateUpdateFailed,
        unresolvedFailed: result.unresolvedFailed,
      },
      degraded ? "UNRESOLVED_EMAIL_FAILURES" : null,
    );

    return NextResponse.json(
      { ok: !degraded, ...result },
      { status: httpStatus },
    );
  } catch (error) {
    if (
      error instanceof CronConfigurationError ||
      error instanceof SupabaseConfigurationError
    ) {
      await completeCronRun(
        runId,
        "email_retry",
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

    console.error("Email retry cron failed");
    await completeCronRun(
      runId,
      "email_retry",
      "failed",
      500,
      {},
      "EMAIL_RETRY_FAILED",
    );
    return NextResponse.json(
      { ok: false, code: "EMAIL_RETRY_FAILED" },
      { status: 500 },
    );
  }
}
