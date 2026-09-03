begin;

select set_config(
  'request.jwt.claim.role',
  'anon',
  true
);

set local role anon;

select 'prompt_versions' as table_name, count(*) as visible_rows
from prompt_versions
union all
select 'audit_events', count(*)
from audit_events;

rollback;
