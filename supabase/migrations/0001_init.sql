-- BumpToBloom — initial schema
-- Scope: 0–24 months only (ADR-002). No pregnancy tables in the MVP.
--
-- Design notes:
--  * babies stores birth_date, NOT an age. Age is always derived. This closes
--    the "what about kids between months?" question in the design-change log
--    and gives us premie support later for free (see due_date).
--  * Every table holding parent or baby data has RLS on. Public content tables
--    are readable by any authenticated user but writable only by service role.

create extension if not exists "uuid-ossp";

-- ============================================================
-- USER
-- ============================================================

create table parent_profiles (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null unique references auth.users(id) on delete cascade,
  full_name     text not null,
  timezone      text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table babies (
  id            uuid primary key default uuid_generate_v4(),
  parent_id     uuid not null references parent_profiles(id) on delete cascade,
  name          text not null,
  -- Source of truth for age. Never store a month number.
  birth_date    date not null,
  -- For babies born preterm: corrected age = birth_date adjusted by
  -- (due_date - birth_date). Null for term babies.
  due_date      date,
  avatar_path   text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  constraint birth_date_not_future check (birth_date <= current_date),
  -- MVP scope guard: 0–24 months.
  constraint birth_date_within_scope check (birth_date > current_date - interval '25 months')
);

create index babies_parent_id_idx on babies(parent_id);

-- Age in months, derived. Use this everywhere instead of a stored column.
create or replace function baby_age_months(b babies)
returns numeric language sql stable as $$
  select round(extract(epoch from (now() - b.birth_date::timestamptz)) / 2629746.0, 1);
$$;

-- ============================================================
-- TRACK
-- ============================================================

create table milestones (
  id            uuid primary key default uuid_generate_v4(),
  -- Master sheet lists "Social emotional, Language cognitive and movement" in one
  -- row and "at least three types Physical, Cognitive and Language" in another.
  -- We store all four; social_emotional is a Should-have, not a launch blocker.
  domain        text not null check (domain in ('physical','cognitive','language','social_emotional')),
  -- Checkpoint in months: 0,2,4,6,9,12,15,18,24 — matches the CDC
  -- "Learn the Signs. Act Early." schedule.
  checkpoint_month int not null check (checkpoint_month between 0 and 24),
  title         text not null,
  description   text,
  source        text not null default 'CDC Learn the Signs. Act Early.',
  source_url    text,
  sort_order    int not null default 0,
  created_at    timestamptz not null default now()
);

create index milestones_checkpoint_idx on milestones(checkpoint_month, domain);

create table baby_milestones (
  id            uuid primary key default uuid_generate_v4(),
  baby_id       uuid not null references babies(id) on delete cascade,
  milestone_id  uuid not null references milestones(id) on delete cascade,
  noticed_at    timestamptz not null default now(),
  unique (baby_id, milestone_id)
);

create index baby_milestones_baby_idx on baby_milestones(baby_id);

create table activities (
  id            uuid primary key default uuid_generate_v4(),
  title         text not null,
  description   text,
  min_age_month int not null check (min_age_month >= 0),
  max_age_month int not null check (max_age_month <= 24),
  domain        text,
  created_at    timestamptz not null default now(),
  constraint activity_age_range_valid check (min_age_month <= max_age_month)
);

create table baby_activities (
  id            uuid primary key default uuid_generate_v4(),
  baby_id       uuid not null references babies(id) on delete cascade,
  activity_id   uuid not null references activities(id) on delete cascade,
  completed_at  timestamptz not null default now(),
  unique (baby_id, activity_id)
);

create index baby_activities_baby_idx on baby_activities(baby_id);

-- ============================================================
-- LEARN
-- ============================================================

create table content (
  id            uuid primary key default uuid_generate_v4(),
  -- Categories per the Master sheet ("Baby - Learn": Developmental, Feeding,
  -- Sleep, Diaper). The tech-stack doc listed six and the Figma showed three
  -- pregnancy-flavoured ones; the Master sheet is the team's agreed scope and
  -- wins. Adding a category later is a one-line migration.
  category      text not null check (category in
                  ('developmental','feeding','sleep','diaper')),
  title         text not null,
  body          text not null,
  min_age_month int not null check (min_age_month >= 0),
  max_age_month int not null check (max_age_month <= 24),
  -- Displayed on every card. Parents deserve to know where advice came from,
  -- and it is what makes this different from a forum post.
  source_label  text not null,
  source_url    text,
  version       int not null default 1,
  published     boolean not null default false,
  created_at    timestamptz not null default now(),
  constraint content_age_range_valid check (min_age_month <= max_age_month)
);

create index content_age_idx on content(min_age_month, max_age_month) where published;

create table saved_content (
  id            uuid primary key default uuid_generate_v4(),
  parent_id     uuid not null references parent_profiles(id) on delete cascade,
  content_id    uuid not null references content(id) on delete cascade,
  saved_at      timestamptz not null default now(),
  unique (parent_id, content_id)
);

-- ============================================================
-- HEALTH
-- ============================================================

create table fever_checks (
  id                  uuid primary key default uuid_generate_v4(),
  baby_id             uuid not null references babies(id) on delete cascade,
  age_months_at_check numeric(4,1) not null,
  temp_f              numeric(4,1) not null,
  method              text not null check (method in ('rectal','oral','axillary','temporal','tympanic')),
  rectal_equivalent_f numeric(4,1) not null,
  red_flags           text[] not null default '{}',
  tier                text not null check (tier in ('HOME','CALL','EMERGENCY')),
  -- Which rule fired. Essential for auditing a triage decision after the fact.
  rule_id             text not null,
  -- Which version of the reviewed rule set produced this. Never overwrite.
  rules_version       text not null,
  created_at          timestamptz not null default now()
);

create index fever_checks_baby_idx on fever_checks(baby_id, created_at desc);

-- ============================================================
-- ACT (product recommendations)
-- ============================================================

create table product_categories (
  id            uuid primary key default uuid_generate_v4(),
  slug          text not null unique,
  name          text not null
);

create table products (
  id            uuid primary key default uuid_generate_v4(),
  category_id   uuid not null references product_categories(id),
  name          text not null,
  -- The "why this product" line. Required on every card — a recommendation
  -- without a reason is just an advert.
  rationale     text not null,
  indicative_price_cents int,
  image_path    text,
  created_at    timestamptz not null default now()
);

create table retailers (
  id            uuid primary key default uuid_generate_v4(),
  slug          text not null unique check (slug in ('amazon','target','walmart')),
  name          text not null
);

create table product_retailers (
  id            uuid primary key default uuid_generate_v4(),
  product_id    uuid not null references products(id) on delete cascade,
  retailer_id   uuid not null references retailers(id) on delete cascade,
  url           text not null,
  unique (product_id, retailer_id)
);

create table product_recommendation_rules (
  id            uuid primary key default uuid_generate_v4(),
  product_id    uuid not null references products(id) on delete cascade,
  min_age_month int not null check (min_age_month >= 0),
  max_age_month int not null check (max_age_month <= 24),
  priority      int not null default 0,
  constraint rec_age_range_valid check (min_age_month <= max_age_month)
);

create index rec_rules_age_idx on product_recommendation_rules(min_age_month, max_age_month);

-- ============================================================
-- ASK (AI)
-- ============================================================

create table prompt_versions (
  id            uuid primary key default uuid_generate_v4(),
  version       text not null unique,
  system_prompt text not null,
  model         text not null,
  active        boolean not null default false,
  created_at    timestamptz not null default now()
);

create table ai_conversations (
  id            uuid primary key default uuid_generate_v4(),
  parent_id     uuid not null references parent_profiles(id) on delete cascade,
  baby_id       uuid references babies(id) on delete set null,
  title         text,
  created_at    timestamptz not null default now()
);

create index ai_conversations_parent_idx on ai_conversations(parent_id, created_at desc);

create table ai_messages (
  id              uuid primary key default uuid_generate_v4(),
  conversation_id uuid not null references ai_conversations(id) on delete cascade,
  role            text not null check (role in ('user','assistant','system')),
  content         text not null,
  created_at      timestamptz not null default now()
);

create index ai_messages_conversation_idx on ai_messages(conversation_id, created_at);

create table ai_runs (
  id              uuid primary key default uuid_generate_v4(),
  message_id      uuid not null references ai_messages(id) on delete cascade,
  prompt_version  text not null,
  model           text not null,
  input_tokens    int,
  output_tokens   int,
  latency_ms      int,
  -- Did the response pass Pydantic/Zod validation?
  validation_ok   boolean not null,
  -- Did we detect a medical question and redirect to Health?
  redirected_to_health boolean not null default false,
  created_at      timestamptz not null default now()
);

-- ============================================================
-- SYSTEM
-- ============================================================

create table audit_events (
  id            uuid primary key default uuid_generate_v4(),
  actor_user_id uuid,
  event_type    text not null,
  entity        text,
  entity_id     uuid,
  payload       jsonb,
  created_at    timestamptz not null default now()
);

create index audit_events_created_idx on audit_events(created_at desc);

-- ============================================================
-- ROW LEVEL SECURITY
-- Mom A must never reach Mom B's data. Tech stack doc §14.
-- ============================================================

alter table parent_profiles  enable row level security;
alter table babies           enable row level security;
alter table baby_milestones  enable row level security;
alter table baby_activities  enable row level security;
alter table saved_content    enable row level security;
alter table fever_checks     enable row level security;
alter table ai_conversations enable row level security;
alter table ai_messages      enable row level security;
alter table ai_runs          enable row level security;

-- Admin-only tables. RLS is enabled with NO policies, which denies every client
-- request outright; only the service role reaches them. Leaving RLS off here
-- would make them readable with the public anon key.
alter table prompt_versions enable row level security;
alter table audit_events    enable row level security;

-- Published/reference tables: readable by any signed-in user, never writable
-- from the client. Seeded by service role only.
alter table milestones                   enable row level security;
alter table activities                   enable row level security;
alter table content                      enable row level security;
alter table product_categories           enable row level security;
alter table products                     enable row level security;
alter table retailers                    enable row level security;
alter table product_retailers            enable row level security;
alter table product_recommendation_rules enable row level security;

create policy "own profile" on parent_profiles
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "own babies" on babies
  for all using (
    parent_id in (select id from parent_profiles where user_id = auth.uid())
  ) with check (
    parent_id in (select id from parent_profiles where user_id = auth.uid())
  );

-- Helper: is this baby mine?
create or replace function owns_baby(b uuid)
returns boolean language sql stable security definer as $$
  select exists (
    select 1 from babies bb
    join parent_profiles pp on pp.id = bb.parent_id
    where bb.id = b and pp.user_id = auth.uid()
  );
$$;

create policy "own baby milestones" on baby_milestones
  for all using (owns_baby(baby_id)) with check (owns_baby(baby_id));

create policy "own baby activities" on baby_activities
  for all using (owns_baby(baby_id)) with check (owns_baby(baby_id));

create policy "own fever checks" on fever_checks
  for all using (owns_baby(baby_id)) with check (owns_baby(baby_id));

create policy "own saved content" on saved_content
  for all using (
    parent_id in (select id from parent_profiles where user_id = auth.uid())
  ) with check (
    parent_id in (select id from parent_profiles where user_id = auth.uid())
  );

create policy "own conversations" on ai_conversations
  for all using (
    parent_id in (select id from parent_profiles where user_id = auth.uid())
  ) with check (
    parent_id in (select id from parent_profiles where user_id = auth.uid())
  );

create policy "own messages" on ai_messages
  for all using (
    conversation_id in (
      select c.id from ai_conversations c
      join parent_profiles p on p.id = c.parent_id
      where p.user_id = auth.uid()
    )
  ) with check (
    conversation_id in (
      select c.id from ai_conversations c
      join parent_profiles p on p.id = c.parent_id
      where p.user_id = auth.uid()
    )
  );

create policy "own runs" on ai_runs
  for select using (
    message_id in (
      select m.id from ai_messages m
      join ai_conversations c on c.id = m.conversation_id
      join parent_profiles p on p.id = c.parent_id
      where p.user_id = auth.uid()
    )
  );

-- Reference data: read-only to authenticated users.
create policy "read milestones"  on milestones                   for select using (auth.role() = 'authenticated');
create policy "read activities"  on activities                   for select using (auth.role() = 'authenticated');
create policy "read content"     on content                      for select using (auth.role() = 'authenticated' and published);
create policy "read categories"  on product_categories           for select using (auth.role() = 'authenticated');
create policy "read products"    on products                     for select using (auth.role() = 'authenticated');
create policy "read retailers"   on retailers                    for select using (auth.role() = 'authenticated');
create policy "read prod_ret"    on product_retailers            for select using (auth.role() = 'authenticated');
create policy "read rec_rules"   on product_recommendation_rules for select using (auth.role() = 'authenticated');
