begin;

create table public.portfolio_projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  client_name text,
  summary text not null,
  project_type text not null,
  scopes text[] not null default '{}'::text[],
  status_label text not null default '출시',
  visual_tone text not null default 'white',
  challenge text not null default '',
  role_description text not null default '',
  approach text not null default '',
  outcome text not null default '',
  sort_order integer not null default 0,
  is_published boolean not null default false,
  detail_published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  constraint portfolio_projects_slug_check
    check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$' and char_length(slug) between 2 and 80),
  constraint portfolio_projects_title_check
    check (char_length(btrim(title)) between 1 and 120),
  constraint portfolio_projects_client_name_check
    check (client_name is null or char_length(btrim(client_name)) between 1 and 120),
  constraint portfolio_projects_summary_check
    check (char_length(btrim(summary)) between 1 and 500),
  constraint portfolio_projects_type_check
    check (char_length(btrim(project_type)) between 1 and 120),
  constraint portfolio_projects_scopes_check
    check (cardinality(scopes) between 1 and 20),
  constraint portfolio_projects_status_label_check
    check (char_length(btrim(status_label)) between 1 and 40),
  constraint portfolio_projects_visual_tone_check
    check (visual_tone in ('orange', 'black', 'white')),
  constraint portfolio_projects_narrative_check
    check (
      char_length(challenge) <= 5000 and
      char_length(role_description) <= 5000 and
      char_length(approach) <= 5000 and
      char_length(outcome) <= 5000
    ),
  constraint portfolio_projects_detail_publish_check
    check (not detail_published or is_published)
);

create table public.media_assets (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.portfolio_projects(id) on delete restrict,
  kind text not null,
  storage_path text not null unique,
  original_name text not null,
  mime_type text not null,
  byte_size bigint not null,
  alt_text text not null,
  caption text not null default '',
  client_name text,
  approval_status text not null default 'draft',
  is_published boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  constraint media_assets_kind_check
    check (kind in ('project_image', 'client_logo')),
  constraint media_assets_relation_check
    check (
      (kind = 'project_image' and project_id is not null and client_name is null) or
      (kind = 'client_logo' and project_id is null and nullif(btrim(client_name), '') is not null)
    ),
  constraint media_assets_name_check
    check (char_length(btrim(original_name)) between 1 and 255),
  constraint media_assets_path_check
    check (char_length(btrim(storage_path)) between 1 and 500),
  constraint media_assets_mime_check
    check (mime_type in ('image/jpeg', 'image/png', 'image/webp')),
  constraint media_assets_byte_size_check
    check (byte_size between 1 and 10485760),
  constraint media_assets_alt_text_check
    check (char_length(btrim(alt_text)) between 1 and 300),
  constraint media_assets_caption_check
    check (char_length(caption) <= 500),
  constraint media_assets_client_name_check
    check (client_name is null or char_length(btrim(client_name)) between 1 and 120),
  constraint media_assets_approval_status_check
    check (approval_status in ('draft', 'approved', 'rejected')),
  constraint media_assets_publish_check
    check (not is_published or approval_status = 'approved')
);

create table public.legal_documents (
  id uuid primary key default gen_random_uuid(),
  document_type text not null,
  title text not null,
  version text not null,
  summary text not null default '',
  content text not null,
  status text not null default 'draft',
  effective_at date,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  constraint legal_documents_type_check
    check (document_type in ('privacy', 'terms')),
  constraint legal_documents_title_check
    check (char_length(btrim(title)) between 1 and 120),
  constraint legal_documents_version_check
    check (char_length(btrim(version)) between 1 and 64),
  constraint legal_documents_summary_check
    check (char_length(summary) <= 500),
  constraint legal_documents_content_check
    check (char_length(btrim(content)) between 20 and 100000),
  constraint legal_documents_status_check
    check (status in ('draft', 'published', 'archived')),
  constraint legal_documents_publication_check
    check (
      (status = 'draft' and published_at is null) or
      (status in ('published', 'archived') and published_at is not null and effective_at is not null)
    )
);

create index portfolio_projects_public_order_idx
  on public.portfolio_projects (sort_order, created_at)
  where is_published;

create index media_assets_project_order_idx
  on public.media_assets (project_id, sort_order, created_at)
  where kind = 'project_image' and approval_status = 'approved' and is_published;

create index media_assets_client_order_idx
  on public.media_assets (sort_order, created_at)
  where kind = 'client_logo' and approval_status = 'approved' and is_published;

create unique index legal_documents_one_draft_idx
  on public.legal_documents (document_type)
  where status = 'draft';

create unique index legal_documents_one_published_idx
  on public.legal_documents (document_type)
  where status = 'published';

