begin;

-- prompt_versions has RLS enabled with no user-facing policies (see
-- supabase/migrations/0001_init.sql) -- only the service role can reach
-- it. This is what apps/web/src/lib/ask/prompt-version.ts relies on by
-- using createServiceRoleClient() instead of the cookie-based client.

select set_config('request.jwt.claim.role', 'authenticated', true);
set local role authenticated;

do $$
declare
  visible_count int;
begin
  select count(*) into visible_count from prompt_versions;

  if visible_count != 0 then
    raise exception 'FAIL: authenticated role can see % row(s) in prompt_versions -- RLS should deny this entirely',
      visible_count;
  end if;

  raise notice 'PASS: authenticated role sees zero rows in prompt_versions, as RLS with no policies intends';
end $$;

reset role;

set local role service_role;

do $$
declare
  visible_count int;
begin
  select count(*) into visible_count from prompt_versions where active;

  if visible_count != 1 then
    raise exception 'FAIL: service_role sees % active row(s) in prompt_versions, expected exactly 1',
      visible_count;
  end if;

  raise notice 'PASS: service_role correctly sees the active prompt_versions row';
end $$;

reset role;

rollback;
