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
