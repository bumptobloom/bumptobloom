-- ============================================================
-- ACTIVITIES SEED DATA
-- Age-appropriate activities for 0–24 months
-- Four domains: physical, cognitive, language, social_emotional
-- ============================================================

insert into activities (id, title, description, min_age_month, max_age_month, domain)
values
  -- 0–3 MONTHS (Newborn & Early Infant)
  (
    'a0000001-0000-4000-8000-000000000001',
    'Tummy Time on Chest',
    'Lie back slightly and place baby tummy-down on your chest. Make eye contact and talk gently to encourage head lifting.',
    0,
    3,
    'physical'
  ),
  (
    'a0000001-0000-4000-8000-000000000002',
    'High-Contrast Card Tracking',
    'Hold black-and-white patterned cards 8–12 inches from baby’s face and move them slowly from side to side to encourage visual tracking.',
    0,
    3,
    'cognitive'
  ),
  (
    'a0000001-0000-4000-8000-000000000003',
    'Conversational Turn-Taking',
    'Respond to baby’s coos and sounds with matching facial expressions and warm vocal replies, pausing to let them "answer".',
    0,
    3,
    'language'
  ),
  (
    'a0000001-0000-4000-8000-000000000004',
    'Skin-to-Skin Calming & Voice Soothing',
    'Hold baby against your bare chest with a blanket over their back. Speak or hum softly to promote emotional security and temperature regulation.',
    0,
    3,
    'social_emotional'
  ),
  (
    'a0000001-0000-4000-8000-000000000005',
    'Gentle Bicycle Legs',
    'Gently move baby’s legs in a bicycling motion while singing a gentle rhyme to relieve gas and build leg muscle awareness.',
    1,
    4,
    'physical'
  ),
  (
    'a0000001-0000-4000-8000-000000000006',
    'Overhead Mobile Observation',
    'Hang a safe, high-contrast mobile above the crib or play mat to encourage visual focus and early reaching attempts.',
    0,
    4,
    'cognitive'
  ),

  -- 4–6 MONTHS (Reaching, Rolling & Babbling)
  (
    'a0000002-0000-4000-8000-000000000001',
    'Floor Mat Reach & Roll',
    'Place enticing soft toys just outside baby’s reach during floor play to motivate rolling and weight shifting.',
    4,
    6,
    'physical'
  ),
  (
    'a0000002-0000-4000-8000-000000000002',
    'Textured Fabric Exploration',
    'Offer safe fabrics of varying textures (silk, cotton, fleece, velvet) for baby to touch, grasp, and explore.',
    4,
    7,
    'cognitive'
  ),
  (
    'a0000002-0000-4000-8000-000000000003',
    'Babble Echo Game',
    'Imitate baby’s consonant-vowel combinations (like "ba-ba", "ma-ma", "da-da") and introduce new playful consonant sounds.',
    4,
    6,
    'language'
  ),
  (
    'a0000002-0000-4000-8000-000000000004',
    'Unbreakable Mirror Play',
    'Hold an unbreakable safety mirror in front of baby during tummy time to encourage smiling, babbling, and self-recognition.',
    4,
    7,
    'social_emotional'
  ),
  (
    'a0000002-0000-4000-8000-000000000005',
    'Two-Handed Grasp and Transfer',
    'Offer safe, lightweight rattles or rings and encourage baby to pass objects from one hand to the other.',
    5,
    8,
    'physical'
  ),
  (
    'a0000002-0000-4000-8000-000000000006',
    'Water Splash Basin',
    'Supervised splashing with hands and feet in a shallow tray of warm water to stimulate sensory awareness and cause-and-effect learning.',
    5,
    8,
    'cognitive'
  ),

  -- 7–9 MONTHS (Sitting, Crawling & Object Permanence)
  (
    'a0000003-0000-4000-8000-000000000001',
    'Peek-a-Boo with a Soft Blanket',
    'Hide your face or a favourite toy under a light cloth, then reveal it with joyful exclamation to teach object permanence.',
    6,
    9,
    'cognitive'
  ),
  (
    'a0000003-0000-4000-8000-000000000002',
    'Supported Sit-and-Reach',
    'Surround seated baby with cushions and place toys at different heights and angles to strengthen core and balance.',
    6,
    9,
    'physical'
  ),
  (
    'a0000003-0000-4000-8000-000000000003',
    'Kitchen Rhythm Drumming',
    'Provide wooden spoons and inverted plastic bowls or pots for baby to bang and discover rhythm, pitch, and cause-effect.',
    7,
    10,
    'cognitive'
  ),
  (
    'a0000003-0000-4000-8000-000000000004',
    'Name Recognition & Turn Around',
    'Call baby’s name from different parts of the room and celebrate enthusiastically when they turn their head toward you.',
    7,
    10,
    'language'
  ),
  (
    'a0000003-0000-4000-8000-000000000005',
    'Wave Hello and Goodbye',
    'Model waving gestures during departures and arrivals, pairing the gesture with warm, consistent verbal cues.',
    8,
    11,
    'social_emotional'
  ),
  (
    'a0000003-0000-4000-8000-000000000006',
    'Cushion Mountain Crawl',
    'Create a low obstacle course using floor pillows and cushions to challenge gross motor coordination and balance.',
    8,
    12,
    'physical'
  ),

  -- 10–12 MONTHS (Cruising, Pointing & Stacking)
  (
    'a0000004-0000-4000-8000-000000000001',
    'Container Drop and Spill',
    'Give baby a wide-mouth container and wooden blocks or plastic balls to practice grasping, releasing, and dumping.',
    9,
    12,
    'cognitive'
  ),
  (
    'a0000004-0000-4000-8000-000000000002',
    'Furniture Cruising Parade',
    'Arrange sturdy furniture in a close circle so baby can practice cruising sideways and transitioning hands from one support to another.',
    10,
    13,
    'physical'
  ),
  (
    'a0000004-0000-4000-8000-000000000003',
    'Point and Name Board Books',
    'Look at sturdy board books together, pointing to familiar animals and everyday objects while distinctly naming them.',
    10,
    14,
    'language'
  ),
  (
    'a0000004-0000-4000-8000-000000000004',
    'Roll the Ball Back and Forth',
    'Sit opposite baby on the floor with legs spread and gently roll a soft ball back and forth, praising cooperative reciprocal play.',
    10,
    14,
    'social_emotional'
  ),
  (
    'a0000004-0000-4000-8000-000000000005',
    'Two-Block Tower Stacking',
    'Model stacking one large block on top of another, encouraging baby to place the second block and knock it down joyfully.',
    10,
    14,
    'physical'
  ),
  (
    'a0000004-0000-4000-8000-000000000006',
    'Action Songs (Pat-a-Cake & Clapping)',
    'Sing rhythm songs while guiding baby’s hands to clap, tap knees, and mimic playful gesture sequences.',
    9,
    13,
    'social_emotional'
  ),

  -- 13–18 MONTHS (Walking, Words & Early Sorting)
  (
    'a0000005-0000-4000-8000-000000000001',
    'Chunky Block Tower Building',
    'Build 3 to 4 block towers together and encourage your toddler to balance blocks without toppling.',
    12,
    18,
    'cognitive'
  ),
  (
    'a0000005-0000-4000-8000-000000000002',
    'Push and Pull Cart Walking',
    'Provide a weighted push wagon or pull toy to support independent walking, direction changes, and confidence.',
    12,
    18,
    'physical'
  ),
  (
    'a0000005-0000-4000-8000-000000000003',
    'Animal Sound Zoo',
    'Show animal pictures or toy figurines and make corresponding sounds ("moo", "woof", "quack"), pausing for imitation.',
    13,
    18,
    'language'
  ),
  (
    'a0000005-0000-4000-8000-000000000004',
    'Teddy Bear Care & Cuddle',
    'Demonstrate gentle rocking, feeding, or putting a stuffed animal to sleep to nurture empathy and imaginative play.',
    13,
    18,
    'social_emotional'
  ),
  (
    'a0000005-0000-4000-8000-000000000005',
    'Big vs. Small Sorting Bins',
    'Provide large balls and small balls and guide toddler to place large in a big basket and small in a small bowl.',
    15,
    20,
    'cognitive'
  ),
  (
    'a0000005-0000-4000-8000-000000000006',
    'Low Step Stepping & Balance',
    'Practice stepping up and down a low wooden step or curb holding one hand to build leg power and spatial awareness.',
    15,
    20,
    'physical'
  ),
  (
    'a0000005-0000-4000-8000-000000000007',
    'Daily Routine Object Naming',
    'Narrate everyday moments: "Here is your blue spoon", "We put on the red shoe", helping connect spoken words to concrete items.',
    14,
    20,
    'language'
  ),

  -- 19–24 MONTHS (Pretend Play, Running & Two-Word Phrases)
  (
    'a0000006-0000-4000-8000-000000000001',
    'Two-Word Phrase Prompting',
    'Expand your child’s single words into short sentences (if they say "car", reply "fast car!" or "blue car goes beep").',
    18,
    24,
    'language'
  ),
  (
    'a0000006-0000-4000-8000-000000000002',
    'Pretend Kitchen & Tea Party',
    'Engage in pretend play with cups and plates, pretending to pour tea, taste food, and share with each other.',
    18,
    24,
    'social_emotional'
  ),
  (
    'a0000006-0000-4000-8000-000000000003',
    'Chunky Crayon Free Scribble',
    'Tape large butcher paper to the floor or table and let your toddler grasp chunky crayons to draw lines and circles.',
    18,
    24,
    'cognitive'
  ),
  (
    'a0000006-0000-4000-8000-000000000004',
    'Living Room Agility Obstacle Course',
    'Set up painter’s tape balance lines, stepping stones (cushions), and tunnels (under chairs) for dynamic movement.',
    18,
    24,
    'physical'
  ),
  (
    'a0000006-0000-4000-8000-000000000005',
    '3-Piece Wooden Inset Puzzle',
    'Encourage rotating and matching geometric or animal shapes into corresponding recessed slots on a wooden board.',
    19,
    24,
    'cognitive'
  ),
  (
    'a0000006-0000-4000-8000-000000000006',
    'Emotion Face Mirror Game',
    'Make exaggerated happy, surprised, or silly faces in the mirror together, naming feelings and celebrating imitation.',
    19,
    24,
    'social_emotional'
  ),
  (
    'a0000006-0000-4000-8000-000000000007',
    'Freeze Dance & Listening Stop',
    'Play energetic music to dance and run, pausing music suddenly while saying "Freeze!" to practice listening and impulse control.',
    20,
    24,
    'physical'
  )
on conflict (id) do update set
  title = excluded.title,
  description = excluded.description,
  min_age_month = excluded.min_age_month,
  max_age_month = excluded.max_age_month,
  domain = excluded.domain;
