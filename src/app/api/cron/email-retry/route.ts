import { NextResponse } from "next/server";

import {
  CronConfigurationError,
  isAuthorizedCronRequest,
} from "@/lib/auth/cron";
import { processPendingEmailDeliveries } from "@/lib/email/outbox";
import { SupabaseConfigurationError } from "@/lib/supabase/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    if (!isAuthorizedCronRequest(request)) {
      return NextResponse.json({ ok: false }, { status: 401 });
    }

    const result = await processPendingEmailDeliveries();
    const degraded =
      result.unresolvedFailed > 0 || result.stateUpdateFailed > 0;

    if (degraded) {
      console.error("Email retry cron completed with unresolved failures", {
        unresolvedFailed: result.unresolvedFailed,
        stateUpdateFailed: result.stateUpdateFailed,
        terminalFailed: result.terminalFailed,
      });
    }

    return NextResponse.json(
      { ok: !degraded, ...result },
      { status: degraded ? 500 : 200 },
    );
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

    console.error("Email retry cron failed");
    return NextResponse.json(
      { ok: false, code: "EMAIL_RETRY_FAILED" },
      { status: 500 },
    );
  }
}
