-- One-time production data migration for the month-by-month Track release.
--
-- GENERATED FILE — do not edit by hand.
-- Regenerate: python3 scripts/build_milestone_seed.py
--
-- Production releases must apply supabase/migrations in order; neither CI nor
-- Vercel executes supabase/seed. This migration deliberately carries
-- a snapshot of the generated seed statements so schema and required
-- reference data are deployed together. Keep the seed files as the
-- re-runnable source for local/dev environments.

begin;

-- milestone rows --
-- ============================================================
-- MILESTONE SEED DATA
-- GENERATED FILE — do not edit by hand.
-- Source: data/milestones/milestones_0_24.csv
-- Regenerate: python3 scripts/build_milestone_seed.py
--
-- 185 milestones across 25 CDC checkpoints
-- (0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24 months) and four domains.
--
-- Source: CDC "Learn the Signs. Act Early." Every row carries its own
-- source and source_url; the per-row values win over this comment.
--
-- Applied with the service role, never from the client. milestones has RLS
-- enabled and is readable by any signed-in parent, but writable by nobody.
--
-- Re-runnable. Ids are derived from (checkpoint_month, domain, sort_order),
-- so re-seeding updates rows in place and never breaks the baby_milestones
-- rows that record what a mother has already noticed.
-- ============================================================

