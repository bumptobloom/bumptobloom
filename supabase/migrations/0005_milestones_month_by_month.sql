-- Month-by-month milestones (Vishnu's sheet, 15 Sep) plus the "What is Typical"
-- copy that Home, Track and Learn all show.
--
-- WHY THERE IS NO DELETE ANYWHERE IN HERE.
--
-- milestones.id is uuid5 over (checkpoint_month, domain, sort_order), and
-- baby_milestones.milestone_id references it ON DELETE CASCADE. The new data
-- is month-by-month 0-24; the old seed was five checkpoints (2, 6, 12, 18, 24)
-- with a different number of rows per domain. Deleting rows the new import
-- does not reach would silently cascade away every milestone a mother has
-- ticked. So rows are retired, never removed, and her history survives even
-- for a milestone we stopped showing.
--
-- social_emotional rows are deliberately left untouched and unretired. Vishnu,
-- 15 Sep: "keep the rows in the db, we will turn them on after we have a
-- working product." Track queries three domains, so they are already dormant.

begin;

alter table milestones
  add column if not exists retired_at timestamptz;

comment on column milestones.retired_at is
  'Set when a milestone is superseded by a later import. Never delete a '
  'milestone row: baby_milestones cascades on delete and that is a mother''s '
  'record of her own child. Readers filter on retired_at is null.';

create index if not exists milestones_active_idx
  on milestones(checkpoint_month, domain)
  where retired_at is null;

-- The per-month "What is Typical" overview. One row per month, shown on Home
-- (US-004), Track (US-03) and as Learn's first card (US-1) -- the PRD says
-- Learn's is "the same as the Home page displayed", so it has one source.
create table if not exists month_guidance (
  month      int primary key check (month between 0 and 24),
  typical    text not null,
  source_url text,
  updated_at timestamptz not null default now()
);

comment on table month_guidance is
  'Per-month what-is-typical copy from Vishnu''s milestone sheet. Note the '
  'sheet''s own caveat: intermediate months are mapped to the younger CDC '
  'checklist, and this copy is not an official CDC month-by-month checklist.';

alter table month_guidance enable row level security;

-- Reference content, same treatment as milestones: readable by any signed-in
-- parent, writable only by service role.
create policy "read month guidance" on month_guidance
  for select using (auth.role() = 'authenticated');

commit;
