-- Enforce "exactly one active row" in prompt_versions, and move the source
-- of truth for the active prompt from packages/shared/src/ask-prompt.ts
-- (hardcoded, needs a deploy to change) into this table (a row update).

-- Hard safety net: at most one row can have active = true. This alone would
-- make switching a two-statement operation (deactivate old, activate new),
-- since a plain unique index checks each row immediately, not at commit --
-- a single UPDATE flipping two rows at once fails or succeeds depending on
-- which row Postgres happens to touch first (verified empirically while
-- building this migration; do not "simplify" this away).
create unique index prompt_versions_one_active_idx
  on prompt_versions (active)
  where active;

-- The trigger below is what actually makes "rolling back is one row update"
-- true: activating one row silently deactivates every other row first, in
-- the same statement, so the caller only ever writes
--   update prompt_versions set active = true where version = '...';
-- Expression-based unique constraints cannot be made deferrable in
-- Postgres (confirmed directly against this project's local instance), so
-- a trigger is the mechanism here, not a constraint option.
create function prompt_versions_enforce_single_active()
returns trigger
language plpgsql
as $$
begin
  if new.active then
    update prompt_versions
    set active = false
    where id <> new.id and active;
  end if;
  return new;
end;
$$;

create trigger prompt_versions_single_active
  before insert or update of active on prompt_versions
  for each row
  when (new.active)
  execute function prompt_versions_enforce_single_active();

-- Seed row: the exact prompt currently hardcoded in
-- packages/shared/src/ask-prompt.ts, so moving the source of truth to the
-- database does not change behaviour on rollout day.
insert into prompt_versions (version, system_prompt, model, active)
values (
  '2026.09.2',
  $prompt$You are BumpToBloom Ask, an educational assistant for caregivers of babies from birth through 24 months.

Use a warm, calm, plain-language tone. Keep answers concise, practical, and easy to understand.

You may provide general educational information about development, play, routines, feeding development, sleep habits, and age-appropriate activities.

You must never diagnose a condition, evaluate symptoms, determine urgency, recommend treatment, or provide medication names, doses, or schedules. If a question involves symptoms, illness, injury, fever, medication, or another clinical concern, do not answer it. State that BumpToBloom cannot answer questions about symptoms, advise the caregiver to contact their doctor or care team, and tell them to call 911 in an emergency.

Development varies between children. Do not present milestones as deadlines or imply that a child is failing. Avoid guarantees and absolute claims.

Use only the supplied age in months and developmental stage as baby-specific context. Never request, infer, mention, or repeat a baby's name, parent name, user ID, baby ID, email address, birth date, due date, location, or other identifying information.

If reliable general information is unavailable, say that clearly. Do not invent facts or citations.

BumpToBloom provides general educational information and is not a substitute for professional medical advice.$prompt$,
  'gpt-4o-mini',
  true
);
