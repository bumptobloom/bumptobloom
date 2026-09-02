select *
from (
  select 'parent_profiles' as table_name, count(*) as total_rows from parent_profiles
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
  select 'ai_runs', count(*) from ai_runs
) as private_table_counts
order by table_name;