insert into milestones (
  id, domain, checkpoint_month, title, description, source, source_url, sort_order
)
values
  -- 0 MONTHS
  (
    'ee2fe0f7-857b-5650-aed7-6100bde3de23',
    'physical',
    0,
    'Moves both arms and legs',
    'CDC framework; pre-2-month app organization',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/milestones/index.html',
    1
  ),
  (
    '895a5704-ca99-51e2-88f5-29dda7af366b',
    'physical',
    0,
    'Briefly turns head',
    'CDC framework; pre-2-month app organization',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/milestones/index.html',
    2
  ),
  (
    '101e3cf4-6556-5093-a5b8-dd376357cc1c',
    'cognitive',
    0,
    'Looks toward nearby faces',
    'CDC framework; pre-2-month app organization',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/milestones/index.html',
    1
  ),
  (
    'b69157d2-bd6e-5029-8e0e-12f544a596fe',
    'cognitive',
    0,
    'Briefly focuses on nearby objects',
    'CDC framework; pre-2-month app organization',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/milestones/index.html',
    2
  ),
  (
    '227a82e7-5453-556a-9ee2-8a6c4e92543d',
    'language',
    0,
    'Reacts to sounds',
    'CDC framework; pre-2-month app organization',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/milestones/index.html',
    1
  ),
  (
    '8acebb05-6fb5-5ad8-ae45-bf0c691164c7',
    'language',
    0,
    'Communicates mainly by crying',
    'CDC framework; pre-2-month app organization',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/milestones/index.html',
    2
  ),
  -- 1 MONTHS
  (
    'c60b6772-6c05-5297-93fa-b3e4d78d16b9',
    'physical',
    1,
    'Moves both arms and legs',
    'CDC framework; pre-2-month app organization',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/milestones/index.html',
    1
  ),
  (
    '917d0afc-2e20-5776-8c9e-e383b02b8e0e',
    'physical',
    1,
    'Briefly lifts or turns head',
    'CDC framework; pre-2-month app organization',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/milestones/index.html',
    2
  ),
  (
    '0c8f9135-38f1-51a0-acae-b934e18aa57e',
    'cognitive',
    1,
    'Looks at faces',
    'CDC framework; pre-2-month app organization',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/milestones/index.html',
    1
  ),
  (
    'a9421548-360b-5f51-95c4-ca2de9bce545',
    'cognitive',
    1,
    'Briefly watches nearby objects',
    'CDC framework; pre-2-month app organization',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/milestones/index.html',
    2
  ),
  (
    '286dfbe7-839f-50f0-84a6-7fe4a3830e79',
    'language',
    1,
    'Reacts to sounds',
    'CDC framework; pre-2-month app organization',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/milestones/index.html',
    1
  ),
  (
    '5bc5ecf8-a495-5cca-9945-ef90dae34423',
    'language',
    1,
    'Makes early vocal sounds',
    'CDC framework; pre-2-month app organization',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/milestones/index.html',
    2
  ),
  -- 2 MONTHS
  (
    '5f7c66eb-f17d-54cb-bf63-941983b83d99',
    'physical',
    2,
    'Holds head up during tummy time',
    'CDC 2-month checklist',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/milestones/2-months.html',
    1
  ),
  (
    'a569cd3a-dad1-5002-aaa1-03d886039a40',
    'physical',
    2,
    'Moves both arms and legs',
    'CDC 2-month checklist',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/milestones/2-months.html',
    2
  ),
  (
    'e7f2e06a-9e7d-5c37-8876-5f20bb3efbed',
    'physical',
    2,
    'Opens hands briefly',
    'CDC 2-month checklist',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/milestones/2-months.html',
    3
  ),
  (
    'a3b5b5aa-d9f5-5a87-bc34-dea99e9d8a25',
    'cognitive',
    2,
    'Watches people move',
    'CDC 2-month checklist',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/milestones/2-months.html',
    1
  ),
  (
    '0a90a3e9-9f4b-5e0c-a79d-89755814aff9',
    'cognitive',
    2,
    'Looks at a toy for several seconds',
    'CDC 2-month checklist',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/milestones/2-months.html',
    2
  ),
  (
    '27a52512-71fc-5d12-b695-4ac17e0beab0',
    'language',
    2,
    'Makes sounds other than crying',
    'CDC 2-month checklist',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/milestones/2-months.html',
    1
  ),
  (
    '80002420-08e8-57d6-a35e-1c58b7f69ba7',
    'language',
    2,
    'Reacts to loud sounds',
    'CDC 2-month checklist',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/milestones/2-months.html',
    2
  ),
  -- 3 MONTHS
  (
    '9b63e0b6-2182-5e93-9a6d-4f5e2adf9e89',
    'physical',
    3,
    'Holds head up during tummy time',
    'Mapped to CDC 2-month checklist (younger checklist)',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/digital-online-checklist/2-months.html',
    1
  ),
  (
    '32383fb2-f632-5590-8e66-c9f6d930119c',
    'physical',
    3,
    'Moves arms and legs actively',
    'Mapped to CDC 2-month checklist (younger checklist)',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/digital-online-checklist/2-months.html',
    2
  ),
  (
    'eababf0d-6dfb-5876-b01c-22a6abd4a2dd',
    'cognitive',
    3,
    'Watches people move',
    'Mapped to CDC 2-month checklist (younger checklist)',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/digital-online-checklist/2-months.html',
    1
  ),
  (
    '8aa13857-ff0e-5d62-8238-0e5e24c79264',
    'cognitive',
    3,
    'Looks at a toy for several seconds',
    'Mapped to CDC 2-month checklist (younger checklist)',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/digital-online-checklist/2-months.html',
    2
  ),
  (
    '860c436c-e8cf-5576-9a9a-0c8ed744ef23',
    'language',
    3,
    'Makes sounds other than crying',
    'Mapped to CDC 2-month checklist (younger checklist)',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/digital-online-checklist/2-months.html',
    1
  ),
  (
    '298e1259-5f8b-56ea-8999-c1569e05d7a6',
    'language',
    3,
    'Reacts to loud sounds',
    'Mapped to CDC 2-month checklist (younger checklist)',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/digital-online-checklist/2-months.html',
    2
  ),
  -- 4 MONTHS
  (
    '754142a2-b085-511c-87b9-33391715357f',
    'physical',
    4,
    'Holds head steady',
    'CDC 4-month checklist',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/milestones/4-months.html',
    1
  ),
  (
    '11e2b883-b9a3-5679-aef6-6ecfa4c7135a',
    'physical',
    4,
    'Brings hands to mouth',
    'CDC 4-month checklist',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/milestones/4-months.html',
    2
  ),
  (
    'ceb43087-37cd-58a2-a4d0-23679a2b900d',
    'physical',
    4,
    'Pushes up onto elbows/forearms on tummy',
    'CDC 4-month checklist',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/milestones/4-months.html',
    3
  ),
  (
    '30fa3837-ecef-5cdf-9786-a86e9143b2bb',
    'cognitive',
    4,
    'Looks at hands with interest',
    'CDC 4-month checklist',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/milestones/4-months.html',
    1
  ),
  (
    '1ae9598a-4a02-5cc6-b72d-4c310af26626',
    'cognitive',
    4,
    'Opens mouth when seeing breast or bottle if hungry',
    'CDC 4-month checklist',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/milestones/4-months.html',
    2
  ),
  (
    'eac8b7b9-f187-5021-97cd-7e65fe77d582',
    'language',
    4,
    'Makes cooing sounds',
    'CDC 4-month checklist',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/milestones/4-months.html',
    1
  ),
  (
    '3b23c141-14cc-54b2-a5cc-f1e2fc5b5c8a',
    'language',
    4,
    'Makes sounds back when spoken to',
    'CDC 4-month checklist',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/milestones/4-months.html',
    2
  ),
  (
    'f339ee64-1c42-5597-b009-73e793ff84b5',
    'language',
    4,
    'Turns toward your voice',
    'CDC 4-month checklist',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/milestones/4-months.html',
    3
  ),
  -- 5 MONTHS
  (
    'c73445fe-6f12-5f6e-ae2c-c00e1a06d83e',
    'physical',
    5,
    'Holds head steady',
    'Mapped to CDC 4-month checklist (younger checklist)',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/milestones/4-months.html',
    1
  ),
  (
    'c3881c4c-a9fd-55cb-bf92-7446d3334e9b',
    'physical',
    5,
    'Brings hands to mouth',
    'Mapped to CDC 4-month checklist (younger checklist)',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/milestones/4-months.html',
    2
  ),
  (
    'a0c6ce9f-b288-5456-8ab2-4ea3b703ec99',
    'physical',
    5,
    'Pushes up during tummy time',
    'Mapped to CDC 4-month checklist (younger checklist)',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/milestones/4-months.html',
    3
  ),
  (
    '3da79092-34db-5ed8-9c21-66308777dc5e',
    'cognitive',
    5,
    'Looks at hands and nearby objects with interest',
    'Mapped to CDC 4-month checklist (younger checklist)',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/milestones/4-months.html',
    1
  ),
  (
    '0b9bda77-d40c-50c7-a1d7-aaed4d0892e1',
    'language',
    5,
    'Coos',
    'Mapped to CDC 4-month checklist (younger checklist)',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/milestones/4-months.html',
    1
  ),
  (
    'a6758045-96ab-545d-a0ba-1f5718e0b50e',
    'language',
    5,
    'Makes sounds back when spoken to',
    'Mapped to CDC 4-month checklist (younger checklist)',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/milestones/4-months.html',
    2
  ),
  (
    '821b43e1-9f50-520f-ac99-b42dffcfad2e',
    'language',
    5,
    'Turns toward voices',
    'Mapped to CDC 4-month checklist (younger checklist)',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/milestones/4-months.html',
    3
  ),
  -- 6 MONTHS
  (
    '636e6909-12a6-540a-99be-f2c004af993e',
    'physical',
    6,
    'Rolls from tummy to back',
    'CDC 6-month checklist',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/milestones/index.html',
    1
  ),
  (
    'c2c725d7-a7b1-55e7-97dc-24ec4611335f',
    'physical',
    6,
    'Pushes up with straight arms',
    'CDC 6-month checklist',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/milestones/index.html',
    2
  ),
  (
    '2e66af9b-0dcb-57ae-be30-6589c6155740',
    'physical',
    6,
    'Leans on hands while sitting',
    'CDC 6-month checklist',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/milestones/index.html',
    3
  ),
  (
    'c27d761c-21bd-5916-8c43-107b7282e017',
    'cognitive',
    6,
    'Reaches for a wanted toy',
    'CDC 6-month checklist',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/milestones/index.html',
    1
  ),
  (
    'b007e420-9017-5007-a9b3-0485a0090a81',
    'cognitive',
    6,
    'Explores objects with mouth',
    'CDC 6-month checklist',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/milestones/index.html',
    2
  ),
  (
    '7fb04d74-fcfd-55ac-a336-1c13a8da5705',
    'cognitive',
    6,
    'Closes lips to show no more food',
    'CDC 6-month checklist',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/milestones/index.html',
    3
  ),
  (
    '20184ff9-5930-5b1c-ae83-6f64a43403cc',
    'language',
    6,
    'Takes turns making sounds',
    'CDC 6-month checklist',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/milestones/index.html',
    1
  ),
  (
    'a5b6a329-1ba2-52d6-8fa2-fc9c16d17d37',
    'language',
    6,
    'Squeals',
    'CDC 6-month checklist',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/milestones/index.html',
    2
  ),
  (
    '5f52d862-d049-5161-9994-9dbd17a8bafe',
    'language',
    6,
    'Blows raspberries',
    'CDC 6-month checklist',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/milestones/index.html',
    3
  ),
  -- 7 MONTHS
  (
    '7dbf372b-b8bc-582e-ba75-093b31e43ee6',
    'physical',
    7,
    'Rolls from tummy to back',
    'Mapped to CDC 6-month checklist (younger checklist)',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/digital-online-checklist/index.html',
    1
  ),
  (
    '0b995bb9-49fb-5629-9537-55419e09b498',
    'physical',
    7,
    'Pushes up with straight arms',
    'Mapped to CDC 6-month checklist (younger checklist)',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/digital-online-checklist/index.html',
    2
  ),
  (
    'ec10e2cf-02b8-5508-bbe7-d48f578acb63',
    'physical',
    7,
    'Leans on hands while sitting',
    'Mapped to CDC 6-month checklist (younger checklist)',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/digital-online-checklist/index.html',
    3
  ),
  (
    '95bb9d46-5301-5dcb-8b41-ede80c2740ad',
    'cognitive',
    7,
    'Reaches for toys and explores objects with mouth',
    'Mapped to CDC 6-month checklist (younger checklist)',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/digital-online-checklist/index.html',
    1
  ),
  (
    'c140460a-14b2-5928-8f00-7836070c8e3e',
    'language',
    7,
    'Takes turns making sounds',
    'Mapped to CDC 6-month checklist (younger checklist)',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/digital-online-checklist/index.html',
    1
  ),
  (
    '0e7a0fc9-6ae7-55da-9ad0-bb1c5cb6e1a4',
    'language',
    7,
    'Squeals and makes playful sounds',
    'Mapped to CDC 6-month checklist (younger checklist)',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/digital-online-checklist/index.html',
    2
  ),
  -- 8 MONTHS
  (
    '4170baf5-1889-5263-8812-4f1dc853fc09',
    'physical',
    8,
    'Rolls from tummy to back',
    'Mapped to CDC 6-month checklist (younger checklist)',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/digital-online-checklist/index.html',
    1
  ),
  (
    '14bd511d-4460-5b3d-9f83-e252ab0bdc67',
    'physical',
    8,
    'Pushes up with straight arms',
    'Mapped to CDC 6-month checklist (younger checklist)',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/digital-online-checklist/index.html',
    2
  ),
  (
    'db6c1b6f-a055-579a-9f7a-c5548fd56150',
    'physical',
    8,
    'Leans on hands while sitting',
    'Mapped to CDC 6-month checklist (younger checklist)',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/digital-online-checklist/index.html',
    3
  ),
  (
    '4c203739-7698-5905-b6ef-2f86d5107ddb',
    'cognitive',
    8,
    'Reaches for toys and explores objects with mouth',
    'Mapped to CDC 6-month checklist (younger checklist)',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/digital-online-checklist/index.html',
    1
  ),
  (
    'f3e44417-440e-57c9-b9cd-c1c5816325d8',
    'language',
    8,
    'Takes turns making sounds',
    'Mapped to CDC 6-month checklist (younger checklist)',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/digital-online-checklist/index.html',
    1
  ),
  (
    'a83231eb-4697-5761-b323-eb8a3c6c1785',
    'language',
    8,
    'Squeals and makes playful sounds',
    'Mapped to CDC 6-month checklist (younger checklist)',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/digital-online-checklist/index.html',
    2
  ),
  -- 9 MONTHS
  (
    '4487d1eb-6d40-56c8-b346-d4fc1e2d5b8f',
    'physical',
    9,
    'Gets into sitting position',
    'CDC 9-month checklist',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/milestones/index.html',
    1
  ),
  (
    'fcb44b22-caa3-5699-8a59-ce337fcca877',
    'physical',
    9,
    'Sits without support',
    'CDC 9-month checklist',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/milestones/index.html',
    2
  ),
  (
    'b79dbc58-eddf-535d-a3bb-d33bf5a02889',
    'physical',
    9,
    'Moves objects from one hand to the other',
    'CDC 9-month checklist',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/milestones/index.html',
    3
  ),
  (
    'c73d6abd-02ca-5eb0-a77f-a05d7c99ce3c',
    'cognitive',
    9,
    'Looks for dropped objects',
    'CDC 9-month checklist',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/milestones/index.html',
    1
  ),
  (
    'c81655bb-f12a-56a6-8629-aa887f5da2c4',
    'cognitive',
    9,
    'Bangs two objects together',
    'CDC 9-month checklist',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/milestones/index.html',
    2
  ),
  (
    '45c6cd73-5962-5ecc-a8d0-e7ab73f2f31a',
    'language',
    9,
    'Makes repeated sounds such as ''mamama''',
    'CDC 9-month checklist',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/milestones/index.html',
    1
  ),
  (
    'd199a79c-d403-5ead-8d07-6c27f4db6c1d',
    'language',
    9,
    'Lifts arms to be picked up',
    'CDC 9-month checklist',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/milestones/index.html',
    2
  ),
  -- 10 MONTHS
  (
    'afaba4f0-e91c-56c8-8625-060e9400d142',
    'physical',
    10,
    'Gets into sitting position',
    'Mapped to CDC 9-month checklist (younger checklist)',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/digital-online-checklist/index.html',
    1
  ),
  (
    '4f7cb3d7-d6b2-51e2-a74e-52042ded14dd',
    'physical',
    10,
    'Sits without support',
    'Mapped to CDC 9-month checklist (younger checklist)',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/digital-online-checklist/index.html',
    2
  ),
  (
    '6f370469-84d1-5e8a-968d-0abb505ccf6a',
    'physical',
    10,
    'Transfers objects between hands',
    'Mapped to CDC 9-month checklist (younger checklist)',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/digital-online-checklist/index.html',
    3
  ),
  (
    'b0b217fb-23fc-5fd0-a971-e3af12ed044b',
    'cognitive',
    10,
    'Looks for dropped objects',
    'Mapped to CDC 9-month checklist (younger checklist)',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/digital-online-checklist/index.html',
    1
  ),
  (
    'db9c6108-b6de-5dc9-8fb0-2e45f2e60b44',
    'cognitive',
    10,
    'Bangs objects together',
    'Mapped to CDC 9-month checklist (younger checklist)',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/digital-online-checklist/index.html',
    2
  ),
  (
    'd65e74b2-7e8d-521c-bd5e-01831734afb4',
    'language',
    10,
    'Makes repeated syllable sounds',
    'Mapped to CDC 9-month checklist (younger checklist)',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/digital-online-checklist/index.html',
    1
  ),
  (
    '74cebab1-9c5a-5421-b05d-f6975462b4c5',
    'language',
    10,
    'Uses gestures such as lifting arms',
    'Mapped to CDC 9-month checklist (younger checklist)',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/digital-online-checklist/index.html',
    2
  ),
  -- 11 MONTHS
  (
    'ab454837-b780-545c-83e6-d8c4417dc7d2',
    'physical',
    11,
    'Gets into sitting position',
    'Mapped to CDC 9-month checklist (younger checklist)',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/digital-online-checklist/index.html',
    1
  ),
  (
    'fac3ed33-03f3-59b8-a92b-663d66916d5a',
    'physical',
    11,
    'Sits without support',
    'Mapped to CDC 9-month checklist (younger checklist)',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/digital-online-checklist/index.html',
    2
  ),
  (
    'c024e41d-1cd8-5981-83ad-0add4c06cd04',
    'physical',
    11,
    'Transfers objects between hands',
    'Mapped to CDC 9-month checklist (younger checklist)',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/digital-online-checklist/index.html',
    3
  ),
  (
    'c3814ad5-ef5d-5b21-b4ef-57b7e8cedd9a',
    'cognitive',
    11,
    'Looks for dropped objects',
    'Mapped to CDC 9-month checklist (younger checklist)',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/digital-online-checklist/index.html',
    1
  ),
  (
    'ebadc8ed-032e-51f4-8eec-4f23abad20df',
    'cognitive',
    11,
    'Bangs objects together',
    'Mapped to CDC 9-month checklist (younger checklist)',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/digital-online-checklist/index.html',
    2
  ),
  (
    'e579615a-5972-5667-a186-27c66bb37086',
    'language',
    11,
    'Makes repeated syllable sounds',
    'Mapped to CDC 9-month checklist (younger checklist)',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/digital-online-checklist/index.html',
    1
  ),
  (
    'fed64972-a307-52e2-99b2-c0849385e6b3',
    'language',
    11,
    'Uses gestures such as lifting arms',
    'Mapped to CDC 9-month checklist (younger checklist)',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/digital-online-checklist/index.html',
    2
  ),
  -- 12 MONTHS
  (
    '3027b0df-c8b1-579d-9e8d-7e5f7dabb847',
    'physical',
    12,
    'Pulls up to stand',
    'CDC 12-month checklist',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/milestones/index.html',
    1
  ),
  (
    '21a209be-5c21-5a03-a541-5ce2d71b0f8d',
    'physical',
    12,
    'Walks holding furniture',
    'CDC 12-month checklist',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/milestones/index.html',
    2
  ),
  (
    '0dfb6f9f-629e-57ed-a0c6-897f0d85adf6',
    'physical',
    12,
    'Picks up small items with thumb and finger',
    'CDC 12-month checklist',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/milestones/index.html',
    3
  ),
  (
    '1e045d54-2e9a-51b0-b079-75805699be5d',
    'cognitive',
    12,
    'Puts objects into containers',
    'CDC 12-month checklist',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/milestones/index.html',
    1
  ),
  (
    'f42b6b3d-4f7b-5f02-a612-e53ff59ff2ac',
    'cognitive',
    12,
    'Looks for hidden objects',
    'CDC 12-month checklist',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/milestones/index.html',
    2
  ),
  (
    '9d942261-5aa8-50f4-8edf-abb08670ac4b',
    'language',
    12,
    'Waves bye-bye',
    'CDC 12-month checklist',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/milestones/index.html',
    1
  ),
  (
    '0a8bec1c-d415-576e-b2a3-7c6920876fc6',
    'language',
    12,
    'Calls a parent a special name',
    'CDC 12-month checklist',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/milestones/index.html',
    2
  ),
  (
    'b4b9d279-421c-58a2-8999-2c0e4d233c8b',
    'language',
    12,
    'Understands ''no''',
    'CDC 12-month checklist',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/milestones/index.html',
    3
  ),
  -- 13 MONTHS
  (
    '288308d4-ad56-5a79-b0fb-cd4051a3641e',
    'physical',
    13,
    'Pulls to stand',
    'Mapped to CDC 12-month checklist (younger checklist)',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/digital-online-checklist/index.html',
    1
  ),
  (
    '12f0d439-a067-5c44-a421-11bd89becd4a',
    'physical',
    13,
    'Cruises holding furniture',
    'Mapped to CDC 12-month checklist (younger checklist)',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/digital-online-checklist/index.html',
    2
  ),
  (
    '9164ab22-b4bb-5194-ad9d-2f283964499b',
    'physical',
    13,
    'Uses thumb and finger for small items',
    'Mapped to CDC 12-month checklist (younger checklist)',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/digital-online-checklist/index.html',
    3
  ),
  (
    'cc859b27-f924-5d91-91f2-ae88de09e566',
    'cognitive',
    13,
    'Puts objects into containers',
    'Mapped to CDC 12-month checklist (younger checklist)',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/digital-online-checklist/index.html',
    1
  ),
  (
    '88c1ef00-acf8-5fec-a6cb-b42898e1be8f',
    'cognitive',
    13,
    'Searches for hidden objects',
    'Mapped to CDC 12-month checklist (younger checklist)',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/digital-online-checklist/index.html',
    2
  ),
  (
    '18cec0bb-575a-5878-bf9b-bdf9051ae25d',
    'language',
    13,
    'Waves',
    'Mapped to CDC 12-month checklist (younger checklist)',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/digital-online-checklist/index.html',
    1
  ),
  (
    '7a5faa42-b563-5945-b014-3fdbc9c6389f',
    'language',
    13,
    'Uses a special parent name',
    'Mapped to CDC 12-month checklist (younger checklist)',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/digital-online-checklist/index.html',
    2
  ),
  (
    '179fdd42-b249-5831-9ea6-8470de37d6f6',
    'language',
    13,
    'Understands ''no''',
    'Mapped to CDC 12-month checklist (younger checklist)',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/digital-online-checklist/index.html',
    3
  ),
  -- 14 MONTHS
  (
    '1dbd7511-5fe9-5930-b985-26fb159cab61',
    'physical',
    14,
    'Pulls to stand',
    'Mapped to CDC 12-month checklist (younger checklist)',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/digital-online-checklist/index.html',
    1
  ),
  (
    'b0616a67-8343-5456-ba60-cc105059d02e',
    'physical',
    14,
    'Cruises holding furniture',
    'Mapped to CDC 12-month checklist (younger checklist)',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/digital-online-checklist/index.html',
    2
  ),
  (
    'ee9e7e67-a896-5b3a-bb0f-6439bf7fc88f',
    'physical',
    14,
    'Uses thumb and finger for small items',
    'Mapped to CDC 12-month checklist (younger checklist)',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/digital-online-checklist/index.html',
    3
  ),
  (
    'a2883981-c174-5925-be72-6f886d8f0dda',
    'cognitive',
    14,
    'Puts objects into containers',
    'Mapped to CDC 12-month checklist (younger checklist)',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/digital-online-checklist/index.html',
    1
  ),
  (
    '0c265457-8205-5c78-8a80-021e23a58dd1',
    'cognitive',
    14,
    'Searches for hidden objects',
    'Mapped to CDC 12-month checklist (younger checklist)',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/digital-online-checklist/index.html',
    2
  ),
  (
    '14423275-c837-5aa7-bedb-28e18ae8adc1',
    'language',
    14,
    'Waves',
    'Mapped to CDC 12-month checklist (younger checklist)',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/digital-online-checklist/index.html',
    1
  ),
  (
    'c3626cd4-bb4b-58ee-9563-249fc5b69b32',
    'language',
    14,
    'Uses a special parent name',
    'Mapped to CDC 12-month checklist (younger checklist)',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/digital-online-checklist/index.html',
    2
  ),
  (
    'd132ccc9-7a21-5666-8071-28ab1d224e78',
    'language',
    14,
    'Understands ''no''',
    'Mapped to CDC 12-month checklist (younger checklist)',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/digital-online-checklist/index.html',
    3
  ),
  -- 15 MONTHS
  (
    'cc5ec6b0-310c-5348-8ef3-8645d16df022',
    'physical',
    15,
    'Takes a few steps independently',
    'CDC 15-month checklist',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/milestones/index.html',
    1
  ),
  (
    '0db95dc0-513f-5cc8-beca-49b828f6f320',
    'physical',
    15,
    'Uses fingers to feed self',
    'CDC 15-month checklist',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/milestones/index.html',
    2
  ),
  (
    '6113c37e-bf12-5171-abff-a87bc8e5aa58',
    'cognitive',
    15,
    'Uses familiar objects appropriately',
    'CDC 15-month checklist',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/milestones/index.html',
    1
  ),
  (
    '6b671eb7-e257-5761-ba34-f0080462c6f0',
    'cognitive',
    15,
    'Stacks at least two small objects',
    'CDC 15-month checklist',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/milestones/index.html',
    2
  ),
  (
    'd52804bd-aa72-5ef0-8369-6ce4e5b04a5c',
    'language',
    15,
    'Tries 1–2 words besides parent names',
    'CDC 15-month checklist',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/milestones/index.html',
    1
  ),
  (
    '1663204e-e1ce-5137-bfdb-3a1881eceba8',
    'language',
    15,
    'Looks at a named familiar object',
    'CDC 15-month checklist',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/milestones/index.html',
    2
  ),
  (
    'c6044761-6e82-5fad-a67c-9efed43a0d9b',
    'language',
    15,
    'Points to ask for help',
    'CDC 15-month checklist',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/milestones/index.html',
    3
  ),
  -- 16 MONTHS
  (
    'a7cddce0-8f84-5f8a-9448-e7c10dcbfcc4',
    'physical',
    16,
    'Takes independent steps',
    'Mapped to CDC 15-month checklist (younger checklist)',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/digital-online-checklist/index.html',
    1
  ),
  (
    '6392301d-b68a-5929-abfc-aaf1a00ac2dd',
    'physical',
    16,
    'Uses fingers to feed self',
    'Mapped to CDC 15-month checklist (younger checklist)',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/digital-online-checklist/index.html',
    2
  ),
  (
    '0ebb9afd-fd35-5b74-aaec-c458305d6948',
    'cognitive',
    16,
    'Uses familiar objects appropriately',
    'Mapped to CDC 15-month checklist (younger checklist)',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/digital-online-checklist/index.html',
    1
  ),
  (
    'afe4282b-3915-5aee-bb08-6e6847988f66',
    'cognitive',
    16,
    'Stacks small objects',
    'Mapped to CDC 15-month checklist (younger checklist)',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/digital-online-checklist/index.html',
    2
  ),
  (
    '3ed327d8-51a0-5874-b307-ec7d5ab480ba',
    'language',
    16,
    'Tries words besides parent names',
    'Mapped to CDC 15-month checklist (younger checklist)',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/digital-online-checklist/index.html',
    1
  ),
  (
    '6d9c8a7f-4c5c-58bd-a436-5a747da40207',
    'language',
    16,
    'Looks toward named familiar objects',
    'Mapped to CDC 15-month checklist (younger checklist)',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/digital-online-checklist/index.html',
    2
  ),
  (
    'e15fb53d-3995-51a8-8c33-499d06558cf1',
    'language',
    16,
    'Points for help',
    'Mapped to CDC 15-month checklist (younger checklist)',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/digital-online-checklist/index.html',
    3
  ),
  -- 17 MONTHS
  (
    'c6227968-abab-5c2a-8428-0c388e182766',
    'physical',
    17,
    'Takes independent steps',
    'Mapped to CDC 15-month checklist (younger checklist)',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/digital-online-checklist/index.html',
    1
  ),
  (
    '21e7f217-bece-5905-b143-a36bf070ec78',
    'physical',
    17,
    'Uses fingers to feed self',
    'Mapped to CDC 15-month checklist (younger checklist)',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/digital-online-checklist/index.html',
    2
  ),
  (
    'e51ea924-2e73-5110-b890-4f045ef322ec',
    'cognitive',
    17,
    'Uses familiar objects appropriately',
    'Mapped to CDC 15-month checklist (younger checklist)',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/digital-online-checklist/index.html',
    1
  ),
  (
    '388e6e3f-f25c-5322-88f9-e29791a62641',
    'cognitive',
    17,
    'Stacks small objects',
    'Mapped to CDC 15-month checklist (younger checklist)',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/digital-online-checklist/index.html',
    2
  ),
  (
    'd2d53df7-2373-515b-979d-9ab7ddd74bd5',
    'language',
    17,
    'Tries words besides parent names',
    'Mapped to CDC 15-month checklist (younger checklist)',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/digital-online-checklist/index.html',
    1
  ),
  (
    '1ecb8298-c74f-5281-9e8b-64181ca8afd3',
    'language',
    17,
    'Looks toward named familiar objects',
    'Mapped to CDC 15-month checklist (younger checklist)',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/digital-online-checklist/index.html',
    2
  ),
  (
    '073430e1-847f-5ed6-9eab-c233dbfadc31',
    'language',
    17,
    'Points for help',
    'Mapped to CDC 15-month checklist (younger checklist)',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/digital-online-checklist/index.html',
    3
  ),
  -- 18 MONTHS
  (
    '34fbfbf5-7679-5eb7-bba7-3d38824fde23',
    'physical',
    18,
    'Walks independently',
    'CDC 18-month checklist',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/milestones/index.html',
    1
  ),
  (
    'bf71a05a-663d-57dd-b92f-6262c32e9d88',
    'physical',
    18,
    'Scribbles',
    'CDC 18-month checklist',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/milestones/index.html',
    2
  ),
  (
    '1aea94e0-fc92-5832-860b-c1b6bc2ffdd8',
    'physical',
    18,
    'Drinks from an open cup',
    'CDC 18-month checklist',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/milestones/index.html',
    3
  ),
  (
    '7b7ae000-822e-54a7-82e6-93b999e7cffd',
    'physical',
    18,
    'Tries using a spoon',
    'CDC 18-month checklist',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/milestones/index.html',
    4
  ),
  (
    'd0733145-d79b-57b6-b301-9e739eec061e',
    'cognitive',
    18,
    'Copies simple household tasks',
    'CDC 18-month checklist',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/milestones/index.html',
    1
  ),
  (
    '67a1f2f3-c3d3-50b4-aec3-d2445375f445',
    'cognitive',
    18,
    'Plays with toys in simple ways',
    'CDC 18-month checklist',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/milestones/index.html',
    2
  ),
  (
    '353bb77a-decf-5772-9a6c-19954319775c',
    'language',
    18,
    'Tries 3 or more words besides parent names',
    'CDC 18-month checklist',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/milestones/index.html',
    1
  ),
  (
    'd7c98b3c-5d7c-5147-9977-5648a092d6c7',
    'language',
    18,
    'Follows a one-step direction without gestures',
    'CDC 18-month checklist',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/milestones/index.html',
    2
  ),
  -- 19 MONTHS
  (
    '7d62c166-7f0b-5464-b4b7-1a2081e23543',
    'physical',
    19,
    'Walks independently',
    'Mapped to CDC 18-month checklist (younger checklist)',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/digital-online-checklist/index.html',
    1
  ),
  (
    '3be954a0-e44a-50d4-bf42-52e9ffe9e986',
    'physical',
    19,
    'Scribbles',
    'Mapped to CDC 18-month checklist (younger checklist)',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/digital-online-checklist/index.html',
    2
  ),
  (
    '7f2fb454-29b0-55a2-95b3-a2b2c7271efc',
    'physical',
    19,
    'Drinks from an open cup',
    'Mapped to CDC 18-month checklist (younger checklist)',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/digital-online-checklist/index.html',
    3
  ),
  (
    '92e905ce-1548-51b6-9d9f-f64fba50337a',
    'physical',
    19,
    'Tries using a spoon',
    'Mapped to CDC 18-month checklist (younger checklist)',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/digital-online-checklist/index.html',
    4
  ),
  (
    'd3357a56-f93c-57a0-9b85-42ae78338936',
    'cognitive',
    19,
    'Copies simple household tasks',
    'Mapped to CDC 18-month checklist (younger checklist)',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/digital-online-checklist/index.html',
    1
  ),
  (
    '295ef1e2-bcf5-5faa-9304-8b7ace4a171f',
    'cognitive',
    19,
    'Plays with toys in simple ways',
    'Mapped to CDC 18-month checklist (younger checklist)',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/digital-online-checklist/index.html',
    2
  ),
  (
    '2ba49155-e3c0-5e1f-bb07-bbc965960ff0',
    'language',
    19,
    'Tries 3+ words besides parent names',
    'Mapped to CDC 18-month checklist (younger checklist)',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/digital-online-checklist/index.html',
    1
  ),
  (
    'b6081ffc-a5d1-5a12-b685-2a0d2946b9f1',
    'language',
    19,
    'Follows a one-step direction without gestures',
    'Mapped to CDC 18-month checklist (younger checklist)',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/digital-online-checklist/index.html',
    2
  ),
  -- 20 MONTHS
  (
    '0dc47734-b709-5735-b25b-8e53be4ba4d7',
    'physical',
    20,
    'Walks independently',
    'Mapped to CDC 18-month checklist (younger checklist)',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/digital-online-checklist/index.html',
    1
  ),
  (
    '865dd9db-c398-5501-b188-e74a80efb027',
    'physical',
    20,
    'Scribbles',
    'Mapped to CDC 18-month checklist (younger checklist)',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/digital-online-checklist/index.html',
    2
  ),
  (
    'e329c120-926c-5bc3-ad64-0c5250b2f88a',
    'physical',
    20,
    'Drinks from an open cup',
    'Mapped to CDC 18-month checklist (younger checklist)',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/digital-online-checklist/index.html',
    3
  ),
  (
    '09d74e42-dee4-5e19-a092-11483744acd0',
    'physical',
    20,
    'Tries using a spoon',
    'Mapped to CDC 18-month checklist (younger checklist)',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/digital-online-checklist/index.html',
    4
  ),
  (
    '2a0a5452-fef7-5d40-b633-6af3697c8662',
    'cognitive',
    20,
    'Copies simple household tasks',
    'Mapped to CDC 18-month checklist (younger checklist)',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/digital-online-checklist/index.html',
    1
  ),
  (
    '8f77b310-3563-5dc5-92b7-a3ccbd274ae1',
    'cognitive',
    20,
    'Plays with toys in simple ways',
    'Mapped to CDC 18-month checklist (younger checklist)',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/digital-online-checklist/index.html',
    2
  ),
  (
    '28840eec-3c01-553f-9926-d8ca77a9aeaa',
    'language',
    20,
    'Tries 3+ words besides parent names',
    'Mapped to CDC 18-month checklist (younger checklist)',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/digital-online-checklist/index.html',
    1
  ),
  (
    'f9a25fc0-4ebe-56f2-be3d-2f1a5b0d6b72',
    'language',
    20,
    'Follows a one-step direction without gestures',
    'Mapped to CDC 18-month checklist (younger checklist)',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/digital-online-checklist/index.html',
    2
  ),
  -- 21 MONTHS
  (
    '3ad86f11-8818-5d71-b079-490184e912fd',
    'physical',
    21,
    'Walks independently',
    'Mapped to CDC 18-month checklist (younger checklist)',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/digital-online-checklist/index.html',
    1
  ),
  (
    '78f5e5c6-60ce-5f58-a1f8-aae366a28c21',
    'physical',
    21,
    'Scribbles',
    'Mapped to CDC 18-month checklist (younger checklist)',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/digital-online-checklist/index.html',
    2
  ),
  (
    '92e6d89e-5d05-5eef-9758-5540063dac9a',
    'physical',
    21,
    'Drinks from an open cup',
    'Mapped to CDC 18-month checklist (younger checklist)',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/digital-online-checklist/index.html',
    3
  ),
  (
    '23371e80-dd46-5199-97d0-6fe5f6be9801',
    'physical',
    21,
    'Tries using a spoon',
    'Mapped to CDC 18-month checklist (younger checklist)',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/digital-online-checklist/index.html',
    4
  ),
  (
    '9b7eb321-2ff3-59c9-869f-b859ae6c7033',
    'cognitive',
    21,
    'Copies simple household tasks',
    'Mapped to CDC 18-month checklist (younger checklist)',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/digital-online-checklist/index.html',
    1
  ),
  (
    'dd54dfc8-d22e-5e52-80e7-97651a488573',
    'cognitive',
    21,
    'Plays with toys in simple ways',
    'Mapped to CDC 18-month checklist (younger checklist)',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/digital-online-checklist/index.html',
    2
  ),
  (
    '076f1933-7f80-5c9d-966e-790bcdf8b4e6',
    'language',
    21,
    'Tries 3+ words besides parent names',
    'Mapped to CDC 18-month checklist (younger checklist)',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/digital-online-checklist/index.html',
    1
  ),
  (
    'dc2c4447-545c-5eb0-9b92-b00cd4140c1c',
    'language',
    21,
    'Follows a one-step direction without gestures',
    'Mapped to CDC 18-month checklist (younger checklist)',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/digital-online-checklist/index.html',
    2
  ),
  -- 22 MONTHS
  (
    '3a753033-c17e-5faa-971c-1ced3b81a300',
    'physical',
    22,
    'Walks independently',
    'Mapped to CDC 18-month checklist (younger checklist)',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/digital-online-checklist/index.html',
    1
  ),
  (
    'ea246bfc-29d2-56db-b492-2cf77fadae8e',
    'physical',
    22,
    'Scribbles',
    'Mapped to CDC 18-month checklist (younger checklist)',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/digital-online-checklist/index.html',
    2
  ),
  (
    '0997213d-4773-5ebe-8a96-ebbf2fa05faa',
    'physical',
    22,
    'Drinks from an open cup',
    'Mapped to CDC 18-month checklist (younger checklist)',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/digital-online-checklist/index.html',
    3
  ),
  (
    '18bba422-bb0c-50b4-a80e-4018f207ee45',
    'physical',
    22,
    'Tries using a spoon',
    'Mapped to CDC 18-month checklist (younger checklist)',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/digital-online-checklist/index.html',
    4
  ),
  (
    '83c012e6-cd03-5a58-b4f8-fae7b5d832d2',
    'cognitive',
    22,
    'Copies simple household tasks',
    'Mapped to CDC 18-month checklist (younger checklist)',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/digital-online-checklist/index.html',
    1
  ),
  (
    '69fbd9ac-7919-5af7-94c8-ae547ee6991d',
    'cognitive',
    22,
    'Plays with toys in simple ways',
    'Mapped to CDC 18-month checklist (younger checklist)',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/digital-online-checklist/index.html',
    2
  ),
  (
    '15f26865-2f3d-57fc-8218-055b7925415c',
    'language',
    22,
    'Tries 3+ words besides parent names',
    'Mapped to CDC 18-month checklist (younger checklist)',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/digital-online-checklist/index.html',
    1
  ),
  (
    '8e1d241a-24e1-5b8c-bb5e-9b8571ad3201',
    'language',
    22,
    'Follows a one-step direction without gestures',
    'Mapped to CDC 18-month checklist (younger checklist)',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/digital-online-checklist/index.html',
    2
  ),
  -- 23 MONTHS
  (
    '5331931d-0481-586e-9165-22eadb2a67ea',
    'physical',
    23,
    'Walks independently',
    'Mapped to CDC 18-month checklist (younger checklist)',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/digital-online-checklist/index.html',
    1
  ),
  (
    '86a06858-5d0e-5ad2-baea-b40b16be62f2',
    'physical',
    23,
    'Scribbles',
    'Mapped to CDC 18-month checklist (younger checklist)',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/digital-online-checklist/index.html',
    2
  ),
  (
    '39752c3b-c2e1-5de4-91ef-df67d5134ccb',
    'physical',
    23,
    'Drinks from an open cup',
    'Mapped to CDC 18-month checklist (younger checklist)',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/digital-online-checklist/index.html',
    3
  ),
  (
    '5ab0c041-46cc-5653-af59-20b25d7e589a',
    'physical',
    23,
    'Tries using a spoon',
    'Mapped to CDC 18-month checklist (younger checklist)',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/digital-online-checklist/index.html',
    4
  ),
  (
    '607b80e7-e589-54e2-ba46-2979ae712842',
    'cognitive',
    23,
    'Copies simple household tasks',
    'Mapped to CDC 18-month checklist (younger checklist)',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/digital-online-checklist/index.html',
    1
  ),
  (
    '5d1c87ff-463b-5f11-9d6d-7e602763ca42',
    'cognitive',
    23,
    'Plays with toys in simple ways',
    'Mapped to CDC 18-month checklist (younger checklist)',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/digital-online-checklist/index.html',
    2
  ),
  (
    '4f1c4751-5bc9-58b2-810b-3d416940d7aa',
    'language',
    23,
    'Tries 3+ words besides parent names',
    'Mapped to CDC 18-month checklist (younger checklist)',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/digital-online-checklist/index.html',
    1
  ),
  (
    'dc334e46-d834-5fb2-b04f-c508c5fe939d',
    'language',
    23,
    'Follows a one-step direction without gestures',
    'Mapped to CDC 18-month checklist (younger checklist)',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/digital-online-checklist/index.html',
    2
  ),
  -- 24 MONTHS
  (
    'e5bc95a7-fb24-5795-b517-2006485bd2a4',
    'physical',
    24,
    'Runs',
    'CDC 2-year checklist',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/milestones/2-years.html',
    1
  ),
  (
    '20b16fff-54fa-5426-a28e-9eb05290c9b6',
    'physical',
    24,
    'Kicks a ball',
    'CDC 2-year checklist',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/milestones/2-years.html',
    2
  ),
  (
    '6d9e8f49-2963-541b-9cba-08dcedcadc0b',
    'physical',
    24,
    'Walks up a few stairs',
    'CDC 2-year checklist',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/milestones/2-years.html',
    3
  ),
  (
    '16303082-ba77-5c55-82cf-cbf564b65423',
    'physical',
    24,
    'Eats with a spoon',
    'CDC 2-year checklist',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/milestones/2-years.html',
    4
  ),
  (
    '3e8f9925-6de3-5ded-8f2d-8bedca496cae',
    'cognitive',
    24,
    'Uses switches, knobs or buttons on toys',
    'CDC 2-year checklist',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/milestones/2-years.html',
    1
  ),
  (
    '2457e6c7-9f79-508a-8a61-b28beb1f07fa',
    'cognitive',
    24,
    'Plays with more than one toy at a time',
    'CDC 2-year checklist',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/milestones/2-years.html',
    2
  ),
  (
    'ea737f5f-89e3-5693-b8ac-3ae5ea7458f2',
    'language',
    24,
    'Combines at least two words',
    'CDC 2-year checklist',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/milestones/2-years.html',
    1
  ),
  (
    '092e60de-8389-5f96-9e15-df8a08968d40',
    'language',
    24,
    'Points to named pictures',
    'CDC 2-year checklist',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/milestones/2-years.html',
    2
  ),
  (
    'a788e1e1-f097-59af-929d-e03d8a5797b5',
    'language',
    24,
    'Points to at least two body parts',
    'CDC 2-year checklist',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/milestones/2-years.html',
    3
  ),
  (
    '08592a53-a226-5e2e-b7f6-8f215f953380',
    'language',
    24,
    'Uses more gestures',
    'CDC 2-year checklist',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/milestones/2-years.html',
    4
  )
