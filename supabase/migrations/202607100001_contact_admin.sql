begin;

create schema if not exists extensions;
create schema if not exists private;

create extension if not exists pg_trgm with schema extensions;

revoke all on schema private from public, anon, authenticated;
grant usage on schema private to authenticated, service_role;

create table public.contact_inquiries (
  id bigint generated always as identity primary key,
  public_id uuid not null default gen_random_uuid(),
  submission_key uuid not null,
  payload_fingerprint text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  purge_after timestamptz not null default (now() + interval '12 months'),
  company_name text not null,
  contact_name text not null,
  email text not null,
  phone text,
  project_type text not null,
  project_background text not null,
  budget_range text not null,
  expected_scope text,
  desired_schedule text,
  reference_links text[] not null default '{}'::text[],
  privacy_consent_at timestamptz not null default now(),
  privacy_policy_version text not null,
  status text not null default 'new',
  status_changed_at timestamptz not null default now(),
  status_changed_by uuid references auth.users(id) on delete set null,
  internal_memo text not null default '',
  memo_updated_at timestamptz,
  memo_updated_by uuid references auth.users(id) on delete set null,
  converted_at timestamptz,
  customer_record_transferred_at timestamptz,
  customer_record_reference text,
  search_text text generated always as (
    lower(
      company_name || ' ' ||
      contact_name || ' ' ||
      email || ' ' ||
      coalesce(phone, '')
    )
  ) stored,
  constraint contact_inquiries_public_id_key unique (public_id),
  constraint contact_inquiries_submission_key_key unique (submission_key),
  constraint contact_inquiries_payload_fingerprint_check
    check (char_length(payload_fingerprint) = 64),
  constraint contact_inquiries_company_name_check
    check (char_length(btrim(company_name)) between 1 and 100),
  constraint contact_inquiries_contact_name_check
    check (char_length(btrim(contact_name)) between 1 and 80),
  constraint contact_inquiries_email_check
    check (char_length(email) between 3 and 254 and email = lower(btrim(email))),
  constraint contact_inquiries_phone_check
    check (phone is null or char_length(phone) between 1 and 30),
  constraint contact_inquiries_project_type_check
    check (project_type in (
      'website_diagnostics',
      'corporate_website',
      'brand_website_renewal',
      'digital_product_uxui',
      'frontend_backend_development',
      'admin_system',
      'maintenance_operation',
      'other'
    )),
  constraint contact_inquiries_project_background_check
    check (char_length(btrim(project_background)) between 20 and 5000),
  constraint contact_inquiries_budget_range_check
    check (budget_range in (
      'under_20m',
      '20m_50m',
      '50m_100m',
      'over_100m'
    )),
  constraint contact_inquiries_expected_scope_check
    check (expected_scope is null or char_length(expected_scope) between 1 and 2000),
  constraint contact_inquiries_desired_schedule_check
    check (desired_schedule is null or char_length(desired_schedule) between 1 and 500),
  constraint contact_inquiries_reference_links_check
    check (cardinality(reference_links) between 0 and 5),
  constraint contact_inquiries_privacy_policy_version_check
    check (char_length(btrim(privacy_policy_version)) between 1 and 64),
  constraint contact_inquiries_status_check
    check (status in ('new', 'contacted', 'consulting', 'converted', 'closed')),
  constraint contact_inquiries_internal_memo_check
    check (char_length(internal_memo) <= 10000),
  constraint contact_inquiries_customer_record_reference_check
    check (customer_record_reference is null or char_length(customer_record_reference) between 1 and 500),
  constraint contact_inquiries_converted_check
    check (
      status <> 'converted' or (
        converted_at is not null and
        customer_record_transferred_at is not null and
        nullif(btrim(customer_record_reference), '') is not null
      )
    ),
  constraint contact_inquiries_purge_after_check
    check (purge_after >= created_at)
);

create table public.inquiry_email_deliveries (
  id bigint generated always as identity primary key,
  inquiry_id bigint not null references public.contact_inquiries(id) on delete cascade,
  kind text not null,
  status text not null default 'pending',
  attempt_count smallint not null default 0,
  next_attempt_at timestamptz not null default now(),
  lease_until timestamptz,
  provider_message_id text,
  last_error_code text,
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint inquiry_email_deliveries_inquiry_kind_key unique (inquiry_id, kind),
  constraint inquiry_email_deliveries_kind_check
    check (kind in ('internal', 'confirmation')),
  constraint inquiry_email_deliveries_status_check
    check (status in ('pending', 'processing', 'retry', 'sent', 'failed')),
  constraint inquiry_email_deliveries_attempt_count_check
    check (attempt_count between 0 and 5),
  constraint inquiry_email_deliveries_provider_message_id_check
    check (provider_message_id is null or char_length(provider_message_id) <= 255),
  constraint inquiry_email_deliveries_last_error_code_check
    check (last_error_code is null or char_length(last_error_code) <= 100)
);

