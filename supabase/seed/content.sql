-- ============================================================
-- BUMPTOBLOOM — LEARN CONTENT SEED DATASET
-- 40 Deduplicated Educational Cards across 5 Unified MVP Categories
-- 8 Clean, Non-Overlapping Age Bands (0–24 Months)
-- Sourced to AAP (HealthyChildren.org) & CDC
-- ============================================================

delete from content;

insert into content (
  id,
  category,
  title,
  body,
  min_age_month,
  max_age_month,
  source_label,
  source_url,
  version,
  published
) values
  -- ============================================================
  -- 0–2 MONTHS (NEWBORN / FOURTH TRIMESTER)
  -- ============================================================
  (
    'c0000001-0000-4000-8000-000000000001',
    'feeding',
    'Follow Baby’s Cues',
    'Offer breast milk or infant formula only. Feed when baby shows hunger and stop when baby shows fullness.

**Safety / Escalation Note:**
Call your pediatrician if feeding is difficult, baby is unusually sleepy, or you are worried about intake.',
    0,
    2,
    'CDC Infant & Toddler Nutrition',
    'https://www.cdc.gov/infant-toddler-nutrition/index.html',
    1,
    true
  ),
  (
    'c0000001-0000-4000-8000-000000000002',
    'sleep',
    'Safe Sleep Every Time',
    'Place baby on their back on a firm, flat sleep surface with only a fitted sheet—no pillows, blankets or toys.

**Safety / Escalation Note:**
Use a CPSC-compliant crib, bassinet or play yard. Avoid bed-sharing and inclined sleep.',
    0,
    2,
    'AAP / HealthyChildren',
    'https://www.healthychildren.org/English/ages-stages/baby/sleep/Pages/a-parents-guide-to-safe-sleep.aspx',
    1,
    true
  ),
  (
    'c0000001-0000-4000-8000-000000000003',
    'crying_soothing',
    'Comfort Calmly',
    'Check hunger, diaper and tiredness. Try a calm voice, holding, rocking or gentle soothing. Never shake a baby.

**Safety / Escalation Note:**
For a baby under 3 months, fever or unusual/inconsolable crying needs prompt medical guidance.',
    0,
    2,
    'AAP / HealthyChildren',
    'https://www.healthychildren.org/english/ages-stages/baby/crying-colic/pages/Calming-A-Fussy-Baby.aspx',
    1,
    true
  ),
  (
    'c0000001-0000-4000-8000-000000000004',
    'diaper_digestion',
    'Poop Patterns Vary',
    'Stool frequency can vary. Change soiled diapers promptly, clean gently and keep the diaper area dry.

**Safety / Escalation Note:**
Contact your pediatrician for blood in stool, repeated vomiting, dehydration concerns or a severe rash.',
    0,
    2,
    'AAP / HealthyChildren',
    'https://www.healthychildren.org/English/ages-stages/baby/diapers-clothing/Pages/Diaper-Rash.aspx',
    1,
    true
  ),
  (
    'c0000001-0000-4000-8000-000000000005',
    'mom_wellbeing',
    'Your Recovery Matters',
    'Rest when you can, accept help and tell someone how you’re feeling. Persistent sadness or anxiety deserves support.

**Safety / Escalation Note:**
In a crisis or with thoughts of harming yourself or baby, call or text 988 or seek emergency medical help.',
    0,
    2,
    'CDC Reproductive Health',
    'https://www.cdc.gov/reproductive-health/depression/index.html',
    1,
    true
  ),

  -- ============================================================
  -- 3–5 MONTHS
  -- ============================================================
  (
    'c0000001-0000-4000-8000-000000000006',
    'feeding',
    'Milk Is Still the Main Food',
    'Continue breast milk or infant formula. Watch hunger and fullness cues; solids are generally introduced around 6 months.

**Safety / Escalation Note:**
Do not start solids before 4 months. Ask your pediatrician if you are unsure about readiness.',
    3,
    5,
    'CDC Infant & Toddler Nutrition',
    'https://www.cdc.gov/infant-toddler-nutrition/foods-and-drinks/when-what-and-how-to-introduce-solid-foods.html',
    1,
    true
  ),
  (
    'c0000001-0000-4000-8000-000000000007',
    'sleep',
    'Keep Sleep Simple & Safe',
    'Back to sleep, firm and flat surface, fitted sheet only. Room-share without bed-sharing for at least the first 6 months.

**Safety / Escalation Note:**
Stop swaddling when baby shows signs of trying to roll; avoid weighted swaddles.',
    3,
    5,
    'AAP / HealthyChildren',
    'https://www.healthychildren.org/English/ages-stages/baby/sleep/Pages/a-parents-guide-to-safe-sleep.aspx',
    1,
    true
  ),
  (
    'c0000001-0000-4000-8000-000000000008',
    'crying_soothing',
    'Crying Usually Eases',
    'Fussiness often improves with age. Try feeding if hungry, a clean diaper, quiet holding, rocking or a pacifier.

**Safety / Escalation Note:**
Never shake. If crying is nonstop, unusual, or baby seems sick, contact your pediatrician.',
    3,
    5,
    'AAP / HealthyChildren',
    'https://www.healthychildren.org/english/ages-stages/baby/crying-colic/pages/Calming-A-Fussy-Baby.aspx',
    1,
    true
  ),
  (
    'c0000001-0000-4000-8000-000000000009',
    'diaper_digestion',
    'Protect Delicate Skin',
    'Change wet or soiled diapers often. Clean gently and use a fragrance-free barrier cream if skin is irritated.

**Safety / Escalation Note:**
Seek advice for open sores, spreading redness, fever, blood in stool or persistent hard stools.',
    3,
    5,
    'AAP / HealthyChildren',
    'https://www.healthychildren.org/English/ages-stages/baby/diapers-clothing/Pages/Diaper-Rash.aspx',
    1,
    true
  ),
  (
    'c0000001-0000-4000-8000-000000000010',
    'mom_wellbeing',
    'Check In With Yourself',
    'Sleep loss and recovery can be hard. Ask for practical help and speak with your provider if low mood or anxiety persists.

**Safety / Escalation Note:**
Urgent warning signs can occur after birth. In a crisis or with thoughts of harming yourself or baby, call or text 988 or seek emergency help.',
    3,
    5,
    'CDC Reproductive Health',
    'https://www.cdc.gov/reproductive-health/depression/index.html',
    1,
    true
  ),

  -- ============================================================
  -- 6–8 MONTHS
  -- ============================================================
  (
    'c0000001-0000-4000-8000-000000000011',
    'feeding',
    'Explore First Foods',
    'Around 6 months, begin soft foods when baby is ready while continuing breast milk or formula as the main nutrition.

**Safety / Escalation Note:**
Seat baby upright and supervise every bite. Avoid choking hazards; no honey before 12 months.',
    6,
    8,
    'CDC Infant & Toddler Nutrition',
    'https://www.cdc.gov/infant-toddler-nutrition/foods-and-drinks/when-what-and-how-to-introduce-solid-foods.html',
    1,
    true
  ),
  (
    'c0000001-0000-4000-8000-000000000012',
    'sleep',
    'Routine + Safe Sleep',
    'Use a simple bedtime routine, but keep infant sleep safe: back to start, firm flat surface, and an empty sleep space.

**Safety / Escalation Note:**
If baby rolls both ways independently, you do not need to reposition them after they roll.',
    6,
    8,
    'AAP / HealthyChildren',
    'https://www.healthychildren.org/English/ages-stages/baby/sleep/Pages/a-parents-guide-to-safe-sleep.aspx',
    1,
    true
  ),
  (
    'c0000001-0000-4000-8000-000000000013',
    'crying_soothing',
    'Pause, Observe, Soothe',
    'Look for hunger, tiredness or overstimulation. Use your voice, touch, holding or rocking and notice what helps.

**Safety / Escalation Note:**
Crying with illness, pain, breathing trouble or inability to console deserves prompt medical attention.',
    6,
    8,
    'AAP / HealthyChildren',
    'https://www.healthychildren.org/English/ages-stages/baby/crying-colic/Pages/Self-Soothing-Helping-Your-Baby-Learn-This-Life-Skill.aspx',
    1,
    true
  ),
  (
    'c0000001-0000-4000-8000-000000000014',
    'diaper_digestion',
    'Solids Can Change Stools',
    'New foods can change stool color, smell and texture. Offer varied appropriate foods and watch your baby’s comfort.

**Safety / Escalation Note:**
Hard painful stools, blood, repeated diarrhea or signs of dehydration should be discussed with a clinician.',
    6,
    8,
    'AAP / HealthyChildren',
    'https://www.healthychildren.org/English/ages-stages/baby/diapers-clothing/Pages/Infant-Constipation.aspx',
    1,
    true
  ),
  (
    'c0000001-0000-4000-8000-000000000015',
    'mom_wellbeing',
    'Make Space for Recovery',
    'Protect small pockets of rest, eat regularly and accept support. Tell your provider if sadness or anxiety affects daily life.

**Safety / Escalation Note:**
Seek immediate care for urgent postpartum warning signs; pregnancy-related complications can occur up to a year after delivery. In crisis, call or text 988.',
    6,
    8,
    'CDC Reproductive Health',
    'https://www.cdc.gov/reproductive-health/depression/index.html',
    1,
    true
  ),

  -- ============================================================
  -- 9–11 MONTHS
  -- ============================================================
  (
    'c0000001-0000-4000-8000-000000000016',
    'feeding',
    'Build Variety & Texture',
    'Offer a variety of soft, age-appropriate foods while continuing breast milk or formula. Let baby practice self-feeding safely.

**Safety / Escalation Note:**
Avoid choking hazards and added sugars. No honey before 12 months; supervise all meals.',
    9,
    11,
    'CDC Infant & Toddler Nutrition',
    'https://www.cdc.gov/infant-toddler-nutrition/foods-and-drinks/',
    1,
    true
  ),
  (
    'c0000001-0000-4000-8000-000000000017',
    'sleep',
    'Keep a Predictable Rhythm',
    'A consistent wind-down routine can help. Until age 1, always start sleep on the back in a firm, flat, clear sleep space.

**Safety / Escalation Note:**
Avoid pillows, loose blankets, bumpers and stuffed toys in the infant sleep area.',
    9,
    11,
    'AAP / HealthyChildren',
    'https://www.healthychildren.org/English/ages-stages/baby/sleep/Pages/a-parents-guide-to-safe-sleep.aspx',
    1,
    true
  ),
  (
    'c0000001-0000-4000-8000-000000000018',
    'crying_soothing',
    'Name the Need',
    'Fussiness may signal hunger, fatigue, discomfort or wanting closeness. Respond calmly and use familiar soothing routines.

**Safety / Escalation Note:**
Sudden persistent crying or crying with signs of illness or injury should be medically evaluated.',
    9,
    11,
    'AAP / HealthyChildren',
    'https://www.healthychildren.org/English/ages-stages/baby/crying-colic/Pages/Self-Soothing-Helping-Your-Baby-Learn-This-Life-Skill.aspx',
    1,
    true
  ),
  (
    'c0000001-0000-4000-8000-000000000019',
    'diaper_digestion',
    'Support Comfortable Poops',
    'As solids increase, stool patterns may shift. Offer age-appropriate fiber-rich foods and fluids as recommended.

**Safety / Escalation Note:**
Talk with your pediatrician if stools are consistently hard/painful, bloody, or diarrhea is persistent.',
    9,
    11,
    'AAP / HealthyChildren',
    'https://www.healthychildren.org/English/ages-stages/baby/diapers-clothing/Pages/Infant-Constipation.aspx',
    1,
    true
  ),
  (
    'c0000001-0000-4000-8000-000000000020',
    'mom_wellbeing',
    'Support Is Still Important',
    'Your well-being matters as routines change. Share the load, protect rest and ask for help when stress feels unmanageable.

**Safety / Escalation Note:**
CDC maternal warning signs apply through the first year after delivery. In crisis, call or text 988 or seek emergency help.',
    9,
    11,
    'CDC Hear Her Campaign',
    'https://www.cdc.gov/hearher/maternal-warning-signs/index.html',
    1,
    true
  ),

  -- ============================================================
  -- 12–14 MONTHS
  -- ============================================================
  (
    'c0000001-0000-4000-8000-000000000021',
    'feeding',
    'Join Family Mealtimes',
    'From 12 months, offer varied family foods in safe sizes. Use regular meals and snacks and let your toddler decide how much to eat.

**Safety / Escalation Note:**
Plain whole cow’s milk can begin at 12 months for many children; ask your clinician about individual needs.',
    12,
    14,
    'CDC Infant & Toddler Nutrition',
    'https://www.cdc.gov/infant-toddler-nutrition/mealtime/index.html',
    1,
    true
  ),
  (
    'c0000001-0000-4000-8000-000000000022',
    'sleep',
    'Keep Bedtime Predictable',
    'Use the same calm steps each night—such as wash, pajamas, book and bed—to help your toddler know sleep is coming.

**Safety / Escalation Note:**
After 12 months, sleep needs vary. Keep the sleep area safe and follow your pediatrician’s guidance.',
    12,
    14,
    'AAP / HealthyChildren',
    'https://www.healthychildren.org/English/ages-stages/baby/sleep/Pages/a-parents-guide-to-safe-sleep.aspx',
    1,
    true
  ),
  (
    'c0000001-0000-4000-8000-000000000023',
    'crying_soothing',
    'Stay Calm Through Big Feelings',
    'Toddlers may cry when tired, frustrated or separated from you. Stay close, use simple words and offer calm comfort.

**Safety / Escalation Note:**
Seek care for persistent unexplained crying, pain, injury, breathing problems or concerning illness.',
    12,
    14,
    'AAP / HealthyChildren',
    'https://www.healthychildren.org/English/ages-stages/baby/crying-colic/Pages/Self-Soothing-Helping-Your-Baby-Learn-This-Life-Skill.aspx',
    1,
    true
  ),
  (
    'c0000001-0000-4000-8000-000000000024',
    'diaper_digestion',
    'Keep Skin Clean & Dry',
    'Change soiled diapers promptly, clean gently and allow irritated skin to dry before applying a barrier cream.

**Safety / Escalation Note:**
Call your clinician for severe rash, open sores, spreading redness, fever or persistent bowel concerns.',
    12,
    14,
    'AAP / HealthyChildren',
    'https://www.healthychildren.org/English/ages-stages/baby/diapers-clothing/Pages/Diaper-Rash.aspx',
    1,
    true
  ),
  (
    'c0000001-0000-4000-8000-000000000025',
    'mom_wellbeing',
    'Care for the Caregiver',
    'Build small routines for sleep, meals, movement and connection. Ask family or friends for specific, practical help.

**Safety / Escalation Note:**
If low mood, anxiety or loss of interest persists or affects daily life, contact a health professional. In crisis, call or text 988.',
    12,
    14,
    'CDC Reproductive Health',
    'https://www.cdc.gov/reproductive-health/depression/index.html',
    1,
    true
  ),

  -- ============================================================
  -- 15–17 MONTHS
  -- ============================================================
  (
    'c0000001-0000-4000-8000-000000000026',
    'feeding',
    'Practice Healthy Routines',
    'Offer 3 meals and 2–3 snacks on a routine. Serve varied foods and avoid pressure to clean the plate.

**Safety / Escalation Note:**
Cut foods into safe shapes and supervise eating. Avoid choking hazards and foods with added sugars.',
    15,
    17,
    'CDC Infant & Toddler Nutrition',
    'https://www.cdc.gov/infant-toddler-nutrition/mealtime/index.html',
    1,
    true
  ),
  (
    'c0000001-0000-4000-8000-000000000027',
    'sleep',
    'Protect the Wind-Down',
    'Keep bedtime calm and consistent. Dim stimulation, use a short routine and give your toddler time to settle.

**Safety / Escalation Note:**
If sleep suddenly changes with pain, breathing problems or illness, contact your pediatrician.',
    15,
    17,
    'AAP / HealthyChildren',
    'https://www.healthychildren.org/English/ages-stages/baby/sleep/Pages/a-parents-guide-to-safe-sleep.aspx',
    1,
    true
  ),
  (
    'c0000001-0000-4000-8000-000000000028',
    'crying_soothing',
    'Connect Before Redirecting',
    'When upset, get close, speak calmly and name the feeling. Once settled, gently redirect to a safe activity.

**Safety / Escalation Note:**
Never shake or use physical punishment. Seek help for unusual or persistent distress.',
    15,
    17,
    'AAP / HealthyChildren',
    'https://www.healthychildren.org/English/ages-stages/baby/crying-colic/Pages/Self-Soothing-Helping-Your-Baby-Learn-This-Life-Skill.aspx',
    1,
    true
  ),
  (
    'c0000001-0000-4000-8000-000000000029',
    'diaper_digestion',
    'Watch Comfort, Not Just Frequency',
    'Poop frequency varies. Focus on whether stools are soft and comfortable rather than expecting a daily bowel movement.

**Safety / Escalation Note:**
Persistent hard/painful stools, blood, vomiting or poor intake should be discussed with a clinician.',
    15,
    17,
    'AAP / HealthyChildren',
    'https://www.healthychildren.org/English/ages-stages/baby/diapers-clothing/Pages/Infant-Constipation.aspx',
    1,
    true
  ),
  (
    'c0000001-0000-4000-8000-000000000030',
    'mom_wellbeing',
    'Lower the Daily Load',
    'Choose one or two priorities, share tasks and make room for rest or something restorative—even in short blocks.

**Safety / Escalation Note:**
Persistent depression or anxiety is treatable; reach out to a health professional for support. In crisis, call or text 988.',
    15,
    17,
    'CDC Reproductive Health',
    'https://www.cdc.gov/reproductive-health/depression/index.html',
    1,
    true
  ),

  -- ============================================================
  -- 18–20 MONTHS
  -- ============================================================
  (
    'c0000001-0000-4000-8000-000000000031',
    'feeding',
    'Expect Changing Appetites',
    'Toddler appetite can vary day to day. Keep offering balanced choices at regular meals and snacks without forcing bites.

**Safety / Escalation Note:**
Continue close supervision and age-safe food preparation to reduce choking risk.',
    18,
    20,
    'CDC Infant & Toddler Nutrition',
    'https://www.cdc.gov/infant-toddler-nutrition/mealtime/index.html',
    1,
    true
  ),
  (
    'c0000001-0000-4000-8000-000000000032',
    'sleep',
    'Consistency Helps Toddlers',
    'Keep wake, nap and bedtime routines reasonably consistent. A familiar sequence can make transitions easier.

**Safety / Escalation Note:**
Avoid using unapproved sleep products or medications to make a child sleep unless directed by a clinician.',
    18,
    20,
    'AAP / HealthyChildren',
    'https://www.healthychildren.org/English/ages-stages/baby/sleep/Pages/a-parents-guide-to-safe-sleep.aspx',
    1,
    true
  ),
  (
    'c0000001-0000-4000-8000-000000000033',
    'crying_soothing',
    'Coach Through Frustration',
    'Use short phrases like “You’re upset.” Stay calm, keep limits simple and offer comfort while the feeling passes.

**Safety / Escalation Note:**
Crying with severe pain, injury, breathing difficulty or unusual behavior needs medical attention.',
    18,
    20,
    'AAP / HealthyChildren',
    'https://www.healthychildren.org/English/ages-stages/baby/crying-colic/Pages/Self-Soothing-Helping-Your-Baby-Learn-This-Life-Skill.aspx',
    1,
    true
  ),
  (
    'c0000001-0000-4000-8000-000000000034',
    'diaper_digestion',
    'Prevent Diaper Irritation',
    'Frequent changes, gentle cleaning and a dry diaper area help prevent rash—especially after loose stools.

**Safety / Escalation Note:**
Severe, spreading or persistent rash should be evaluated; watch for dehydration with diarrhea.',
    18,
    20,
    'AAP / HealthyChildren',
    'https://www.healthychildren.org/English/ages-stages/baby/diapers-clothing/Pages/Diaper-Rash.aspx',
    1,
    true
  ),
  (
    'c0000001-0000-4000-8000-000000000035',
    'mom_wellbeing',
    'Recharge Without Guilt',
    'Regular meals, movement, connection and realistic expectations can support well-being. Ask for help before you are depleted.

**Safety / Escalation Note:**
If emotional symptoms persist or interfere with daily life, talk with a health professional. In crisis, call or text 988.',
    18,
    20,
    'CDC Reproductive Health',
    'https://www.cdc.gov/reproductive-health/depression/index.html',
    1,
    true
  ),

  -- ============================================================
  -- 21–24 MONTHS
  -- ============================================================
  (
    'c0000001-0000-4000-8000-000000000036',
    'feeding',
    'Build a Family Food Routine',
    'Offer regular meals and snacks with fruits, vegetables, proteins, grains and dairy or suitable alternatives. Let your child choose how much.

**Safety / Escalation Note:**
Keep portions and textures age-appropriate, supervise eating and avoid common choking hazards.',
    21,
    24,
    'CDC Infant & Toddler Nutrition',
    'https://www.cdc.gov/infant-toddler-nutrition/foods-and-drinks/',
    1,
    true
  ),
  (
    'c0000001-0000-4000-8000-000000000037',
    'sleep',
    'Make Bedtime Boring—in a Good Way',
    'Use a short, predictable bedtime routine and consistent limits. Quiet books, cuddles and the same order can help.

**Safety / Escalation Note:**
Talk with your pediatrician about persistent snoring, breathing pauses or major ongoing sleep problems.',
    21,
    24,
    'AAP / HealthyChildren',
    'https://www.healthychildren.org/English/ages-stages/baby/sleep/Pages/a-parents-guide-to-safe-sleep.aspx',
    1,
    true
  ),
  (
    'c0000001-0000-4000-8000-000000000038',
    'crying_soothing',
    'Help Name Big Feelings',
    'Acknowledge feelings, stay calm and hold the boundary: “You’re mad. I’m here. Hitting isn’t safe.” Redirect when calm.

**Safety / Escalation Note:**
Seek medical advice when crying is unexplained, persistent or accompanied by concerning symptoms.',
    21,
    24,
    'CDC Act Early Milestones',
    'https://www.cdc.gov/act-early/milestones/index.html',
    1,
    true
  ),
  (
    'c0000001-0000-4000-8000-000000000039',
    'diaper_digestion',
    'Support Easy Bowel Habits',
    'Offer water and varied fiber-containing foods. Give your toddler time to poop without pressure or shame.

**Safety / Escalation Note:**
Painful hard stools, blood, repeated vomiting or persistent diarrhea should be discussed with a clinician.',
    21,
    24,
    'AAP / HealthyChildren',
    'https://www.healthychildren.org/English/ages-stages/baby/diapers-clothing/Pages/Infant-Constipation.aspx',
    1,
    true
  ),
  (
    'c0000001-0000-4000-8000-000000000040',
    'mom_wellbeing',
    'Keep Your Support System Active',
    'Parenting a toddler is demanding. Protect time for sleep, connection, movement and activities that help you recharge.

**Safety / Escalation Note:**
If sadness, anxiety or overwhelm is persistent or affects functioning, seek professional support. In crisis, call or text 988.',
    21,
    24,
    'CDC Reproductive Health',
    'https://www.cdc.gov/reproductive-health/depression/index.html',
    1,
    true
  );
