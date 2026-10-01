-- Thumbs up / thumbs down on an Ask answer.
--
-- Feedback belongs on ai_messages rather than ai_runs because ai_runs is
-- server-recorded metadata. ai_messages already has the owner-scoped RLS
-- policy, so ratings inherit the same conversation ownership rules.

alter table ai_messages
  add column if not exists feedback smallint
    check (feedback is null or feedback in (-1, 1));

comment on column ai_messages.feedback is
  'Parent rating of an assistant turn: 1 thumbs up, -1 thumbs down, null not rated.';

create index if not exists ai_messages_feedback_idx
  on ai_messages(conversation_id)
  where feedback is not null;