create table private.admin_allowlist (
  email text primary key,
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint admin_allowlist_email_check
    check (email = lower(btrim(email)) and char_length(email) between 3 and 254)
);

create table private.contact_rate_limits (
  scope text not null,
  key_digest text not null,
  window_start timestamptz not null,
  hits integer not null default 1,
  expires_at timestamptz not null,
  primary key (scope, key_digest, window_start),
  constraint contact_rate_limits_scope_check
    check (char_length(scope) between 1 and 64),
  constraint contact_rate_limits_key_digest_check
    check (char_length(key_digest) = 64),
  constraint contact_rate_limits_hits_check
    check (hits > 0)
);

-- Add the initial approved Google account after applying this migration.
-- Keep that internal address out of version-controlled SQL:
-- insert into private.admin_allowlist (email)
-- values (lower('<approved-admin-email>'));

create index contact_inquiries_status_id_idx
  on public.contact_inquiries (status, id desc);

create index contact_inquiries_project_type_id_idx
  on public.contact_inquiries (project_type, id desc);

create index contact_inquiries_purge_after_idx
  on public.contact_inquiries (purge_after);

create index contact_inquiries_search_text_idx
  on public.contact_inquiries using gin (search_text extensions.gin_trgm_ops);

create index inquiry_email_deliveries_inquiry_id_idx
  on public.inquiry_email_deliveries (inquiry_id);

create index inquiry_email_deliveries_due_idx
  on public.inquiry_email_deliveries (next_attempt_at, id)
  where status in ('pending', 'retry');

create index contact_rate_limits_expires_at_idx
  on private.contact_rate_limits (expires_at);

create or replace function private.set_contact_inquiry_audit_fields()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    new.email := lower(btrim(new.email));
    new.created_at := coalesce(new.created_at, now());
    new.updated_at := new.created_at;
    new.purge_after := new.created_at + interval '12 months';
    new.status_changed_at := new.created_at;

    if new.status = 'converted' then
      new.converted_at := coalesce(new.converted_at, new.created_at);
    end if;

    return new;
  end if;

  new.created_at := old.created_at;
  new.purge_after := old.purge_after;
  new.updated_at := now();

  if new.status is distinct from old.status then
    new.status_changed_at := now();
    new.status_changed_by := (select auth.uid());

    if new.status = 'converted' then
      if new.customer_record_transferred_at is null or
         nullif(btrim(new.customer_record_reference), '') is null then
        raise exception 'customer record transfer is required before conversion';
      end if;
      new.converted_at := coalesce(old.converted_at, now());
    end if;
  else
    new.status_changed_at := old.status_changed_at;
    new.status_changed_by := old.status_changed_by;
  end if;

  if new.internal_memo is distinct from old.internal_memo then
    new.memo_updated_at := now();
    new.memo_updated_by := (select auth.uid());
  else
    new.memo_updated_at := old.memo_updated_at;
    new.memo_updated_by := old.memo_updated_by;
  end if;

  return new;
end;
$$;

create trigger set_contact_inquiry_audit_fields
before insert or update on public.contact_inquiries
for each row execute function private.set_contact_inquiry_audit_fields();

create or replace function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger set_email_delivery_updated_at
before update on public.inquiry_email_deliveries
for each row execute function private.set_updated_at();

create trigger set_admin_allowlist_updated_at
before update on private.admin_allowlist
for each row execute function private.set_updated_at();

create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from private.admin_allowlist as allowed
    where allowed.enabled
      and allowed.email = lower(coalesce((select auth.jwt() ->> 'email'), ''))
      and (
        lower(coalesce((select auth.jwt() -> 'app_metadata' ->> 'provider'), '')) = 'google'
        or coalesce(
          (select auth.jwt() -> 'app_metadata' -> 'providers'),
          '[]'::jsonb
        ) ? 'google'
      )
  );
$$;

create or replace function public.is_current_admin()
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select private.is_admin();
$$;

create or replace function public.consume_contact_rate_limit(
  p_scope text,
  p_key_digest text,
  p_window_seconds integer,
  p_maximum integer
)
returns boolean
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_window_start timestamptz;
  v_hits integer;
begin
  if p_window_seconds < 1 or p_maximum < 1 then
    raise exception 'invalid rate limit configuration';
  end if;

  v_window_start := to_timestamp(
    floor(extract(epoch from clock_timestamp()) / p_window_seconds) * p_window_seconds
  );

  insert into private.contact_rate_limits (
    scope,
    key_digest,
    window_start,
    hits,
    expires_at
  ) values (
    p_scope,
    p_key_digest,
    v_window_start,
    1,
    v_window_start + make_interval(secs => p_window_seconds * 2)
  )
  on conflict (scope, key_digest, window_start)
  do update set
    hits = private.contact_rate_limits.hits + 1,
    expires_at = excluded.expires_at
  returning hits into v_hits;

  return v_hits <= p_maximum;
