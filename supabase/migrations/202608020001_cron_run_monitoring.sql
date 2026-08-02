begin;

create table public.cron_runs (
  id bigint generated always as identity primary key,
  job text not null,
  status text not null default 'running',
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  http_status smallint,
  result jsonb not null default '{}'::jsonb,
  error_code text,
  constraint cron_runs_job_check
    check (job in ('email_retry', 'retention')),
  constraint cron_runs_status_check
    check (status in ('running', 'succeeded', 'degraded', 'failed')),
  constraint cron_runs_result_check
    check (jsonb_typeof(result) = 'object'),
  constraint cron_runs_error_code_check
    check (error_code is null or char_length(error_code) between 1 and 100),
  constraint cron_runs_completion_check
    check (
      (
        status = 'running' and
        completed_at is null and
        http_status is null
      ) or (
        status <> 'running' and
        completed_at is not null and
        http_status between 100 and 599
      )
    )
);

create index cron_runs_job_started_at_idx
  on public.cron_runs (job, started_at desc);

create index cron_runs_started_at_idx
  on public.cron_runs (started_at);

alter table public.cron_runs enable row level security;

revoke all on table public.cron_runs from public, anon, authenticated;
grant select on table public.cron_runs to authenticated;
grant all on table public.cron_runs to service_role;
grant usage, select on sequence public.cron_runs_id_seq to service_role;

create policy cron_runs_admin_select
on public.cron_runs
for select
to authenticated
using ((select private.is_admin()));

commit;
