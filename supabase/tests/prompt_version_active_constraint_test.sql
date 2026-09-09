begin;

-- 0002_prompt_version_active_constraint.sql seeds exactly one active row.
-- Confirm that's still true before testing anything else.
select 'active rows before test' as stage, count(*) as active_count
from prompt_versions
where active;

-- Inserting a brand-new version already marked active is a legitimate
-- one-step "switch" -- the trigger fires on INSERT too, so it correctly
-- takes over as the sole active row rather than being rejected.
insert into prompt_versions (version, system_prompt, model, active)
values ('test-v2', 'test prompt v2', 'gpt-4o-mini', true);

do $$
declare
  active_count int;
  active_version text;
begin
  select count(*), max(version) into active_count, active_version
  from prompt_versions where active;

  if active_count != 1 or active_version != 'test-v2' then
    raise exception 'FAIL: insert-as-active did not result in exactly test-v2 being active (count=%, version=%)',
      active_count, active_version;
  end if;

  raise notice 'PASS: inserting a new row as active correctly deactivated the previous one';
end $$;

-- Rolling back is the same one-row UPDATE pattern, naming the previous
-- version instead. Not a special operation.
update prompt_versions set active = true where version = '2026.09.2';

do $$
declare
  active_count int;
  active_version text;
begin
  select count(*), max(version) into active_count, active_version
  from prompt_versions where active;

  if active_count != 1 or active_version != '2026.09.2' then
    raise exception 'FAIL: rollback did not restore 2026.09.2 as the only active row (count=%, version=%)',
      active_count, active_version;
  end if;

  raise notice 'PASS: rolled back to 2026.09.2 with a single-row UPDATE';
end $$;

-- The trigger handles every normal INSERT/UPDATE path, so the plain unique
-- index is only ever reached if the trigger is bypassed entirely. Disable
-- it deliberately here to prove the index is still a real backstop, not
-- dead code -- this only affects this transaction, which rolls back.
alter table prompt_versions disable trigger prompt_versions_single_active;

do $$
begin
  insert into prompt_versions (version, system_prompt, model, active)
  values ('test-bypassing-trigger', 'test prompt', 'gpt-4o-mini', true);

  raise exception 'FAIL: a second active row was inserted with the trigger disabled -- the index did not reject it';
exception
  when unique_violation then
    raise notice 'PASS: with the trigger disabled, the index still rejects a second active row';
end $$;

select 'active rows after test' as stage, count(*) as active_count
from prompt_versions
where active;

rollback;