on conflict (id) do update set
  domain = excluded.domain,
  checkpoint_month = excluded.checkpoint_month,
  title = excluded.title,
  description = excluded.description,
  source = excluded.source,
  source_url = excluded.source_url,
  sort_order = excluded.sort_order,
  -- An id in this snapshot is by definition active. Without this line a row
  -- retired by an earlier run would be updated but stay hidden, because the
  -- retire step below only ever sets retired_at, never clears it.
  retired_at = null;


-- Retire anything this import supersedes. No deletes: see 0005.
update milestones
set retired_at = now()
where retired_at is null
  and domain in ('physical', 'cognitive', 'language')
  and id <> all (array[
  'ee2fe0f7-857b-5650-aed7-6100bde3de23'::uuid,
  '895a5704-ca99-51e2-88f5-29dda7af366b'::uuid,
  '101e3cf4-6556-5093-a5b8-dd376357cc1c'::uuid,
  'b69157d2-bd6e-5029-8e0e-12f544a596fe'::uuid,
  '227a82e7-5453-556a-9ee2-8a6c4e92543d'::uuid,
  '8acebb05-6fb5-5ad8-ae45-bf0c691164c7'::uuid,
  'c60b6772-6c05-5297-93fa-b3e4d78d16b9'::uuid,
  '917d0afc-2e20-5776-8c9e-e383b02b8e0e'::uuid,
  '0c8f9135-38f1-51a0-acae-b934e18aa57e'::uuid,
  'a9421548-360b-5f51-95c4-ca2de9bce545'::uuid,
  '286dfbe7-839f-50f0-84a6-7fe4a3830e79'::uuid,
  '5bc5ecf8-a495-5cca-9945-ef90dae34423'::uuid,
  '5f7c66eb-f17d-54cb-bf63-941983b83d99'::uuid,
  'a569cd3a-dad1-5002-aaa1-03d886039a40'::uuid,
  'e7f2e06a-9e7d-5c37-8876-5f20bb3efbed'::uuid,
  'a3b5b5aa-d9f5-5a87-bc34-dea99e9d8a25'::uuid,
  '0a90a3e9-9f4b-5e0c-a79d-89755814aff9'::uuid,
  '27a52512-71fc-5d12-b695-4ac17e0beab0'::uuid,
  '80002420-08e8-57d6-a35e-1c58b7f69ba7'::uuid,
  '9b63e0b6-2182-5e93-9a6d-4f5e2adf9e89'::uuid,
  '32383fb2-f632-5590-8e66-c9f6d930119c'::uuid,
  'eababf0d-6dfb-5876-b01c-22a6abd4a2dd'::uuid,
  '8aa13857-ff0e-5d62-8238-0e5e24c79264'::uuid,
  '860c436c-e8cf-5576-9a9a-0c8ed744ef23'::uuid,
  '298e1259-5f8b-56ea-8999-c1569e05d7a6'::uuid,
  '754142a2-b085-511c-87b9-33391715357f'::uuid,
  '11e2b883-b9a3-5679-aef6-6ecfa4c7135a'::uuid,
  'ceb43087-37cd-58a2-a4d0-23679a2b900d'::uuid,
  '30fa3837-ecef-5cdf-9786-a86e9143b2bb'::uuid,
  '1ae9598a-4a02-5cc6-b72d-4c310af26626'::uuid,
  'eac8b7b9-f187-5021-97cd-7e65fe77d582'::uuid,
  '3b23c141-14cc-54b2-a5cc-f1e2fc5b5c8a'::uuid,
  'f339ee64-1c42-5597-b009-73e793ff84b5'::uuid,
  'c73445fe-6f12-5f6e-ae2c-c00e1a06d83e'::uuid,
  'c3881c4c-a9fd-55cb-bf92-7446d3334e9b'::uuid,
  'a0c6ce9f-b288-5456-8ab2-4ea3b703ec99'::uuid,
  '3da79092-34db-5ed8-9c21-66308777dc5e'::uuid,
  '0b9bda77-d40c-50c7-a1d7-aaed4d0892e1'::uuid,
  'a6758045-96ab-545d-a0ba-1f5718e0b50e'::uuid,
  '821b43e1-9f50-520f-ac99-b42dffcfad2e'::uuid,
  '636e6909-12a6-540a-99be-f2c004af993e'::uuid,
  'c2c725d7-a7b1-55e7-97dc-24ec4611335f'::uuid,
  '2e66af9b-0dcb-57ae-be30-6589c6155740'::uuid,
  'c27d761c-21bd-5916-8c43-107b7282e017'::uuid,
  'b007e420-9017-5007-a9b3-0485a0090a81'::uuid,
  '7fb04d74-fcfd-55ac-a336-1c13a8da5705'::uuid,
  '20184ff9-5930-5b1c-ae83-6f64a43403cc'::uuid,
  'a5b6a329-1ba2-52d6-8fa2-fc9c16d17d37'::uuid,
  '5f52d862-d049-5161-9994-9dbd17a8bafe'::uuid,
  '7dbf372b-b8bc-582e-ba75-093b31e43ee6'::uuid,
  '0b995bb9-49fb-5629-9537-55419e09b498'::uuid,
  'ec10e2cf-02b8-5508-bbe7-d48f578acb63'::uuid,
  '95bb9d46-5301-5dcb-8b41-ede80c2740ad'::uuid,
  'c140460a-14b2-5928-8f00-7836070c8e3e'::uuid,
  '0e7a0fc9-6ae7-55da-9ad0-bb1c5cb6e1a4'::uuid,
  '4170baf5-1889-5263-8812-4f1dc853fc09'::uuid,
  '14bd511d-4460-5b3d-9f83-e252ab0bdc67'::uuid,
  'db6c1b6f-a055-579a-9f7a-c5548fd56150'::uuid,
  '4c203739-7698-5905-b6ef-2f86d5107ddb'::uuid,
  'f3e44417-440e-57c9-b9cd-c1c5816325d8'::uuid,
  'a83231eb-4697-5761-b323-eb8a3c6c1785'::uuid,
  '4487d1eb-6d40-56c8-b346-d4fc1e2d5b8f'::uuid,
  'fcb44b22-caa3-5699-8a59-ce337fcca877'::uuid,
  'b79dbc58-eddf-535d-a3bb-d33bf5a02889'::uuid,
  'c73d6abd-02ca-5eb0-a77f-a05d7c99ce3c'::uuid,
  'c81655bb-f12a-56a6-8629-aa887f5da2c4'::uuid,
  '45c6cd73-5962-5ecc-a8d0-e7ab73f2f31a'::uuid,
  'd199a79c-d403-5ead-8d07-6c27f4db6c1d'::uuid,
  'afaba4f0-e91c-56c8-8625-060e9400d142'::uuid,
  '4f7cb3d7-d6b2-51e2-a74e-52042ded14dd'::uuid,
  '6f370469-84d1-5e8a-968d-0abb505ccf6a'::uuid,
  'b0b217fb-23fc-5fd0-a971-e3af12ed044b'::uuid,
  'db9c6108-b6de-5dc9-8fb0-2e45f2e60b44'::uuid,
  'd65e74b2-7e8d-521c-bd5e-01831734afb4'::uuid,
  '74cebab1-9c5a-5421-b05d-f6975462b4c5'::uuid,
  'ab454837-b780-545c-83e6-d8c4417dc7d2'::uuid,
  'fac3ed33-03f3-59b8-a92b-663d66916d5a'::uuid,
  'c024e41d-1cd8-5981-83ad-0add4c06cd04'::uuid,
  'c3814ad5-ef5d-5b21-b4ef-57b7e8cedd9a'::uuid,
  'ebadc8ed-032e-51f4-8eec-4f23abad20df'::uuid,
  'e579615a-5972-5667-a186-27c66bb37086'::uuid,
  'fed64972-a307-52e2-99b2-c0849385e6b3'::uuid,
  '3027b0df-c8b1-579d-9e8d-7e5f7dabb847'::uuid,
  '21a209be-5c21-5a03-a541-5ce2d71b0f8d'::uuid,
  '0dfb6f9f-629e-57ed-a0c6-897f0d85adf6'::uuid,
  '1e045d54-2e9a-51b0-b079-75805699be5d'::uuid,
  'f42b6b3d-4f7b-5f02-a612-e53ff59ff2ac'::uuid,
  '9d942261-5aa8-50f4-8edf-abb08670ac4b'::uuid,
  '0a8bec1c-d415-576e-b2a3-7c6920876fc6'::uuid,
  'b4b9d279-421c-58a2-8999-2c0e4d233c8b'::uuid,
  '288308d4-ad56-5a79-b0fb-cd4051a3641e'::uuid,
  '12f0d439-a067-5c44-a421-11bd89becd4a'::uuid,
  '9164ab22-b4bb-5194-ad9d-2f283964499b'::uuid,
  'cc859b27-f924-5d91-91f2-ae88de09e566'::uuid,
  '88c1ef00-acf8-5fec-a6cb-b42898e1be8f'::uuid,
  '18cec0bb-575a-5878-bf9b-bdf9051ae25d'::uuid,
  '7a5faa42-b563-5945-b014-3fdbc9c6389f'::uuid,
  '179fdd42-b249-5831-9ea6-8470de37d6f6'::uuid,
  '1dbd7511-5fe9-5930-b985-26fb159cab61'::uuid,
  'b0616a67-8343-5456-ba60-cc105059d02e'::uuid,
  'ee9e7e67-a896-5b3a-bb0f-6439bf7fc88f'::uuid,
  'a2883981-c174-5925-be72-6f886d8f0dda'::uuid,
  '0c265457-8205-5c78-8a80-021e23a58dd1'::uuid,
  '14423275-c837-5aa7-bedb-28e18ae8adc1'::uuid,
  'c3626cd4-bb4b-58ee-9563-249fc5b69b32'::uuid,
  'd132ccc9-7a21-5666-8071-28ab1d224e78'::uuid,
  'cc5ec6b0-310c-5348-8ef3-8645d16df022'::uuid,
  '0db95dc0-513f-5cc8-beca-49b828f6f320'::uuid,
  '6113c37e-bf12-5171-abff-a87bc8e5aa58'::uuid,
  '6b671eb7-e257-5761-ba34-f0080462c6f0'::uuid,
  'd52804bd-aa72-5ef0-8369-6ce4e5b04a5c'::uuid,
  '1663204e-e1ce-5137-bfdb-3a1881eceba8'::uuid,
  'c6044761-6e82-5fad-a67c-9efed43a0d9b'::uuid,
  'a7cddce0-8f84-5f8a-9448-e7c10dcbfcc4'::uuid,
  '6392301d-b68a-5929-abfc-aaf1a00ac2dd'::uuid,
  '0ebb9afd-fd35-5b74-aaec-c458305d6948'::uuid,
  'afe4282b-3915-5aee-bb08-6e6847988f66'::uuid,
  '3ed327d8-51a0-5874-b307-ec7d5ab480ba'::uuid,
  '6d9c8a7f-4c5c-58bd-a436-5a747da40207'::uuid,
  'e15fb53d-3995-51a8-8c33-499d06558cf1'::uuid,
  'c6227968-abab-5c2a-8428-0c388e182766'::uuid,
  '21e7f217-bece-5905-b143-a36bf070ec78'::uuid,
  'e51ea924-2e73-5110-b890-4f045ef322ec'::uuid,
  '388e6e3f-f25c-5322-88f9-e29791a62641'::uuid,
  'd2d53df7-2373-515b-979d-9ab7ddd74bd5'::uuid,
  '1ecb8298-c74f-5281-9e8b-64181ca8afd3'::uuid,
  '073430e1-847f-5ed6-9eab-c233dbfadc31'::uuid,
  '34fbfbf5-7679-5eb7-bba7-3d38824fde23'::uuid,
  'bf71a05a-663d-57dd-b92f-6262c32e9d88'::uuid,
  '1aea94e0-fc92-5832-860b-c1b6bc2ffdd8'::uuid,
  '7b7ae000-822e-54a7-82e6-93b999e7cffd'::uuid,
  'd0733145-d79b-57b6-b301-9e739eec061e'::uuid,
  '67a1f2f3-c3d3-50b4-aec3-d2445375f445'::uuid,
  '353bb77a-decf-5772-9a6c-19954319775c'::uuid,
  'd7c98b3c-5d7c-5147-9977-5648a092d6c7'::uuid,
  '7d62c166-7f0b-5464-b4b7-1a2081e23543'::uuid,
  '3be954a0-e44a-50d4-bf42-52e9ffe9e986'::uuid,
  '7f2fb454-29b0-55a2-95b3-a2b2c7271efc'::uuid,
  '92e905ce-1548-51b6-9d9f-f64fba50337a'::uuid,
  'd3357a56-f93c-57a0-9b85-42ae78338936'::uuid,
  '295ef1e2-bcf5-5faa-9304-8b7ace4a171f'::uuid,
  '2ba49155-e3c0-5e1f-bb07-bbc965960ff0'::uuid,
  'b6081ffc-a5d1-5a12-b685-2a0d2946b9f1'::uuid,
  '0dc47734-b709-5735-b25b-8e53be4ba4d7'::uuid,
  '865dd9db-c398-5501-b188-e74a80efb027'::uuid,
  'e329c120-926c-5bc3-ad64-0c5250b2f88a'::uuid,
  '09d74e42-dee4-5e19-a092-11483744acd0'::uuid,
  '2a0a5452-fef7-5d40-b633-6af3697c8662'::uuid,
  '8f77b310-3563-5dc5-92b7-a3ccbd274ae1'::uuid,
  '28840eec-3c01-553f-9926-d8ca77a9aeaa'::uuid,
  'f9a25fc0-4ebe-56f2-be3d-2f1a5b0d6b72'::uuid,
  '3ad86f11-8818-5d71-b079-490184e912fd'::uuid,
  '78f5e5c6-60ce-5f58-a1f8-aae366a28c21'::uuid,
  '92e6d89e-5d05-5eef-9758-5540063dac9a'::uuid,
  '23371e80-dd46-5199-97d0-6fe5f6be9801'::uuid,
  '9b7eb321-2ff3-59c9-869f-b859ae6c7033'::uuid,
  'dd54dfc8-d22e-5e52-80e7-97651a488573'::uuid,
  '076f1933-7f80-5c9d-966e-790bcdf8b4e6'::uuid,
  'dc2c4447-545c-5eb0-9b92-b00cd4140c1c'::uuid,
  '3a753033-c17e-5faa-971c-1ced3b81a300'::uuid,
  'ea246bfc-29d2-56db-b492-2cf77fadae8e'::uuid,
  '0997213d-4773-5ebe-8a96-ebbf2fa05faa'::uuid,
  '18bba422-bb0c-50b4-a80e-4018f207ee45'::uuid,
  '83c012e6-cd03-5a58-b4f8-fae7b5d832d2'::uuid,
  '69fbd9ac-7919-5af7-94c8-ae547ee6991d'::uuid,
  '15f26865-2f3d-57fc-8218-055b7925415c'::uuid,
  '8e1d241a-24e1-5b8c-bb5e-9b8571ad3201'::uuid,
  '5331931d-0481-586e-9165-22eadb2a67ea'::uuid,
  '86a06858-5d0e-5ad2-baea-b40b16be62f2'::uuid,
  '39752c3b-c2e1-5de4-91ef-df67d5134ccb'::uuid,
  '5ab0c041-46cc-5653-af59-20b25d7e589a'::uuid,
  '607b80e7-e589-54e2-ba46-2979ae712842'::uuid,
  '5d1c87ff-463b-5f11-9d6d-7e602763ca42'::uuid,
  '4f1c4751-5bc9-58b2-810b-3d416940d7aa'::uuid,
  'dc334e46-d834-5fb2-b04f-c508c5fe939d'::uuid,
  'e5bc95a7-fb24-5795-b517-2006485bd2a4'::uuid,
  '20b16fff-54fa-5426-a28e-9eb05290c9b6'::uuid,
  '6d9e8f49-2963-541b-9cba-08dcedcadc0b'::uuid,
  '16303082-ba77-5c55-82cf-cbf564b65423'::uuid,
  '3e8f9925-6de3-5ded-8f2d-8bedca496cae'::uuid,
  '2457e6c7-9f79-508a-8a61-b28beb1f07fa'::uuid,
  'ea737f5f-89e3-5693-b8ac-3ae5ea7458f2'::uuid,
  '092e60de-8389-5f96-9e15-df8a08968d40'::uuid,
  'a788e1e1-f097-59af-929d-e03d8a5797b5'::uuid,
  '08592a53-a226-5e2e-b7f6-8f215f953380'::uuid
  ]);

