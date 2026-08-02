import type { SupabaseClient } from "@supabase/supabase-js";

import { getSupabaseServiceClient } from "@/lib/supabase/service";

export const CRON_JOBS = ["email_retry", "retention"] as const;

export type CronJob = (typeof CRON_JOBS)[number];
export type CronRunStatus = "running" | "succeeded" | "degraded" | "failed";

export type CronRunResult = Record<string, number>;

export type CronRun = {
  id: number;
  job: CronJob;
  status: CronRunStatus;
  startedAt: string;
  completedAt: string | null;
  httpStatus: number | null;
  result: CronRunResult;
  errorCode: string | null;
};

type RawCronRun = {
  id: number;
  job: CronJob;
  status: CronRunStatus;
  started_at: string;
  completed_at: string | null;
  http_status: number | null;
  result: CronRunResult | null;
  error_code: string | null;
};

export class CronRunDataError extends Error {
  constructor(message = "Cron 실행 기록을 불러오지 못했습니다.") {
    super(message);
    this.name = "CronRunDataError";
  }
}

function mapCronRun(row: RawCronRun): CronRun {
  return {
    id: row.id,
    job: row.job,
    status: row.status,
    startedAt: row.started_at,
    completedAt: row.completed_at,
    httpStatus: row.http_status,
    result: row.result ?? {},
    errorCode: row.error_code,
  };
}

export async function startCronRun(job: CronJob): Promise<number | null> {
  try {
    const client = getSupabaseServiceClient();
    const { data, error } = await client
      .from("cron_runs")
      .insert({ job })
      .select("id")
      .single();

    if (error || !data) {
      console.error("Cron monitoring start write failed", {
        job,
        code: error?.code ?? "missing_row",
      });
      return null;
    }

    return Number(data.id);
  } catch {
    console.error("Cron monitoring start write failed", {
      job,
      code: "unexpected_error",
    });
    return null;
  }
}

export async function completeCronRun(
  runId: number | null,
  job: CronJob,
  status: Exclude<CronRunStatus, "running">,
  httpStatus: number,
  result: CronRunResult = {},
  errorCode: string | null = null,
) {
  if (runId === null) {
    return;
  }

  try {
    const client = getSupabaseServiceClient();
    const { error } = await client
      .from("cron_runs")
      .update({
        status,
        completed_at: new Date().toISOString(),
        http_status: httpStatus,
        result,
        error_code: errorCode,
      })
      .eq("id", runId)
      .eq("job", job)
      .eq("status", "running");

    if (error) {
      console.error("Cron monitoring completion write failed", {
        job,
        code: error.code,
      });
    }
  } catch {
    console.error("Cron monitoring completion write failed", {
      job,
      code: "unexpected_error",
    });
  }
}

export async function purgeExpiredCronRuns() {
  const cutoff = new Date();
  cutoff.setUTCDate(cutoff.getUTCDate() - 90);

  const client = getSupabaseServiceClient();
  const { count, error } = await client
    .from("cron_runs")
    .delete({ count: "exact" })
    .lt("started_at", cutoff.toISOString());

  if (error) {
    throw new CronRunDataError("오래된 Cron 실행 기록을 삭제하지 못했습니다.");
  }

  return count ?? 0;
}

export async function listRecentCronRuns(
  client: SupabaseClient,
  limit = 20,
): Promise<CronRun[]> {
  const { data, error } = await client
    .from("cron_runs")
    .select(
      "id,job,status,started_at,completed_at,http_status,result,error_code",
    )
    .order("started_at", { ascending: false })
    .limit(Math.min(Math.max(limit, 1), 50));

  if (error) {
    throw new CronRunDataError();
  }

  return ((data ?? []) as RawCronRun[]).map(mapCronRun);
}
