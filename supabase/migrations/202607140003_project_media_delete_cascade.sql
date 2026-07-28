begin;

alter table public.media_assets
  drop constraint if exists media_assets_project_id_fkey;

alter table public.media_assets
  add constraint media_assets_project_id_fkey
  foreign key (project_id)
  references public.portfolio_projects(id)
  on delete cascade;

commit;
