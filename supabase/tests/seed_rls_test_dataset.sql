-- Seeds the fixtures the RLS verification scripts read.
--
-- This script ends in COMMIT, not ROLLBACK, because the verification scripts
-- run in separate sessions and need the rows to still exist. That is
-- deliberate, not an oversight.
--
-- These fixtures are expected to LIVE PERMANENTLY in the shared database.
-- .github/workflows/ci.yml runs supabase/tests/btb_rls_check.py on every pull
-- request, and that script asserts these exact rows exist and are visible to
-- the right account. Delete them and CI fails on every PR, including ones that
-- touch nothing but CSS. That happened on 11 Sep 2026.
--
-- The nine per-account rows are safe to leave: RLS scopes them, so nobody but
-- the two test accounts can see them.
--
-- The four shared reference rows are the ones that needed care, because they
-- sit in tables every user reads. Each is now inert even when left behind:
--   milestone       checkpoint 0, which the app never queries
--   activity        24 to 24 months, the narrowest window the schema allows
--   content         unpublished, so the read policy hides it from everyone
--   prompt version  inactive, so it can never become the live system prompt

begin;

do $$
begin
  if (
    select count(*)
    from auth.users
    where email in (
      'mom-a@bumptobloom.test',
      'mom-b@bumptobloom.test'
    )
  ) <> 2 then
    raise exception 'Both test Auth users must exist before seeding';
  end if;
end $$;

-- Fake parent profiles
insert into parent_profiles (id, user_id, full_name, timezone)
select
  '10000000-0000-4000-8000-000000000001',
  id,
  'Test Parent A',
  'America/Los_Angeles'
from auth.users
where email = 'mom-a@bumptobloom.test'
on conflict do nothing;

insert into parent_profiles (id, user_id, full_name, timezone)
select
  '10000000-0000-4000-8000-000000000002',
  id,
  'Test Parent B',
  'America/New_York'
from auth.users
where email = 'mom-b@bumptobloom.test'
on conflict do nothing;

-- Shared fake reference records
insert into milestones (
  id, domain, checkpoint_month, title, description, source, source_url
) values (
  '30000000-0000-4000-8000-000000000001',
  'physical',
  -- Checkpoint 0 on purpose. The app only queries 2, 6, 12, 18 and 24, so if
  -- this row is ever left behind it cannot appear on the Track screen. It used
  -- to be 6, and in September it did show up in the live database.
  0,
  'Test milestone',
  'Synthetic RLS test data',
  'Synthetic test source',
  'https://example.com'
)
on conflict do nothing;

insert into activities (
  id, title, description, min_age_month, max_age_month, domain
) values (
  '40000000-0000-4000-8000-000000000001',
  'Test activity',
  'Synthetic RLS test data',
  -- Narrowed to the 24-month band. activities has no published flag and the
  -- schema caps max_age_month at 24, so this is the smallest window available.
  -- It exists only as the FK parent for baby_activities; nothing reads it.
  24,
  24,
  'physical'
)
on conflict do nothing;

insert into content (
  id, category, title, body, min_age_month, max_age_month,
  source_label, source_url, published
) values (
  '50000000-0000-4000-8000-000000000001',
  'developmental',
  'Test content',
  'Synthetic RLS test content',
  0,
  24,
  'Synthetic test source',
  'https://example.com',
  -- Unpublished on purpose. The "read content" policy requires published, so
  -- an unpublished row is invisible to every user while still serving as the
  -- FK parent for saved_content, which is what the RLS check actually reads.
  false
)
on conflict do nothing;

-- One fake baby per account
insert into babies (id, parent_id, name, birth_date)
values
  (
    '20000000-0000-4000-8000-000000000001',
    '10000000-0000-4000-8000-000000000001',
    'Test Baby A',
    (current_date - interval '6 months')::date
  ),
  (
    '20000000-0000-4000-8000-000000000002',
    '10000000-0000-4000-8000-000000000002',
    'Test Baby B',
    (current_date - interval '7 months')::date
  )
on conflict do nothing;