end;
$$;

create or replace function public.create_contact_inquiry(
  p_submission_key uuid,
  p_payload_fingerprint text,
  p_email_digest text,
  p_payload jsonb
)
returns table (outcome text, inquiry_id bigint)
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_existing_id bigint;
  v_existing_fingerprint text;
  v_inquiry_id bigint;
  v_reference_links text[];
begin
  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(p_submission_key::text, 0)
  );

  select inquiry.id, inquiry.payload_fingerprint
    into v_existing_id, v_existing_fingerprint
  from public.contact_inquiries as inquiry
  where inquiry.submission_key = p_submission_key;

  if found then
    if v_existing_fingerprint = p_payload_fingerprint then
      return query select 'duplicate'::text, v_existing_id;
    else
      return query select 'conflict'::text, null::bigint;
    end if;
    return;
  end if;

  if not public.consume_contact_rate_limit(
    'email_24h',
    p_email_digest,
    86400,
    3
  ) then
    return query select 'rate_limited'::text, null::bigint;
    return;
  end if;

  select coalesce(array_agg(links.link), '{}'::text[])
    into v_reference_links
  from jsonb_array_elements_text(
    coalesce(p_payload -> 'referenceLinks', '[]'::jsonb)
  ) as links(link);

  insert into public.contact_inquiries (
    submission_key,
    payload_fingerprint,
    company_name,
    contact_name,
    email,
    phone,
    project_type,
    project_background,
    budget_range,
    expected_scope,
    desired_schedule,
    reference_links,
    privacy_consent_at,
    privacy_policy_version
  ) values (
    p_submission_key,
    p_payload_fingerprint,
    btrim(p_payload ->> 'companyName'),
    btrim(p_payload ->> 'contactName'),
    lower(btrim(p_payload ->> 'email')),
    nullif(btrim(p_payload ->> 'phone'), ''),
    p_payload ->> 'projectType',
    btrim(p_payload ->> 'projectBackground'),
    p_payload ->> 'budgetRange',
    nullif(btrim(p_payload ->> 'expectedScope'), ''),
    nullif(btrim(p_payload ->> 'desiredSchedule'), ''),
    v_reference_links,
    now(),
    p_payload ->> 'privacyPolicyVersion'
  )
  returning id into v_inquiry_id;

  insert into public.inquiry_email_deliveries (inquiry_id, kind)
  values
    (v_inquiry_id, 'internal'),
    (v_inquiry_id, 'confirmation');

  return query select 'created'::text, v_inquiry_id;
end;
$$;

create or replace function public.claim_email_deliveries(
  p_batch_size integer default 20,
  p_inquiry_id bigint default null
)
returns setof public.inquiry_email_deliveries
language plpgsql
volatile
security definer
set search_path = ''
as $$
begin
  update public.inquiry_email_deliveries
  set
    status = 'failed',
    lease_until = null,
    last_error_code = 'processing_lease_expired'
  where status = 'processing'
    and lease_until <= now()
    and attempt_count >= 5;

  return query
  with candidates as materialized (
    select delivery.id
    from public.inquiry_email_deliveries as delivery
    where (p_inquiry_id is null or delivery.inquiry_id = p_inquiry_id)
      and delivery.attempt_count < 5
      and (
        (
          delivery.status in ('pending', 'retry') and
          delivery.next_attempt_at <= now()
        ) or (
          delivery.status = 'processing' and
          delivery.lease_until <= now()
        )
      )
    order by delivery.next_attempt_at, delivery.id
    limit least(greatest(p_batch_size, 1), 50)
    for update skip locked
  )
  update public.inquiry_email_deliveries as delivery
  set
    status = 'processing',
    attempt_count = delivery.attempt_count + 1,
    lease_until = now() + interval '5 minutes'
  from candidates
  where delivery.id = candidates.id
  returning delivery.*;
end;
$$;

create or replace function public.mark_email_delivery_sent(
  p_delivery_id bigint,
  p_provider_message_id text
)
returns boolean
language plpgsql
volatile
security definer
set search_path = ''
as $$
begin
  update public.inquiry_email_deliveries
  set
    status = 'sent',
    provider_message_id = p_provider_message_id,
    last_error_code = null,
    sent_at = now(),
    lease_until = null
  where id = p_delivery_id and status = 'processing';

  return found;
end;
$$;