-- month guidance rows --
-- ============================================================
-- WHAT IS TYPICAL, PER MONTH
-- GENERATED FILE — do not edit by hand.
-- Source: data/milestones/month_typical.csv
-- Regenerate: python3 scripts/build_milestone_seed.py
--
-- Shown on Home (US-004), Track (US-03) and as Learn's first card
-- (US-1, "the same as the Home page displayed"). One source, three
-- screens.
-- ============================================================

insert into month_guidance (month, typical) values
  (0, 'Newborns are adjusting to the world, moving reflexively and responding to voices, touch, and nearby faces.'),
  (1, 'Babies become more alert, watch faces more closely, react to sounds, and gain early head control.'),
  (2, 'Babies are more socially responsive, make early sounds, watch people, and build head and upper-body control.'),
  (3, 'Babies become more interactive, smile and vocalize more, track people and objects, and move with better control.'),
  (4, 'Babies laugh and coo, seek attention, explore with their hands and mouth, and hold their head steadier.'),
  (5, 'Babies grow more curious and social, reach and grasp more purposefully, and experiment with sounds and movement.'),
  (6, 'Babies recognize familiar people, take turns making sounds, explore objects, and become stronger during sitting and rolling.'),
  (7, 'Babies become more active and curious, use varied sounds, explore objects closely, and build sitting and reaching skills.'),
  (8, 'Babies communicate with more sounds and gestures, explore how objects work, and gain stronger sitting and hand skills.'),
  (9, 'Babies sit independently, transfer and bang objects, search for dropped items, and use repeated sounds and gestures.'),
  (10, 'Babies are increasingly mobile and curious, communicate with sounds and gestures, and explore objects through play.'),
  (11, 'Babies become more purposeful in movement and play, understand familiar routines, and communicate with sounds and gestures.'),
  (12, 'One-year-olds pull to stand or cruise, use simple gestures and words, understand familiar directions, and explore cause and effect.'),
  (13, 'Toddlers become more independent in movement, imitate familiar actions, understand simple words, and communicate wants with gestures.'),
  (14, 'Toddlers explore actively, practice standing and walking, copy everyday actions, and use gestures and early words to communicate.'),
  (15, 'Toddlers take early independent steps, use objects purposefully, stack simple items, and try a few words and gestures.'),
  (16, 'Toddlers gain confidence walking, imitate everyday actions, solve simple play problems, and use more words and gestures.'),
  (17, 'Toddlers move more independently, copy what others do, explore toys with purpose, and communicate needs with words and pointing.'),
  (18, 'Toddlers combine growing physical independence with simple pretend play, imitation, and an expanding early vocabulary.'),
  (19, 'Toddlers become steadier on their feet, imitate daily routines, experiment with toys, and use more words to communicate.'),
  (20, 'Toddlers are increasingly independent, enjoy simple pretend play, follow familiar directions, and keep building words and gestures.'),
  (21, 'Toddlers explore through movement and imitation, use everyday objects with purpose, and communicate with a growing vocabulary.'),
  (22, 'Toddlers show more independence in play and routines, understand simple directions, and combine movement, gestures, and words.'),
  (23, 'Toddlers become more confident with self-help and play, imitate adults, follow simple directions, and communicate more clearly.'),
  (24, 'Two-year-olds run and kick, use simple pretend and problem-solving play, follow familiar directions, and combine words into short phrases.')
on conflict (month) do update set
  typical = excluded.typical,
  updated_at = now();

commit;
