-- Seed: Product Catalog with Developmental Rationales (Issue #41)
-- Age buckets: 0–3, 4–8, 9–14, 15–24 months
-- Every product has a written rationale tied to developmental milestones.
-- Retailer search URLs have zero affiliate codes (#109).

begin;

-- ============================================================
-- 1. RETAILERS
-- ============================================================

insert into retailers (id, slug, name)
values
  ('e1000001-0000-4000-a000-000000000001', 'amazon', 'Amazon'),
  ('e1000002-0000-4000-a000-000000000002', 'target', 'Target'),
  ('e1000003-0000-4000-a000-000000000003', 'walmart', 'Walmart')
on conflict (slug) do update
set name = excluded.name;

-- ============================================================
-- 2. PRODUCT CATEGORIES
-- ============================================================

insert into product_categories (id, slug, name)
values
  ('d1000001-0000-4000-a000-000000000001', 'play_learning', 'Play & Learning'),
  ('d1000002-0000-4000-a000-000000000002', 'movement_motor', 'Movement & Motor'),
  ('d1000003-0000-4000-a000-000000000003', 'feeding', 'Feeding & Nutrition'),
  ('d1000004-0000-4000-a000-000000000004', 'sleep_comfort', 'Sleep & Comfort'),
  ('d1000005-0000-4000-a000-000000000005', 'daily_care', 'Everyday Care & Safety')
on conflict (slug) do update
set name = excluded.name;

-- ============================================================
-- 3. PRODUCTS (16 Curated Products across 4 Age Buckets)
-- ============================================================

insert into products (id, category_id, name, rationale, indicative_price_cents, image_path)
values
  -- Bucket 0–3 months
  (
    'p0000001-0000-4000-a000-000000000001',
    'd1000001-0000-4000-a000-000000000001',
    'High-Contrast Black & White Art Cards',
    'Stimulates early visual development and optic nerve growth before full color perception emerges.',
    1200,
    null
  ),
  (
    'p0000002-0000-4000-a000-000000000002',
    'd1000002-0000-4000-a000-000000000002',
    'Inflatable Tummy Time Water Mat',
    'Encourages head lifting and upper-body strength during daily tummy time with interactive visual feedback.',
    1500,
    null
  ),
  (
    'p0000003-0000-4000-a000-000000000003',
    'd1000004-0000-4000-a000-000000000004',
    'Sound Machine with Constant White Noise',
    'Replicates continuous womb sound rhythms to ease sleep transitions and mask abrupt household sounds.',
    2200,
    null
  ),
  (
    'p0000004-0000-4000-a000-000000000004',
    'd1000005-0000-4000-a000-000000000005',
    'Organic Cotton Muslin Burp Cloths (4-Pack)',
    'Gentle, breathable cotton absorbs frequent newborn spit-ups without irritating delicate newborn skin.',
    1400,
    null
  ),

  -- Bucket 4–8 months
  (
    'p0000005-0000-4000-a000-000000000005',
    'd1000003-0000-4000-a000-000000000003',
    '100% Food-Grade Silicone Baby Teether',
    'Relieves gum pressure during early tooth eruption while encouraging two-handed grasping and oral motor exploration.',
    900,
    null
  ),
  (
    'p0000006-0000-4000-a000-000000000006',
    'd1000003-0000-4000-a000-000000000003',
    'Ergonomic Silicone Starter Spoon Set',
    'Soft-tipped, shallow silicone bowl protects sensitive gums as baby explores puree and puree-to-finger food transitions.',
    1000,
    null
  ),
  (
    'p0000007-0000-4000-a000-000000000007',
    'd1000002-0000-4000-a000-000000000002',
    'Textured Sensory Rattle Ball',
    'Develops hand-eye coordination, palmar grasp, and auditory tracking through light rattles and varied surface textures.',
    1100,
    null
  ),
  (
    'p0000008-0000-4000-a000-000000000008',
    'd1000001-0000-4000-a000-000000000001',
    'Soft Fabric Crinkle Peek-a-Boo Book',
    'Engages tactile and auditory curiosity while introducing early interactive routines through crinkle pages.',
    1300,
    null
  ),

  -- Bucket 9–14 months
  (
    'p0000009-0000-4000-a000-000000000009',
    'd1000003-0000-4000-a000-000000000003',
    'Weighted Straw Silicone Open/Trainer Cup',
    'Promotes mature swallowing mechanics and oral muscle coordination during the transition from bottles to cups.',
    1200,
    null
  ),
  (
    'p0000010-0000-4000-a000-000000000010',
    'd1000002-0000-4000-a000-000000000002',
    'Wooden Push Walker & Activity Center',
    'Provides a stable base to build confidence, balance, and leg strength for babies pulling up and taking first steps.',
    3800,
    null
  ),
  (
    'p0000011-0000-4000-a000-000000000011',
    'd1000001-0000-4000-a000-000000000001',
    'Shape Sorting Cube & Stacking Rings',
    'Teaches spatial awareness, shape recognition, and fine motor problem-solving through trial-and-error play.',
    1600,
    null
  ),
  (
    'p0000012-0000-4000-a000-000000000012',
    'd1000003-0000-4000-a000-000000000003',
    'Silicone Suction Divided Plate with Grip',
    'High walls and non-slip suction base support self-feeding autonomy and pincer grasp refinement with table foods.',
    1400,
    null
  ),

  -- Bucket 15–24 months
  (
    'p1111111-1111-4111-a111-111111111111',
    'd1000002-0000-4000-a000-000000000002',
    'Toddler Balance Bike',
    'Supports balance, coordination and confidence through active outdoor play.',
    4500,
    null
  ),
  (
    'p2222222-2222-4222-a222-222222222222',
    'd1000001-0000-4000-a000-000000000001',
    'First Words Chunky Board Books Set',
    'Supports the fast vocabulary growth typical at this age.',
    1600,
    null
  ),
  (
    'p0000015-0000-4000-a000-000000000015',
    'd1000001-0000-4000-a000-000000000001',
    'Large Wooden Building Blocks Set (30 pcs)',
    'Fosters creative construction, early engineering concepts, and hand-eye dexterity through stacking and balance.',
    2400,
    null
  ),
  (
    'p0000016-0000-4000-a000-000000000016',
    'd1000005-0000-4000-a000-000000000005',
    'Non-Slip Toddler Step Stool',
    'Promotes self-care autonomy for handwashing, teeth brushing, and independent participation in daily family routines.',
    1800,
    null
  )
on conflict (id) do update
set
  category_id = excluded.category_id,
  name = excluded.name,
  rationale = excluded.rationale,
  indicative_price_cents = excluded.indicative_price_cents,
  image_path = excluded.image_path;

-- ============================================================
-- 4. PRODUCT RETAILERS (Plain Search URLs, Zero Tracking)
-- ============================================================

insert into product_retailers (product_id, retailer_id, url)
values
  -- p1: High-Contrast Black & White Art Cards
  ('p0000001-0000-4000-a000-000000000001', 'e1000001-0000-4000-a000-000000000001', 'https://www.amazon.com/s?k=high+contrast+baby+art+cards'),
  ('p0000001-0000-4000-a000-000000000001', 'e1000002-0000-4000-a000-000000000002', 'https://www.target.com/s?searchTerm=high+contrast+baby+cards'),
  ('p0000001-0000-4000-a000-000000000001', 'e1000003-0000-4000-a000-000000000003', 'https://www.walmart.com/search?q=high+contrast+baby+cards'),

  -- p2: Inflatable Tummy Time Water Mat
  ('p0000002-0000-4000-a000-000000000002', 'e1000001-0000-4000-a000-000000000001', 'https://www.amazon.com/s?k=tummy+time+water+mat'),
  ('p0000002-0000-4000-a000-000000000002', 'e1000002-0000-4000-a000-000000000002', 'https://www.target.com/s?searchTerm=tummy+time+water+mat'),
  ('p0000002-0000-4000-a000-000000000002', 'e1000003-0000-4000-a000-000000000003', 'https://www.walmart.com/search?q=tummy+time+water+mat'),

  -- p3: Sound Machine with Constant White Noise
  ('p0000003-0000-4000-a000-000000000003', 'e1000001-0000-4000-a000-000000000001', 'https://www.amazon.com/s?k=baby+sound+machine+white+noise'),
  ('p0000003-0000-4000-a000-000000000003', 'e1000002-0000-4000-a000-000000000002', 'https://www.target.com/s?searchTerm=baby+white+noise+machine'),
  ('p0000003-0000-4000-a000-000000000003', 'e1000003-0000-4000-a000-000000000003', 'https://www.walmart.com/search?q=baby+sound+machine'),

  -- p4: Organic Cotton Muslin Burp Cloths (4-Pack)
  ('p0000004-0000-4000-a000-000000000004', 'e1000001-0000-4000-a000-000000000001', 'https://www.amazon.com/s?k=organic+cotton+muslin+burp+cloths'),
  ('p0000004-0000-4000-a000-000000000004', 'e1000002-0000-4000-a000-000000000002', 'https://www.target.com/s?searchTerm=muslin+burp+cloths'),
  ('p0000004-0000-4000-a000-000000000004', 'e1000003-0000-4000-a000-000000000003', 'https://www.walmart.com/search?q=muslin+burp+cloths'),

  -- p5: 100% Food-Grade Silicone Baby Teether
  ('p0000005-0000-4000-a000-000000000005', 'e1000001-0000-4000-a000-000000000001', 'https://www.amazon.com/s?k=silicone+baby+teether'),
  ('p0000005-0000-4000-a000-000000000002', 'e1000002-0000-4000-a000-000000000002', 'https://www.target.com/s?searchTerm=silicone+baby+teether'),
  ('p0000005-0000-4000-a000-000000000005', 'e1000003-0000-4000-a000-000000000003', 'https://www.walmart.com/search?q=silicone+baby+teether'),

  -- p6: Ergonomic Silicone Starter Spoon Set
  ('p0000006-0000-4000-a000-000000000006', 'e1000001-0000-4000-a000-000000000001', 'https://www.amazon.com/s?k=silicone+baby+starter+spoons'),
  ('p0000006-0000-4000-a000-000000000006', 'e1000002-0000-4000-a000-000000000002', 'https://www.target.com/s?searchTerm=baby+silicone+spoons'),
  ('p0000006-0000-4000-a000-000000000006', 'e1000003-0000-4000-a000-000000000003', 'https://www.walmart.com/search?q=silicone+baby+spoons'),

  -- p7: Textured Sensory Rattle Ball
  ('p0000007-0000-4000-a000-000000000007', 'e1000001-0000-4000-a000-000000000001', 'https://www.amazon.com/s?k=sensory+rattle+ball+baby'),
  ('p0000007-0000-4000-a000-000000000007', 'e1000002-0000-4000-a000-000000000002', 'https://www.target.com/s?searchTerm=baby+sensory+ball'),
  ('p0000007-0000-4000-a000-000000000007', 'e1000003-0000-4000-a000-000000000003', 'https://www.walmart.com/search?q=baby+sensory+rattle+ball'),

  -- p8: Soft Fabric Crinkle Peek-a-Boo Book
  ('p0000008-0000-4000-a000-000000000008', 'e1000001-0000-4000-a000-000000000001', 'https://www.amazon.com/s?k=soft+crinkle+baby+book'),
  ('p0000008-0000-4000-a000-000000000008', 'e1000002-0000-4000-a000-000000000002', 'https://www.target.com/s?searchTerm=soft+crinkle+book'),
  ('p0000008-0000-4000-a000-000000000008', 'e1000003-0000-4000-a000-000000000003', 'https://www.walmart.com/search?q=soft+crinkle+baby+book'),

  -- p9: Weighted Straw Silicone Open/Trainer Cup
  ('p0000009-0000-4000-a000-000000000009', 'e1000001-0000-4000-a000-000000000001', 'https://www.amazon.com/s?k=weighted+straw+baby+trainer+cup'),
  ('p0000009-0000-4000-a000-000000000009', 'e1000002-0000-4000-a000-000000000002', 'https://www.target.com/s?searchTerm=baby+straw+training+cup'),
  ('p0000009-0000-4000-a000-000000000009', 'e1000003-0000-4000-a000-000000000003', 'https://www.walmart.com/search?q=baby+trainer+straw+cup'),

  -- p10: Wooden Push Walker & Activity Center
  ('p0000010-0000-4000-a000-000000000010', 'e1000001-0000-4000-a000-000000000001', 'https://www.amazon.com/s?k=wooden+push+walker+baby'),
  ('p0000010-0000-4000-a000-000000000010', 'e1000002-0000-4000-a000-000000000002', 'https://www.target.com/s?searchTerm=wooden+baby+push+walker'),
  ('p0000010-0000-4000-a000-000000000010', 'e1000003-0000-4000-a000-000000000003', 'https://www.walmart.com/search?q=wooden+push+walker'),

  -- p11: Shape Sorting Cube & Stacking Rings
  ('p0000011-0000-4000-a000-000000000011', 'e1000001-0000-4000-a000-000000000001', 'https://www.amazon.com/s?k=shape+sorter+cube+baby'),
  ('p0000011-0000-4000-a000-000000000011', 'e1000002-0000-4000-a000-000000000002', 'https://www.target.com/s?searchTerm=shape+sorter+toy'),
  ('p0000011-0000-4000-a000-000000000011', 'e1000003-0000-4000-a000-000000000003', 'https://www.walmart.com/search?q=shape+sorter+toy'),

  -- p12: Silicone Suction Divided Plate with Grip
  ('p0000012-0000-4000-a000-000000000012', 'e1000001-0000-4000-a000-000000000001', 'https://www.amazon.com/s?k=silicone+suction+baby+plate'),
  ('p0000012-0000-4000-a000-000000000012', 'e1000002-0000-4000-a000-000000000002', 'https://www.target.com/s?searchTerm=silicone+suction+plate'),
  ('p0000012-0000-4000-a000-000000000012', 'e1000003-0000-4000-a000-000000000003', 'https://www.walmart.com/search?q=silicone+suction+plate'),

  -- p13: Toddler Balance Bike
  ('p1111111-1111-4111-a111-111111111111', 'e1000001-0000-4000-a000-000000000001', 'https://www.amazon.com/s?k=balance+bike+toddler'),
  ('p1111111-1111-4111-a111-111111111111', 'e1000002-0000-4000-a000-000000000002', 'https://www.target.com/s?searchTerm=toddler+balance+bike'),
  ('p1111111-1111-4111-a111-111111111111', 'e1000003-0000-4000-a000-000000000003', 'https://www.walmart.com/search?q=toddler+balance+bike'),

  -- p14: First Words Chunky Board Books Set
  ('p2222222-2222-4222-a222-222222222222', 'e1000001-0000-4000-a000-000000000001', 'https://www.amazon.com/s?k=board+books+toddler+first+words'),
  ('p2222222-2222-4222-a222-222222222222', 'e1000002-0000-4000-a000-000000000002', 'https://www.target.com/s?searchTerm=toddler+board+books'),
  ('p2222222-2222-4222-a222-222222222222', 'e1000003-0000-4000-a000-000000000003', 'https://www.walmart.com/search?q=toddler+board+books'),

  -- p15: Large Wooden Building Blocks Set (30 pcs)
  ('p0000015-0000-4000-a000-000000000015', 'e1000001-0000-4000-a000-000000000001', 'https://www.amazon.com/s?k=wooden+building+blocks+toddler'),
  ('p0000015-0000-4000-a000-000000000015', 'e1000002-0000-4000-a000-000000000002', 'https://www.target.com/s?searchTerm=wooden+blocks+toddler'),
  ('p0000015-0000-4000-a000-000000000015', 'e1000003-0000-4000-a000-000000000003', 'https://www.walmart.com/search?q=wooden+building+blocks'),

  -- p16: Non-Slip Toddler Step Stool
  ('p0000016-0000-4000-a000-000000000016', 'e1000001-0000-4000-a000-000000000001', 'https://www.amazon.com/s?k=toddler+step+stool+bathroom'),
  ('p0000016-0000-4000-a000-000000000016', 'e1000002-0000-4000-a000-000000000002', 'https://www.target.com/s?searchTerm=toddler+step+stool'),
  ('p0000016-0000-4000-a000-000000000016', 'e1000003-0000-4000-a000-000000000003', 'https://www.walmart.com/search?q=toddler+step+stool')
on conflict (product_id, retailer_id) do update
set url = excluded.url;

-- ============================================================
-- 5. RECOMMENDATION RULES (4 Age Buckets: 0-3, 4-8, 9-14, 15-24)
-- ============================================================

insert into product_recommendation_rules (product_id, min_age_month, max_age_month, priority)
values
  -- Bucket 0–3 months
  ('p0000001-0000-4000-a000-000000000001', 0, 3, 10),
  ('p0000002-0000-4000-a000-000000000002', 0, 3, 9),
  ('p0000003-0000-4000-a000-000000000003', 0, 3, 8),
  ('p0000004-0000-4000-a000-000000000004', 0, 3, 7),

  -- Bucket 4–8 months
  ('p0000005-0000-4000-a000-000000000005', 4, 8, 10),
  ('p0000006-0000-4000-a000-000000000006', 4, 8, 9),
  ('p0000007-0000-4000-a000-000000000007', 4, 8, 8),
  ('p0000008-0000-4000-a000-000000000008', 4, 8, 7),

  -- Bucket 9–14 months
  ('p0000009-0000-4000-a000-000000000009', 9, 14, 10),
  ('p0000010-0000-4000-a000-000000000010', 9, 14, 9),
  ('p0000011-0000-4000-a000-000000000011', 9, 14, 8),
  ('p0000012-0000-4000-a000-000000000012', 9, 14, 7),

  -- Bucket 15–24 months
  ('p1111111-1111-4111-a111-111111111111', 15, 24, 10),
  ('p2222222-2222-4222-a222-222222222222', 15, 24, 9),
  ('p0000015-0000-4000-a000-000000000015', 15, 24, 8),
  ('p0000016-0000-4000-a000-000000000016', 15, 24, 7);

commit;