create or replace function public.mark_email_delivery_failed(
  p_delivery_id bigint,
  p_error_code text,
  p_terminal boolean,
  p_next_attempt_at timestamptz default null
)
returns boolean
language plpgsql
volatile
security definer
set search_path = ''
as $$
begin
  update public.inquiry_email_deliveries
  set
    status = case
      when p_terminal or attempt_count >= 5 then 'failed'
      else 'retry'
    end,
    next_attempt_at = case
      when p_terminal or attempt_count >= 5 then next_attempt_at
      else coalesce(p_next_attempt_at, now() + interval '5 minutes')
    end,
    lease_until = null,
    last_error_code = left(coalesce(p_error_code, 'email_delivery_error'), 100)
  where id = p_delivery_id and status = 'processing';

  return found;
end;
$$;

create or replace function public.requeue_failed_email_deliveries(
  p_inquiry_public_id uuid
)
returns integer
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_requeued integer;
begin
  if not private.is_admin() then
    raise exception 'admin privileges required'
      using errcode = '42501';
  end if;

  update public.inquiry_email_deliveries as delivery
  set
    status = 'pending',
    attempt_count = 0,
    next_attempt_at = now(),
    lease_until = null,
    provider_message_id = null,
    last_error_code = null,
    sent_at = null
  from public.contact_inquiries as inquiry
  where inquiry.public_id = p_inquiry_public_id
    and delivery.inquiry_id = inquiry.id
    and delivery.status = 'failed';

  get diagnostics v_requeued = row_count;
  return v_requeued;
end;
$$;

create or replace function public.purge_expired_inquiries()
returns integer
language sql
volatile
security definer
set search_path = ''
as $$
  with deleted as (
    delete from public.contact_inquiries
    where purge_after <= now()
    returning 1
  )
  select count(*)::integer from deleted;
$$;

create or replace function public.purge_expired_contact_rate_limits()
returns integer
language sql
volatile
security definer
set search_path = ''
as $$
  with deleted as (
    delete from private.contact_rate_limits
    where expires_at <= now()
    returning 1
  )
  select count(*)::integer from deleted;
$$;

alter table public.contact_inquiries enable row level security;
alter table public.contact_inquiries force row level security;
alter table public.inquiry_email_deliveries enable row level security;
alter table public.inquiry_email_deliveries force row level security;

create policy contact_inquiries_admin_select
on public.contact_inquiries
for select
to authenticated
using ((select private.is_admin()));

create policy contact_inquiries_admin_update
on public.contact_inquiries
for update
to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

create policy contact_inquiries_admin_delete
on public.contact_inquiries
for delete
to authenticated
using ((select private.is_admin()));

create policy inquiry_email_deliveries_admin_select
on public.inquiry_email_deliveries
for select
to authenticated
using ((select private.is_admin()));

revoke all on public.contact_inquiries from anon, authenticated;
revoke all on public.inquiry_email_deliveries from anon, authenticated;
grant select, delete on public.contact_inquiries to authenticated;
grant update (
  status,
  internal_memo,
  customer_record_transferred_at,
  customer_record_reference
) on public.contact_inquiries to authenticated;
grant select on public.inquiry_email_deliveries to authenticated;

revoke all on private.admin_allowlist from public, anon, authenticated;
revoke all on private.contact_rate_limits from public, anon, authenticated;

revoke all on function private.set_contact_inquiry_audit_fields() from public;
revoke all on function private.set_updated_at() from public;
revoke all on function private.is_admin() from public;
grant execute on function private.is_admin() to authenticated;

revoke all on function public.is_current_admin() from public, anon;
grant execute on function public.is_current_admin() to authenticated;

revoke all on function public.consume_contact_rate_limit(text, text, integer, integer) from public, anon, authenticated;
revoke all on function public.create_contact_inquiry(uuid, text, text, jsonb) from public, anon, authenticated;
revoke all on function public.claim_email_deliveries(integer, bigint) from public, anon, authenticated;
revoke all on function public.mark_email_delivery_sent(bigint, text) from public, anon, authenticated;
revoke all on function public.mark_email_delivery_failed(bigint, text, boolean, timestamptz) from public, anon, authenticated;
revoke all on function public.requeue_failed_email_deliveries(uuid) from public, anon, authenticated;
revoke all on function public.purge_expired_inquiries() from public, anon, authenticated;
revoke all on function public.purge_expired_contact_rate_limits() from public, anon, authenticated;

grant execute on function public.consume_contact_rate_limit(text, text, integer, integer) to service_role;
grant execute on function public.create_contact_inquiry(uuid, text, text, jsonb) to service_role;
grant execute on function public.claim_email_deliveries(integer, bigint) to service_role;
grant execute on function public.mark_email_delivery_sent(bigint, text) to service_role;
grant execute on function public.mark_email_delivery_failed(bigint, text, boolean, timestamptz) to service_role;
grant execute on function public.requeue_failed_email_deliveries(uuid) to authenticated;
grant execute on function public.purge_expired_inquiries() to service_role;
grant execute on function public.purge_expired_contact_rate_limits() to service_role;

commit;
