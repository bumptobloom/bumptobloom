-- Database-level proof that 0008_temperature_readings_range.sql actually
-- rejects impossible readings, asked for by Keya reviewing #224.
--
-- The point of this test is that it does NOT go through
-- validateNewReading(). It writes straight to the table, which is exactly what
-- a direct PostgREST call or a future code path would do. If the constraint is
-- missing, the out-of-range inserts below silently succeed and this fails.
--
-- Runs against the permanent RLS fixture dataset. Baby A is
-- 20000000-0000-4000-8000-000000000001, seeded by seed_rls_test_dataset.sql.
-- Everything happens inside a transaction that is rolled back, so no fixture
-- row is added or changed. Do not run teardown_rls_test_dataset.sql for this.

begin;

-- Fail loudly rather than silently passing if the fixture is not there.
-- This is the "a check that passes when there is nothing to check" trap.
do $$
begin
  if not exists (
    select 1 from babies where id = '20000000-0000-4000-8000-000000000001'
  ) then
    raise exception 'FAIL: fixture baby A is missing, so this test proves nothing';
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'temperature_readings_temp_f_range'
  ) then
    raise exception 'FAIL: constraint temperature_readings_temp_f_range does not exist';
  end if;

  raise notice 'PASS: fixture baby and constraint both present';
end $$;

-- Below the floor.
do $$
begin
  insert into temperature_readings (baby_id, temp_f, method)
  values ('20000000-0000-4000-8000-000000000001', 89.9, 'rectal');

  raise exception 'FAIL: 89.9 F was accepted, the constraint is not doing its job';
exception
  when check_violation then
    raise notice 'PASS: 89.9 F rejected by the check constraint';
end $$;

-- Above the ceiling.
do $$
begin
  insert into temperature_readings (baby_id, temp_f, method)
  values ('20000000-0000-4000-8000-000000000001', 110.1, 'rectal');

  raise exception 'FAIL: 110.1 F was accepted, the constraint is not doing its job';
exception
  when check_violation then
    raise notice 'PASS: 110.1 F rejected by the check constraint';
end $$;

-- Both edges are legal. temperature-utils.ts accepts them, so the database
-- has to agree or the two layers disagree about the same reading.
do $$
declare
  accepted int;
begin
  insert into temperature_readings (baby_id, temp_f, method)
  values
    ('20000000-0000-4000-8000-000000000001', 90, 'rectal'),
    ('20000000-0000-4000-8000-000000000001', 110, 'rectal'),
    ('20000000-0000-4000-8000-000000000001', 99.4, 'axillary');

  get diagnostics accepted = row_count;

  if accepted != 3 then
    raise exception 'FAIL: expected 3 in-range rows to insert, got %', accepted;
  end if;

  raise notice 'PASS: 90, 110 and 99.4 all accepted';
end $$;

rollback;
