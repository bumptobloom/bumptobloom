begin;

select set_config(
  'request.jwt.claim.sub',
  (
    select id::text
    from auth.users
    where email = 'mom-b@bumptobloom.test'
  ),
  true
);

select set_config(
  'request.jwt.claim.role',
  'authenticated',
  true
);

set local role authenticated;

select 'parent_profiles' as table_name, count(*) as visible_rows
from parent_profiles
union all
select 'babies', count(*) from babies
union all
select 'baby_milestones', count(*) from baby_milestones
union all
select 'baby_activities', count(*) from baby_activities
union all
select 'saved_content', count(*) from saved_content
union all
select 'fever_checks', count(*) from fever_checks
union all
select 'ai_conversations', count(*) from ai_conversations
union all
select 'ai_messages', count(*) from ai_messages
union all
select 'ai_runs', count(*) from ai_runs;

rollback;