create or replace function private.set_content_audit_fields()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    new.created_at := coalesce(new.created_at, now());
    new.created_by := coalesce(new.created_by, (select auth.uid()));
  else
    new.created_at := old.created_at;
    new.created_by := old.created_by;
  end if;

  new.updated_at := now();
  new.updated_by := (select auth.uid());

  if tg_table_name = 'portfolio_projects' then
    if new.is_published and (tg_op = 'INSERT' or not old.is_published) then
      new.published_at := now();
    elsif not new.is_published then
      new.published_at := null;
      new.detail_published := false;
    end if;
  end if;

  return new;
end;
$$;

create trigger set_portfolio_project_audit_fields
before insert or update on public.portfolio_projects
for each row execute function private.set_content_audit_fields();

create trigger set_media_asset_audit_fields
before insert or update on public.media_assets
for each row execute function private.set_content_audit_fields();

create trigger set_legal_document_audit_fields
before insert or update on public.legal_documents
for each row execute function private.set_content_audit_fields();

create or replace function public.publish_legal_document(p_document_id uuid)
returns boolean
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_document_type text;
begin
  if not private.is_admin() then
    raise exception 'admin privileges required'
      using errcode = '42501';
  end if;

  select document_type into v_document_type
  from public.legal_documents
  where id = p_document_id and status = 'draft'
  for update;

  if not found then
    return false;
  end if;

  update public.legal_documents
  set status = 'archived'
  where document_type = v_document_type and status = 'published';

  update public.legal_documents
  set
    status = 'published',
    effective_at = coalesce(effective_at, current_date),
    published_at = now()
  where id = p_document_id and status = 'draft';

  return found;
end;
$$;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'wds-media',
  'wds-media',
  false,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

insert into public.portfolio_projects (
  slug,
  title,
  client_name,
  summary,
  project_type,
  scopes,
  status_label,
  visual_tone,
  sort_order,
  is_published
) values
  (
    'marketing-catnip',
    'Marketing Catnip',
    '솔바인드9',
    '복잡한 B2B 마케팅 콘텐츠를 살아 있는 브랜드 경험으로 전환했습니다.',
    'B2B 콘텐츠 플랫폼',
    array['기획', '정보 구조', 'UX/UI', '반응형 웹', '관리자 기획', '품질 검수'],
    '출시',
    'orange',
    10,
    true
  ),
  (
    'timeattack',
    'TimeAttack',
    null,
    '보이지 않는 데이터와 컨설팅 역량을 이해할 수 있는 기업 웹사이트로 만들었습니다.',
    '기업 웹사이트',
    array['기획', 'UX/UI', '아임웹 개발'],
    '출시',
    'black',
    20,
    true
  ),
  (
    'questboard',
    'Questboard',
    null,
    'AI 교육 콘텐츠 제작의 복잡한 흐름을 교사 중심의 제품 경험으로 설계했습니다.',
    'AI 교육 제품',
    array['제품 기획', 'UX/UI', '디자인 시스템', '개발 협업'],
    '출시',
    'white',
    30,
    true
  )
on conflict (slug) do nothing;

alter table public.portfolio_projects enable row level security;
alter table public.portfolio_projects force row level security;
alter table public.media_assets enable row level security;
alter table public.media_assets force row level security;
alter table public.legal_documents enable row level security;
alter table public.legal_documents force row level security;

create policy portfolio_projects_admin_all
on public.portfolio_projects
for all
to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

create policy media_assets_admin_all
on public.media_assets
for all
to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

create policy legal_documents_admin_all
on public.legal_documents
for all
to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

create policy wds_media_admin_select
on storage.objects
for select
to authenticated
using (bucket_id = 'wds-media' and (select private.is_admin()));

create policy wds_media_admin_insert
on storage.objects
for insert
to authenticated
with check (bucket_id = 'wds-media' and (select private.is_admin()));

create policy wds_media_admin_update
on storage.objects
for update
to authenticated
using (bucket_id = 'wds-media' and (select private.is_admin()))
with check (bucket_id = 'wds-media' and (select private.is_admin()));

create policy wds_media_admin_delete
on storage.objects
for delete
to authenticated
using (bucket_id = 'wds-media' and (select private.is_admin()));

revoke all on public.portfolio_projects from anon, authenticated;
revoke all on public.media_assets from anon, authenticated;
revoke all on public.legal_documents from anon, authenticated;

grant select, insert, update, delete on public.portfolio_projects to authenticated;
grant select, insert, update, delete on public.media_assets to authenticated;
grant select, insert, update, delete on public.legal_documents to authenticated;

revoke all on function private.set_content_audit_fields() from public;
revoke all on function public.publish_legal_document(uuid) from public, anon;
grant execute on function public.publish_legal_document(uuid) to authenticated;

commit;