-- Private Track records
insert into baby_milestones (id, baby_id, milestone_id)
values
  (
    '31000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000001',
    '30000000-0000-4000-8000-000000000001'
  ),
  (
    '31000000-0000-4000-8000-000000000002',
    '20000000-0000-4000-8000-000000000002',
    '30000000-0000-4000-8000-000000000001'
  )
on conflict do nothing;

insert into baby_activities (id, baby_id, activity_id)
values
  (
    '41000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000001',
    '40000000-0000-4000-8000-000000000001'
  ),
  (
    '41000000-0000-4000-8000-000000000002',
    '20000000-0000-4000-8000-000000000002',
    '40000000-0000-4000-8000-000000000001'
  )
on conflict do nothing;

-- Private Learn records
insert into saved_content (id, parent_id, content_id)
values
  (
    '51000000-0000-4000-8000-000000000001',
    '10000000-0000-4000-8000-000000000001',
    '50000000-0000-4000-8000-000000000001'
  ),
  (
    '51000000-0000-4000-8000-000000000002',
    '10000000-0000-4000-8000-000000000002',
    '50000000-0000-4000-8000-000000000001'
  )
on conflict do nothing;

-- Private Health records
insert into fever_checks (
  id, baby_id, age_months_at_check, temp_f, method,
  rectal_equivalent_f, red_flags, tier, rule_id, rules_version
) values
  (
    '60000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000001',
    6.0, 99.0, 'rectal', 99.0, '{}', 'HOME',
    'SYNTHETIC_TEST_RULE', 'test-1'
  ),
  (
    '60000000-0000-4000-8000-000000000002',
    '20000000-0000-4000-8000-000000000002',
    7.0, 99.0, 'rectal', 99.0, '{}', 'HOME',
    'SYNTHETIC_TEST_RULE', 'test-1'
  )
on conflict do nothing;

-- Private Ask records
insert into ai_conversations (id, parent_id, baby_id, title)
values
  (
    '70000000-0000-4000-8000-000000000001',
    '10000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000001',
    'Synthetic conversation A'
  ),
  (
    '70000000-0000-4000-8000-000000000002',
    '10000000-0000-4000-8000-000000000002',
    '20000000-0000-4000-8000-000000000002',
    'Synthetic conversation B'
  )
on conflict do nothing;

insert into ai_messages (id, conversation_id, role, content)
values
  (
    '71000000-0000-4000-8000-000000000001',
    '70000000-0000-4000-8000-000000000001',
    'user',
    'Synthetic message A'
  ),
  (
    '71000000-0000-4000-8000-000000000002',
    '70000000-0000-4000-8000-000000000002',
    'user',
    'Synthetic message B'
  )
on conflict do nothing;

insert into ai_runs (
  id, message_id, prompt_version, model, input_tokens,
  output_tokens, latency_ms, validation_ok, redirected_to_health
) values
  (
    '72000000-0000-4000-8000-000000000001',
    '71000000-0000-4000-8000-000000000001',
    'test-1', 'synthetic-model', 1, 1, 1, true, false
  ),
  (
    '72000000-0000-4000-8000-000000000002',
    '71000000-0000-4000-8000-000000000002',
    'test-1', 'synthetic-model', 1, 1, 1, true, false
  )
on conflict do nothing;

-- Sentinel rows for admin-only access tests
insert into prompt_versions (
  id, version, system_prompt, model, active
) values (
  '80000000-0000-4000-8000-000000000001',
  'test-1',
  'Synthetic test prompt',
  'synthetic-model',
  -- Inactive on purpose. The admin-only access tests only check that
  -- non-admin roles see zero rows, which does not depend on this flag. An
  -- active synthetic row would be picked up as the live system prompt once
  -- Ask reads its prompt from this table.
  false
)
on conflict do nothing;

insert into audit_events (
  id, event_type, entity, payload
) values (
  '90000000-0000-4000-8000-000000000001',
  'synthetic_rls_seed',
  'rls_test',
  '{"synthetic": true}'::jsonb
)
on conflict do nothing;

commit;
