-- ============================================================
-- MILESTONE SEED DATA
-- GENERATED FILE — do not edit by hand.
-- Source: data/milestones/milestones.csv
-- Regenerate: python3 scripts/build_milestone_seed.py
--
-- 61 milestones across 5 CDC checkpoints
-- (2, 6, 12, 18, 24 months) and four domains.
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
  -- 2 MONTHS
  (
    '5f7c66eb-f17d-54cb-bf63-941983b83d99',
    'physical',
    2,
    'Holds head up when on tummy',
    null,
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/milestones/2-months.html',
    1
  ),
  (
    'a569cd3a-dad1-5002-aaa1-03d886039a40',
    'physical',
    2,
    'Moves both arms and both legs',
    null,
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/milestones/2-months.html',
    2
  ),
  (
    'e7f2e06a-9e7d-5c37-8876-5f20bb3efbed',
    'physical',
    2,
    'Opens hands briefly',
    null,
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/milestones/2-months.html',
    3
  ),
  (
    'a3b5b5aa-d9f5-5a87-bc34-dea99e9d8a25',
    'cognitive',
    2,
    'Watches you as you move',
    null,
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/milestones/2-months.html',
    1
  ),
  (
    '0a90a3e9-9f4b-5e0c-a79d-89755814aff9',
    'cognitive',
    2,
    'Looks at a toy for several seconds',
    null,
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/milestones/2-months.html',
    2
  ),
  (
    '27a52512-71fc-5d12-b695-4ac17e0beab0',
    'language',
    2,
    'Makes sounds other than crying',
    null,
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/milestones/2-months.html',
    1
  ),
  (
    '80002420-08e8-57d6-a35e-1c58b7f69ba7',
    'language',
    2,
    'Reacts to loud sounds',
    null,
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/milestones/2-months.html',
    2
  ),
  (
    '3c13eddf-9fcf-5d59-8f4a-800fd4da0585',
    'social_emotional',
    2,
    'Calms down when spoken to or picked up',
    null,
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/milestones/2-months.html',
    1
  ),
  (
    '968edb95-b5ca-5103-9e58-4a47807ade21',
    'social_emotional',
    2,
    'Looks at your face',
    null,
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/milestones/2-months.html',
    2
  ),
  (
    '7ccec220-3427-5327-8f36-d09a1d6e470e',
    'social_emotional',
    2,
    'Seems happy to see you when you walk up to her',
    null,
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/milestones/2-months.html',
    3
  ),
  (
    'e2ca61dc-d301-5bc5-a232-deaca0c570cd',
    'social_emotional',
    2,
    'Smiles when you talk to or smile at her',
    null,
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/milestones/2-months.html',
    4
  ),
  -- 6 MONTHS
  (
    '636e6909-12a6-540a-99be-f2c004af993e',
    'physical',
    6,
    'Rolls from tummy to back',
    null,
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/milestones/6-months.html',
    1
  ),
  (
    'c2c725d7-a7b1-55e7-97dc-24ec4611335f',
    'physical',
    6,
    'Pushes up with straight arms when on tummy',
    null,
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/milestones/6-months.html',
    2
  ),
  (
    '2e66af9b-0dcb-57ae-be30-6589c6155740',
    'physical',
    6,
    'Leans on hands to support herself when sitting',
    null,
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/milestones/6-months.html',
    3
  ),
  (
    'c27d761c-21bd-5916-8c43-107b7282e017',
    'cognitive',
    6,
    'Puts things in her mouth to explore them',
    null,
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/milestones/6-months.html',
    1
  ),
  (
    'b007e420-9017-5007-a9b3-0485a0090a81',
    'cognitive',
    6,
    'Reaches to grab a toy she wants',
    null,
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/milestones/6-months.html',
    2
  ),
  (
    '7fb04d74-fcfd-55ac-a336-1c13a8da5705',
    'cognitive',
    6,
    'Closes lips to show she doesn''t want more food',
    null,
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/milestones/6-months.html',
    3
  ),
  (
    '20184ff9-5930-5b1c-ae83-6f64a43403cc',
    'language',
    6,
    'Takes turns making sounds with you',
    null,
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/milestones/6-months.html',
    1
  ),
  (
    'a5b6a329-1ba2-52d6-8fa2-fc9c16d17d37',
    'language',
    6,
    'Blows raspberries',
    'Blows “raspberries” (sticks tongue out and blows)',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/milestones/6-months.html',
    2
  ),
  (
    '5f52d862-d049-5161-9994-9dbd17a8bafe',
    'language',
    6,
    'Makes squealing noises',
    null,
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/milestones/6-months.html',
    3
  ),
  (
    '717ec05e-ffd2-55ed-9368-7977dd8c73bb',
    'social_emotional',
    6,
    'Knows familiar people',
    null,
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/milestones/6-months.html',
    1
  ),
  (
    '7bf66b57-dcf4-56c6-a355-e5e3a6472441',
    'social_emotional',
    6,
    'Likes to look at self in a mirror',
    null,
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/milestones/6-months.html',
    2
  ),
  (
    '1d11e121-bd4e-521a-958e-d5c6e4d342d6',
    'social_emotional',
    6,
    'Laughs',
    null,
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/milestones/6-months.html',
    3
  ),
  -- 12 MONTHS
  (
    '3027b0df-c8b1-579d-9e8d-7e5f7dabb847',
    'physical',
    12,
    'Pulls up to stand',
    null,
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/milestones/1-year.html',
    1
  ),
  (
    '21a209be-5c21-5a03-a541-5ce2d71b0f8d',
    'physical',
    12,
    'Walks holding on to furniture',
    'Walks, holding on to furniture',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/milestones/1-year.html',
    2
  ),
  (
    '0dfb6f9f-629e-57ed-a0c6-897f0d85adf6',
    'physical',
    12,
    'Drinks from a cup without a lid, as you hold it',
    null,
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/milestones/1-year.html',
    3
  ),
  (
    '6bf4e5fe-e46e-57d9-a893-d0a62a50b9ab',
    'physical',
    12,
    'Picks things up between thumb and pointer finger',
    'Picks things up between thumb and pointer finger, like small bits of food',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/milestones/1-year.html',
    4
  ),
  (
    '1e045d54-2e9a-51b0-b079-75805699be5d',
    'cognitive',
    12,
    'Puts something in a container',
    'Puts something in a container, like a block in a cup',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/milestones/1-year.html',
    1
  ),
  (
    'f42b6b3d-4f7b-5f02-a612-e53ff59ff2ac',
    'cognitive',
    12,
    'Looks for things he sees you hide',
    'Looks for things he sees you hide, like a toy under a blanket',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/milestones/1-year.html',
    2
  ),
  (
    '9d942261-5aa8-50f4-8edf-abb08670ac4b',
    'language',
    12,
    'Waves bye-bye',
    'Waves “bye-bye”',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/milestones/1-year.html',
    1
  ),
  (
    '0a8bec1c-d415-576e-b2a3-7c6920876fc6',
    'language',
    12,
    'Calls a parent mama, dada, or another special name',
    'Calls a parent “mama” or “dada” or another special name',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/milestones/1-year.html',
    2
  ),
  (
    'b4b9d279-421c-58a2-8999-2c0e4d233c8b',
    'language',
    12,
    'Understands no',
    'Understands “no” (pauses briefly or stops when you say it)',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/milestones/1-year.html',
    3
  ),
  (
    '574ae3a5-b298-50fd-915a-5cf0201e2a89',
    'social_emotional',
    12,
    'Plays games with you, like pat-a-cake',
    null,
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/milestones/1-year.html',
    1
  ),
  -- 18 MONTHS
  (
    '34fbfbf5-7679-5eb7-bba7-3d38824fde23',
    'physical',
    18,
    'Walks without holding on to anyone or anything',
    null,
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/milestones/18-months.html',
    1
  ),
  (
    'bf71a05a-663d-57dd-b92f-6262c32e9d88',
    'physical',
    18,
    'Scribbles',
    null,
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/milestones/18-months.html',
    2
  ),
  (
    '1aea94e0-fc92-5832-860b-c1b6bc2ffdd8',
    'physical',
    18,
    'Drinks from a cup without a lid and may spill sometimes',
    null,
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/milestones/18-months.html',
    3
  ),
  (
    '7b7ae000-822e-54a7-82e6-93b999e7cffd',
    'physical',
    18,
    'Feeds himself with his fingers',
    null,
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/milestones/18-months.html',
    4
  ),
  (
    'f1ea6404-343a-5313-a489-063f52b000f3',
    'physical',
    18,
    'Tries to use a spoon',
    null,
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/milestones/18-months.html',
    5
  ),
  (
    '744d6cab-a1a2-5bb5-8a92-bdd20da1921d',
    'physical',
    18,
    'Climbs on and off a couch or chair without help',
    null,
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/milestones/18-months.html',
    6
  ),
  (
    'd0733145-d79b-57b6-b301-9e739eec061e',
    'cognitive',
    18,
    'Copies you doing chores, like sweeping with a broom',
    null,
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/milestones/18-months.html',
    1
  ),
  (
    '67a1f2f3-c3d3-50b4-aec3-d2445375f445',
    'cognitive',
    18,
    'Plays with toys in a simple way, like pushing a toy car',
    null,
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/milestones/18-months.html',
    2
  ),
  (
    '353bb77a-decf-5772-9a6c-19954319775c',
    'language',
    18,
    'Tries to say three or more words besides mama or dada',
    null,
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/milestones/18-months.html',
    1
  ),
  (
    'd7c98b3c-5d7c-5147-9977-5648a092d6c7',
    'language',
    18,
    'Follows one-step directions without any gestures',
    'Follows one-step directions without any gestures, like giving you the toy when you say, “Give it to me.”',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/milestones/18-months.html',
    2
  ),
  (
    'ad941dab-1c98-56b3-9e9f-5c5c5fc18d71',
    'social_emotional',
    18,
    'Moves away from you, but looks to make sure you are close by',
    null,
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/milestones/18-months.html',
    1
  ),
  (
    '0b266ad1-76f4-564c-a4f8-d6045fcb2f73',
    'social_emotional',
    18,
    'Points to show you something interesting',
    null,
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/milestones/18-months.html',
    2
  ),
  (
    '2d8bd602-8d8b-5aa7-b646-cb9014141ad2',
    'social_emotional',
    18,
    'Puts hands out for you to wash them',
    null,
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/milestones/18-months.html',
    3
  ),
  (
    'd3725b4d-4937-53b3-9776-e2403f0272e3',
    'social_emotional',
    18,
    'Looks at a few pages in a book with you',
    null,
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/milestones/18-months.html',
    4
  ),
  (
    '60cae342-32b9-5886-b486-5311bd63db9c',
    'social_emotional',
    18,
    'Helps you dress him by pushing arm through sleeve or lifting up foot',
    null,
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/milestones/18-months.html',
    5
  ),
  -- 24 MONTHS
  (
    'e5bc95a7-fb24-5795-b517-2006485bd2a4',
    'physical',
    24,
    'Kicks a ball',
    null,
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/milestones/2-years.html',
    1
  ),
  (
    '20b16fff-54fa-5426-a28e-9eb05290c9b6',
    'physical',
    24,
    'Runs',
    null,
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/milestones/2-years.html',
    2
  ),
  (
    '6d9e8f49-2963-541b-9cba-08dcedcadc0b',
    'physical',
    24,
    'Walks up a few stairs with or without help',
    'Walks (not climbs) up a few stairs with or without help',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/milestones/2-years.html',
    3
  ),
  (
    '16303082-ba77-5c55-82cf-cbf564b65423',
    'physical',
    24,
    'Eats with a spoon',
    null,
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/milestones/2-years.html',
    4
  ),
  (
    '3e8f9925-6de3-5ded-8f2d-8bedca496cae',
    'cognitive',
    24,
    'Holds something in one hand while using the other hand',
    'Holds something in one hand while using the other hand; for example, holding a container and taking the lid off',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/milestones/2-years.html',
    1
  ),
  (
    '2457e6c7-9f79-508a-8a61-b28beb1f07fa',
    'cognitive',
    24,
    'Tries to use switches, knobs, or buttons on a toy',
    null,
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/milestones/2-years.html',
    2
  ),
  (
    'a626cf81-b630-5579-b7bb-107860d67e9a',
    'cognitive',
    24,
    'Plays with more than one toy at the same time',
    'Plays with more than one toy at the same time, like putting toy food on a toy plate',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/milestones/2-years.html',
    3
  ),
  (
    'ea737f5f-89e3-5693-b8ac-3ae5ea7458f2',
    'language',
    24,
    'Points to things in a book when you ask',
    'Points to things in a book when you ask, like “Where is the bear?”',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/milestones/2-years.html',
    1
  ),
  (
    '092e60de-8389-5f96-9e15-df8a08968d40',
    'language',
    24,
    'Says at least two words together',
    'Says at least two words together, like “More milk.”',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/milestones/2-years.html',
    2
  ),
  (
    'a788e1e1-f097-59af-929d-e03d8a5797b5',
    'language',
    24,
    'Points to at least two body parts when you ask',
    'Points to at least two body parts when you ask him to show you',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/milestones/2-years.html',
    3
  ),
  (
    '08592a53-a226-5e2e-b7f6-8f215f953380',
    'language',
    24,
    'Uses more gestures than just waving and pointing',
    'Uses more gestures than just waving and pointing, like blowing a kiss or nodding yes',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/milestones/2-years.html',
    4
  ),
  (
    'e582edef-9a59-50a3-a9a8-4cdb55dcece3',
    'social_emotional',
    24,
    'Notices when others are hurt or upset',
    'Notices when others are hurt or upset, like pausing or looking sad when someone is crying',
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/milestones/2-years.html',
    1
  ),
  (
    '989c27a4-af37-57ca-a7ee-c1de0201060a',
    'social_emotional',
    24,
    'Looks at your face to see how to react in a new situation',
    null,
    'CDC Learn the Signs. Act Early.',
    'https://www.cdc.gov/act-early/milestones/2-years.html',
    2
  )
on conflict (id) do update set
  domain = excluded.domain,
  checkpoint_month = excluded.checkpoint_month,
  title = excluded.title,
  description = excluded.description,
  source = excluded.source,
  source_url = excluded.source_url,
  sort_order = excluded.sort_order;
