select
  count(*) as total_tables,
  count(*) filter (where rowsecurity) as tables_with_rls
from pg_tables
where schemaname = 'public';
