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
  6,
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
  0,
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
  true
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
  true
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
