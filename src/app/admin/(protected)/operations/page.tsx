import { getAdminAccess } from "@/lib/auth/admin";
import {
  CronRunDataError,
  listRecentCronRuns,
  type CronJob,
  type CronRun,
} from "@/lib/operations/cron-runs";

export const dynamic = "force-dynamic";

const jobLabels: Record<CronJob, string> = {
  email_retry: "이메일 재처리",
  retention: "보관 기간 정리",
};

const statusLabels: Record<CronRun["status"], string> = {
  running: "실행 중",
  succeeded: "성공",
  degraded: "일부 실패",
  failed: "실패",
};

function formatDateTime(value: string | null) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeStyle: "medium",
    timeZone: "Asia/Seoul",
  }).format(new Date(value));
}

function getStatusClass(status: CronRun["status"]) {
  if (status === "succeeded") return "bg-emerald-50 text-emerald-700";
  if (status === "running") return "bg-blue-50 text-blue-700";
  if (status === "degraded") return "bg-amber-50 text-amber-800";
  return "bg-red-50 text-red-700";
}

function LatestRunCard({ job, run }: { job: CronJob; run?: CronRun }) {
  return (
    <article className="rounded-2xl bg-white p-6 shadow-[0_1px_0_rgba(0,0,0,0.06)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-zinc-500">{jobLabels[job]}</p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight">
            {run ? statusLabels[run.status] : "실행 기록 없음"}
          </h2>
        </div>
        {run ? (
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(run.status)}`}>
            HTTP {run.httpStatus ?? "—"}
          </span>
        ) : null}
      </div>
      <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-2">
        <div>
          <dt className="font-semibold text-zinc-500">시작</dt>
          <dd className="mt-1 text-zinc-950">{formatDateTime(run?.startedAt ?? null)}</dd>
        </div>
        <div>
          <dt className="font-semibold text-zinc-500">완료</dt>
          <dd className="mt-1 text-zinc-950">{formatDateTime(run?.completedAt ?? null)}</dd>
        </div>
      </dl>
    </article>
  );
}

export default async function OperationsPage() {
  const access = await getAdminAccess();

  if (access.state !== "allowed") {
    return null;
  }

  let runs: CronRun[] = [];
  let loadError = false;

  try {
    runs = await listRecentCronRuns(access.client);
  } catch (error) {
    if (!(error instanceof CronRunDataError)) {
      throw error;
    }
    loadError = true;
  }

  const latestByJob = new Map<CronJob, CronRun>();
  for (const run of runs) {
    if (!latestByJob.has(run.job)) latestByJob.set(run.job, run);
  }

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-500">
          Operations
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">운영 상태</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-600">
          Vercel 로그 보존 범위와 무관하게 최근 Cron 실행 결과를 90일 동안 확인합니다.
        </p>
      </div>

      {loadError ? (
        <section className="mt-8 rounded-2xl bg-amber-50 p-6 text-sm leading-6 text-amber-950">
          Cron 실행 기록을 불러오지 못했습니다. Supabase migration 적용 상태를 확인해 주세요.
        </section>
      ) : (
        <>
          <section className="mt-8 grid gap-4 md:grid-cols-2">
            <LatestRunCard job="email_retry" run={latestByJob.get("email_retry")} />
            <LatestRunCard job="retention" run={latestByJob.get("retention")} />
          </section>

          <section className="mt-6 overflow-hidden rounded-2xl bg-white shadow-[0_1px_0_rgba(0,0,0,0.06)]">
            <div className="flex items-center justify-between px-6 py-5">
              <h2 className="text-lg font-semibold">최근 실행</h2>
              <p className="text-sm text-zinc-500">최대 20건</p>
            </div>
            {runs.length === 0 ? (
              <p className="px-6 py-14 text-center text-sm text-zinc-500">
                migration 적용 후 다음 예정 실행부터 기록됩니다.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-left text-sm">
                  <thead className="bg-zinc-50 text-zinc-500">
                    <tr>
                      <th className="px-6 py-3 font-semibold">작업</th>
                      <th className="px-6 py-3 font-semibold">상태</th>
                      <th className="px-6 py-3 font-semibold">시작</th>
                      <th className="px-6 py-3 font-semibold">완료</th>
                      <th className="px-6 py-3 font-semibold">HTTP</th>
                      <th className="px-6 py-3 font-semibold">오류 코드</th>
                    </tr>
                  </thead>
                  <tbody>
                    {runs.map((run) => (
                      <tr className="border-t border-zinc-100" key={run.id}>
                        <td className="px-6 py-4 font-semibold">{jobLabels[run.job]}</td>
                        <td className="px-6 py-4">
                          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusClass(run.status)}`}>
                            {statusLabels[run.status]}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-zinc-600">{formatDateTime(run.startedAt)}</td>
                        <td className="px-6 py-4 text-zinc-600">{formatDateTime(run.completedAt)}</td>
                        <td className="px-6 py-4 text-zinc-600">{run.httpStatus ?? "—"}</td>
                        <td className="px-6 py-4 text-zinc-600">{run.errorCode ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </main>
  );
}
