alter table ai_messages
  add column sources jsonb not null default '[]'::jsonb;

alter table ai_messages
  add constraint ai_messages_sources_array
  check (jsonb_typeof(sources) = 'array');
