-- Removes everything seed_rls_test_dataset.sql creates.
--
-- Run this after the RLS suite, every time. The seed script ends in COMMIT
-- rather than ROLLBACK because the verification scripts run in separate
-- sessions and need the fixtures to still be there, which means nothing
-- removes them on its own.
--
-- This is not hypothetical tidiness. On 11 Sep 2026 the August fixtures were
-- still in the production database: a milestone titled "Test milestone" sitting
-- at the 6-month checkpoint, a published content row reading "Synthetic RLS
-- test content" which was the ONLY row in the content table and therefore the
-- one the Home screen would have shown, and a prompt_versions row with
-- active = true and model 'synthetic-model'.
--
-- The two Auth users (mom-a@bumptobloom.test, mom-b@bumptobloom.test) are
-- deliberately NOT deleted. They are created out of band, the seed script
-- refuses to run without them, and deleting them would cascade.
--
-- Safe to run more than once, and safe to run when the fixtures were never
-- seeded.

begin;

-- Ask: runs -> messages -> conversations
delete from ai_runs where id in (
  '72000000-0000-4000-8000-000000000001',
  '72000000-0000-4000-8000-000000000002'
);

delete from ai_messages where id in (
  '71000000-0000-4000-8000-000000000001',
  '71000000-0000-4000-8000-000000000002'
);

delete from ai_conversations where id in (
  '70000000-0000-4000-8000-000000000001',
  '70000000-0000-4000-8000-000000000002'
);

-- Vitals
delete from fever_checks where id in (
  '60000000-0000-4000-8000-000000000001',
  '60000000-0000-4000-8000-000000000002'
);

-- Learn
delete from saved_content where id in (
  '51000000-0000-4000-8000-000000000001',
  '51000000-0000-4000-8000-000000000002'
);

-- Track and activities
delete from baby_activities where id in (
  '41000000-0000-4000-8000-000000000001',
  '41000000-0000-4000-8000-000000000002'
);

delete from baby_milestones where id in (
  '31000000-0000-4000-8000-000000000001',
  '31000000-0000-4000-8000-000000000002'
);

-- Babies, then the profiles that own them
delete from babies where id in (
  '20000000-0000-4000-8000-000000000001',
  '20000000-0000-4000-8000-000000000002'
);

delete from parent_profiles where id in (
  '10000000-0000-4000-8000-000000000001',
  '10000000-0000-4000-8000-000000000002'
);

-- Shared reference rows. These are the dangerous ones: they are not scoped to
-- a test account, so anything left here is visible to every real user.
delete from content    where id = '50000000-0000-4000-8000-000000000001';
delete from activities where id = '40000000-0000-4000-8000-000000000001';
delete from milestones where id = '30000000-0000-4000-8000-000000000001';

-- Admin-only sentinels
delete from prompt_versions where id = '80000000-0000-4000-8000-000000000001';
delete from audit_events   where id = '90000000-0000-4000-8000-000000000001';

-- Fail loudly rather than reporting success on a partial clean-up.
do $$
declare
  leftovers int;
begin
  select
    (select count(*) from milestones      where id = '30000000-0000-4000-8000-000000000001')
  + (select count(*) from activities      where id = '40000000-0000-4000-8000-000000000001')
  + (select count(*) from content         where id = '50000000-0000-4000-8000-000000000001')
  + (select count(*) from prompt_versions where id = '80000000-0000-4000-8000-000000000001')
  + (select count(*) from audit_events    where id = '90000000-0000-4000-8000-000000000001')
  + (select count(*) from babies          where id in (
      '20000000-0000-4000-8000-000000000001',
      '20000000-0000-4000-8000-000000000002'))
  + (select count(*) from parent_profiles where id in (
      '10000000-0000-4000-8000-000000000001',
      '10000000-0000-4000-8000-000000000002'))
  into leftovers;

  if leftovers <> 0 then
    raise exception 'FAIL: % RLS fixture row(s) survived teardown', leftovers;
  end if;

  raise notice 'PASS: no RLS test fixtures remain';
end $$;

commit;
