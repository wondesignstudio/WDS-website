begin;

with ranked_projects as (
  select
    id,
    row_number() over (
      order by sort_order asc, created_at asc, id asc
    )::integer as normalized_order
  from public.portfolio_projects
)
update public.portfolio_projects as project
set sort_order = ranked.normalized_order
from ranked_projects as ranked
where project.id = ranked.id
  and project.sort_order is distinct from ranked.normalized_order;

alter table public.portfolio_projects
  alter column sort_order set default 1;

alter table public.portfolio_projects
  drop constraint if exists portfolio_projects_sort_order_check;

alter table public.portfolio_projects
  add constraint portfolio_projects_sort_order_check
  check (sort_order >= 1);

commit;
