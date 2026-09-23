-- Thumbs up / thumbs down on an Ask answer, per Figma frame 05 (Bloom
-- companion), approved 22 Sep.
--
-- A column on ai_messages rather than a new table or a column on ai_runs:
--
--   * ai_runs is server-recorded metadata written with the service role. A
--     parent must never write to it, and feedback is the parent's.
--   * ai_messages already carries the RLS policy "own messages" FOR ALL,
--     scoped through ai_conversations to parent_profiles.user_id. A column
--     here inherits that with no new policy, so a parent can only rate a
--     message in a conversation she owns.
--
-- Additive and nullable. No existing row changes, nothing cascades, and
-- rating is absent rather than neutral until she actually taps one.

alter table ai_messages
  add column if not exists feedback smallint
    check (feedback is null or feedback in (-1, 1));

comment on column ai_messages.feedback is
  'Parent rating of an assistant turn: 1 thumbs up, -1 thumbs down, null not rated.';

-- Answers are the only thing that can be rated. A parent rating her own
-- question, or a system turn, is a bug rather than a feature.
create index if not exists ai_messages_feedback_idx
  on ai_messages(conversation_id)
  where feedback is not null;
