begin;

update public.portfolio_projects
set detail_published = true
where slug in ('marketing-catnip', 'timeattack', 'questboard')
  and is_published = true;

commit;
