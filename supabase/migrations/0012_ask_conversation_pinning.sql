alter table ai_conversations
  add column is_pinned boolean not null default false;

drop index if exists ai_conversations_parent_idx;

create index ai_conversations_parent_idx
  on ai_conversations(parent_id, is_pinned desc, created_at desc);
