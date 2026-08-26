"""
Per-task detail: what to do, what done means, what to check before a PR.

Keyed by the exact task name in BumpToBloom-Monday-Import.csv. Anything not
listed here gets the generic checklist only — if you find a task with no detail,
add it, don't just get on with it and hope.

Why this exists: we span 12.5 hours. If someone in India starts a task at 9am
and the description is ambiguous, they are blocked for nine hours waiting for
someone in California to wake up. Acceptance criteria are how that stops
happening.
"""

DETAIL: dict[str, dict] = {

# ============================================================ WEEK 1

"DECISION: Confirm pediatric clinical reviewer for Health content": {
 "do": ["Ask AI4ALL mentors, university contacts, and anyone's family GP first — a pediatric nurse practitioner is enough, it does not have to be an MD.",
        "Scope the ask honestly: one page of thresholds and about six short screens of copy. Roughly an hour of their time.",
        "Agree a turnaround date. We send in Week 3 and need it back by Week 5."],
 "done": ["A named person has agreed in writing",
          "They know what they're reviewing and roughly how long it takes",
          "A return date is agreed and in the calendar",
          "Their name is in docs/SAFETY.md"]},

"DECISION: Legal review - COPPA / HIPAA / state health-privacy exposure": {
 "do": ["Ask the programme whether they have counsel we can use. University legal clinics also do this for student projects.",
        "The three questions: may we store infant health data under a parent account, does COPPA apply when the account holder is the adult, and does a fever triage tool risk being classed as a medical device.",
        "Get the answer in writing, even informally."],
 "done": ["A written answer to all three questions",
          "If anything is a no, we know what changes",
          "Filed somewhere the team can find it"]},

"Create GitHub org + repo, push scaffold, set branch protection": {
 "do": ["Org and repo exist and the scaffold is pushed.",
        "Still to do: branch protection on main and develop, and replace the placeholder handles in .github/CODEOWNERS with real usernames."],
 "done": ["main and develop both require one approving review",
          "Both require CI to pass before merge",
          "CODEOWNERS has real usernames, no placeholders",
          "develop is up to date with main"]},

"Create Supabase project, apply migration 0001, verify RLS": {
 "do": ["Create the project in a US region. Name it bumptobloom-dev.",
        "Apply supabase/migrations/0001_init.sql.",
        "Create two test accounts, each with one baby, and prove they cannot see each other.",
        "Share the URL and anon key with pod leads through the password store, NOT Discord."],
 "done": ["All 19 tables exist",
          "Signed in as account A, selecting from `babies` returns exactly one row",
          "Same check passes for baby_milestones, fever_checks, saved_content and ai_conversations",
          "Selecting from prompt_versions or audit_events with the anon key returns nothing",
          "Connection details are in the password store and .env.example still has no real values"],
 "note": "This blocks almost every other engineering task. If one thing lands first, make it this."},

"Freeze API contracts with all pod leads": {
 "do": ["Walk docs/API-CONTRACTS.md with Joanna, Shaff Had and Sivathmika.",
        "Fix anything wrong now — after this it needs a PR.",
        "Say clearly in Discord that it is frozen and what that means."],
 "done": ["Every pod lead has read it and said yes",
          "Corrections are merged",
          "The team knows changes now go through a PR with two lead approvals"]},

"Tell design: onboarding becomes a date picker, not a month slider": {
 "do": ["Send Syeda ADR-004 and explain we store the birthday and calculate age from it.",
        "This answers her open question about days vs weeks vs months — the answer is a date picker.",
        "Ask for the redesigned onboarding screen and the 'Change age' modal."],
 "done": ["Syeda has confirmed she understands the change",
          "New onboarding screen is in the Figma",
          "The 'Month 8' slider and the Change-age modal are both updated"]},

"Tell design: pregnancy is out of MVP, need a 'coming soon' screen": {
 "do": ["Explain ADR-002: 0–24 months only for this version.",
        "Every 'Week 24' screen has no v1 implementation — she should know before she polishes any of them.",
        "Ask for one 'coming soon' screen behind the 'I'm expecting' button, with an email capture."],
 "done": ["Syeda knows which screens are out of scope",
          "A coming-soon screen exists in the Figma",
          "The 'I'm expecting' button is wired to it"]},

"Tell design: Track is missing the Social/Emotional domain": {
 "do": ["Point out the counter says '0 of 9' but only six checkboxes render.",
        "The Master sheet lists social-emotional in one row and says 'at least three types' in another, so this is a should-have, not a blocker."],
 "done": ["Syeda knows the counter and the checkboxes disagree",
          "Either the fourth domain is added or the counter is corrected"]},

"Tell design: Track has no disclaimer; copy is already approved": {
 "do": ["Send her the approved wording — it is already in the Master sheet, she does not need to write it.",
        "It must appear on every checklist view and must not be dismissible."],
 "done": ["The disclaimer is on the Track screen in the Figma",
          "It is visible without scrolling",
          "It has no dismiss or close control"]},

"Tell design: fever article must run severity high-to-low": {
 "do": ["Explain the problem plainly: a 2-month-old at 101.4°F is an emergency room visit, and our current screen opens with 'usually manageable at home, try a sponge bath'.",
        "Ask for three result screens — monitor, call your doctor, go now — with severity descending on each.",
        "The emergency one is the priority."],
 "done": ["Three result screens exist in the Figma",
          "The emergency screen is unmistakable — no green, no home-care advice above the fold",
          "The fever article reorders so emergency guidance comes first"],
 "note": "Highest-severity design item on the board. If Syeda only does one thing, this is it."},

"Ratify naming + nav order": {
 "do": ["Pick one name for the commerce tab. It currently has five across our documents.",
        "Proposal: Cart in the UI, `act` in code and routes.",
        "Confirm nav order: Home, Track, Learn, Ask, Health, Cart."],
 "done": ["One name chosen and announced",
          "Nav order confirmed",
          "Design and engineering both told"]},

"Scaffold Expo app: TypeScript, Expo Router, NativeWind": {
 "do": ["`npx create-expo-app@latest apps/mobile --template` with the TypeScript template.",
        "Add Expo Router and NativeWind. Wire the Supabase client in lib/supabase.ts reading EXPO_PUBLIC_ vars.",
        "Create the folder shape described in apps/mobile/README.md.",
        "Confirm someone else can clone, install, and open it in Expo Go on their own phone."],
 "done": ["`npx expo start` runs and the app opens in Expo Go",
          "A second person has done it on their own phone from a clean clone",
          "Expo Router is working — at least two routes navigate",
          "A NativeWind class renders correctly",
          "No secret anywhere in the repo"],
 "note": "Blocks all UI work. Aim for Wednesday."},

"Supabase Auth: log in, create account, forgot password": {
 "do": ["Use @supabase/supabase-js with AsyncStorage for session persistence — sessions must survive an app restart.",
        "Three screens matching the Figma: log in, create account, forgot password.",
        "Route signed-in users to Home and signed-out users to log in."],
 "done": ["Create account, log out, log in again all work on a real phone",
          "Closing and reopening the app keeps you signed in",
          "Forgot-password sends an email and the link works",
          "Wrong password shows a readable message, not a raw error",
          "A parent_profiles row is created on signup"]},

"Extract design tokens from Figma into the NativeWind theme": {
 "do": ["Pull colours, font sizes, spacing and radii out of the Figma into one file.",
        "Do NOT wait for the app scaffold — write them into a plain TypeScript file now and wire them into the NativeWind config later.",
        "Name them by role (background, surface, textPrimary), not by appearance (cream, green)."],
 "done": ["One file holds every colour, font size and spacing value",
          "Names describe role, not colour",
          "Both fonts are loaded and render on a device",
          "No hardcoded hex anywhere else in the app"],
 "note": "Can start immediately — it only needs Figma."},

"Build the Expo Router tab navigator for all six tabs": {
 "do": ["Six tabs: Home, Track, Learn, Ask, Health, Cart. Route folder for Cart is `act`.",
        "Each tab gets a placeholder screen with its name.",
        "Flag it if six tabs looks cramped on a small phone — both platforms recommend five."],
 "done": ["All six tabs render and navigate on a real device",
          "Labels are readable on the smallest phone we support",
          "The active tab is visually obvious",
          "Icons match the Figma"]},

"Baby profile: create + edit, date picker, derived age": {
 "do": ["A date picker for the birthday. Never a month slider, never a typed age.",
        "Optional due date for babies born early.",
        "Photo upload to Supabase Storage.",
        "Age is calculated from birth_date every time it is displayed."],
 "done": ["Birthday is chosen with a native date picker",
          "Future dates are rejected",
          "Age displays correctly for a newborn, a 6-month-old and a 23-month-old",
          "The photo uploads and survives an app restart",
          "No month number is stored anywhere"]},

"Scaffold the Ask Edge Function and deploy a stub": {
 "do": ["`supabase functions new ask`. Deno + TypeScript.",
        "It should verify the caller's JWT and return a hardcoded string for now.",
        "Deploy it and confirm the app can call it."],
 "done": ["The function is deployed and reachable",
          "A request without a valid JWT is rejected",
          "The app gets a response back",
          "No key is committed — set with `supabase secrets set`"],
 "note": "Needs Keya's Supabase project first."},

"Set up EAS Build and get a dev build onto real devices": {
 "do": ["`eas build:configure`, then a development profile for both platforms.",
        "Get a build onto at least one iPhone and one Android.",
        "Write down what you did — everyone will need this eventually."],
 "done": ["A dev build is installed on an iPhone and an Android",
          "eas.json is committed",
          "Someone other than you has installed it",
          "Steps are written up in apps/mobile/README.md"]},

"Register Apple Developer and Google Play accounts": {
 "do": ["Apple Developer Program, $99/year. Identity verification takes days — start immediately.",
        "Google Play Console, $25 one-time. Register as an ORGANISATION, not personal.",
        "The organisation choice matters: new personal accounts must run a closed test with 12 testers for 14 continuous days before production."],
 "done": ["Both accounts exist and are verified",
          "Play is registered as an organisation",
          "Someone other than one student has recovery access",
          "Costs are confirmed with whoever is paying"],
 "note": "Longest lead time in Week 1. Nothing engineering does shortens Apple's verification queue."},

"Half-day React Native ramp-up for anyone new to it": {
 "do": ["Cover the differences that actually bite: View instead of div, Text instead of p, no CSS cascade, StyleSheet, Flexbox defaults to column not row.",
        "Everyone installs Expo Go and runs the app on their own phone during the session.",
        "Record it — three timezones will miss it live."],
 "done": ["Session held and recorded",
          "Recording posted in the group",
          "Everyone who attended has the app running on their own phone"]},

"Begin CDC milestone dataset extraction": {
 "do": ["Source: cdc.gov/act-early/milestones.",
        "Nine checkpoints: 0, 2, 4, 6, 9, 12, 15, 18, 24 months.",
        "Four domains per checkpoint: physical, cognitive, language, social_emotional.",
        "A spreadsheet is fine — we will convert it to SQL."],
 "done": ["All nine checkpoints covered",
          "All four domains present at each",
          "Every row has a source label and a URL",
          "Wording is plain enough for a tired parent",
          "Handed to whoever writes the seed file"],
 "note": "No dependencies at all. Can start before anything else exists."},

"Everyone: read DECISIONS + ONBOARDING + SAFETY, get dev env running": {
 "do": ["Read docs/ONBOARDING.md, then docs/DECISIONS.md. Fifteen minutes.",
        "If you will touch anything in Health, read docs/SAFETY.md too. Not optional.",
        "Clone, install, get the app running in Expo Go on your own phone."],
 "done": ["You have read all three",
          "The app runs on your phone",
          "You know which pod you are in and who your bridge person is",
          "You have said hello in your pod's thread"]},

# ============================================================ WEEK 2

"Seed milestones: 4 domains x 9 checkpoints, with sources": {
 "do": ["Turn Natasha's dataset into supabase/seed/milestones.sql.",
        "Apply it with the service role, never from the app."],
 "done": ["Every row has a source_label",
          "All nine checkpoints and all four domains present",
          "Seed is re-runnable without creating duplicates",
          "A signed-in test account can read milestones but not write them"]},

"Milestones data layer: fetch, mark noticed, unmark": {
 "do": ["Write it in apps/mobile/lib/api/. Screens never query Supabase directly.",
        "Return the shape in docs/API-CONTRACTS.md, including the disclaimer field.",
        "Marking should feel instant — update locally first, then persist."],
 "done": ["All four domains always returned, even when empty",
          "The disclaimer string is in the response",
          "Marking and unmarking both persist across an app restart",
          "Another account's marks are never visible",
          "Loading and error states exist"]},

"Track screen: checkpoint navigator, 4 domains, progress counter": {
 "do": ["Replace the unlabelled 1–6 pagination in the Figma with real checkpoint months.",
        "Group by domain. Show progress as 'x of y noticed'.",
        "Let people browse other checkpoints, not only their baby's."],
 "done": ["Checkpoints show real months, not 1–6",
          "The counter matches the number of checkboxes on screen",
          "Tapping a checkbox feels instant",
          "Works on the smallest phone we support"]},

"Render the Track disclaimer on every checklist view": {
 "do": ["Use the approved copy from the Master sheet, unchanged.",
        "It must be visible without scrolling and must not be dismissible."],
 "done": ["Visible on every checklist view",
          "No dismiss control",
          "Readable at the largest accessibility text size",
          "Wording matches the Master sheet exactly"]},

"Home data layer: getHome() with Supabase queries": {
 "do": ["One function returning baby, this-week guidance, and milestone progress.",
        "Age is computed from birth_date server-side or at fetch time — never cached across days."],
 "done": ["Returns the contract shape",
          "ageMonths is correct for a newborn and a 23-month-old",
          "One call, not four round trips",
          "Handles a parent who has no baby yet"]},

"Home screen: profile card, this-week card, quick actions": {
 "do": ["Follow the design-change log: Bloom bar removed, nav at the bottom, edit icon on the profile card.",
        "One guidance card, then quick actions to Health, Ask and Cart.",
        "The standing disclaimer sits at the bottom."],
 "done": ["Matches the updated Figma",
          "Every quick action navigates correctly",
          "Loading state is a skeleton, not a spinner on blank",
          "The disclaimer is present"]},

"Activities: table, seed, data layer": {
 "do": ["Seed age-appropriate activities and expose a fetch-by-age function."],
 "done": ["Activities exist for every age bucket 0–24",
          "Fetching by age returns only appropriate ones",
          "Marking complete persists"]},

"Design Ask prompt architecture and baby-context builder": {
 "do": ["Write the system prompt. Tone: warm, plain, never diagnostic.",
        "Define exactly what context goes in: age in months and developmental stage. Nothing else.",
        "Decide how history is truncated.",
        "Write it down in the repo, not just in the code."],
 "done": ["System prompt is committed and versioned",
          "The context builder passes NO name, user id or email",
          "Truncation rule is written down",
          "Reviewed by one other person before it is used"]},

"Age derivation utility + tests, including preterm corrected age": {
 "do": ["One function from birth_date to age in months. Everything uses it.",
        "Corrected age when due_date is set.",
        "Test the boundaries — birthdays, leap years, month ends."],
 "done": ["Tested at 0, 1, 6, 12, 24 months and the boundaries between",
          "Corrected age is right for a baby born 8 weeks early",
          "Rejects future dates",
          "Nothing else in the codebase computes age independently"]},

"RLS isolation test suite: two accounts, every private table": {
 "do": ["Seed two accounts with a baby each and data in every private table.",
        "Assert account A sees exactly its own rows and nothing of B's.",
        "Run it in CI, not by hand."],
 "done": ["Every private table covered: parent_profiles, babies, baby_milestones, baby_activities, saved_content, fever_checks, ai_conversations, ai_messages, ai_runs",
          "Deliberately breaking a policy makes the suite fail",
          "It runs in CI on every PR",
          "prompt_versions and audit_events return nothing to a client"],
 "note": "On mobile the app talks to Supabase directly, so RLS is the ENTIRE access-control layer. There is no server to catch a mistake."},

# ============================================================ WEEK 3

"Build Learn content dataset: Developmental, Feeding, Sleep, Diaper": {
 "do": ["Four categories, per the Master sheet. Not the six in the tech-stack doc.",
        "Age-bucketed. Every item needs a source.",
        "Write for someone reading at 3am on four hours' sleep."],
 "done": ["All four categories covered across 0–24 months",
          "Every item has a source label and URL",
          "No item gives medical instruction — that belongs in Health",
          "Read back by someone who is not the author"]},

"Learn data layer: fetch by age and category, save, unsave": {
 "do": ["Fetch by baby age and optional category. Save and unsave per parent."],
 "done": ["Age filtering returns only appropriate content",
          "Category filter works, and 'All' returns everything",
          "Saved state persists across restart",
          "Another parent's saves are invisible"]},

"Learn screen with category filters and save": {
 "do": ["Filter chips across the top, cards below, source label on every card."],
 "done": ["Every card shows its source",
          "Filters work and the active one is obvious",
          "Save toggles and persists",
          "Empty state is a real message, not a blank screen"]},

"Finalise fever rules engine, set RULES_VERSION": {
 "do": ["The engine and its 33 tests already exist. This is the review and version pin.",
        "Read every threshold once more, deliberately.",
        "Set RULES_VERSION and make sure every logged check records it."],
 "done": ["RULES_VERSION is set and used in every fever_checks row",
          "All 33 tests plus 3 invariants pass",
          "Thresholds re-read line by line",
          "Ready to hand to the clinical reviewer"]},

"Send fever rules and result copy to clinical reviewer": {
 "do": ["Send a plain one-page table of age, temperature, red flags and outcome. Not code.",
        "Include the three result screens' copy.",
        "Ask specifically: is any threshold wrong, and does any wording read as diagnosis?"],
 "done": ["Reviewer has the table and the copy",
          "They know the return date",
          "They have been told this is educational triage, not diagnosis"],
 "note": "Deliberately Week 3 so review runs Weeks 4–6 in parallel instead of blocking launch."},

"Wire the fever engine into the app and log results": {
 "do": ["Import @btb/fever-rules and call assessFever on the device.",
        "Age comes from birth_date fetched at login. Never ask the parent for an age.",
        "Log the result to Supabase fire-and-forget."],
 "done": ["A result appears with the phone in airplane mode",
          "A logging failure never shows an error to the parent",
          "Every check writes rule_id and rules_version",
          "Invalid input shows an error and the emergency banner, never a reassuring result"],
 "note": "Runs on the device on purpose. A network timeout during a fever check would be the worst bug this product could have."},

"fever_checks logging with rule_id and rules_version": {
 "do": ["Persist inputs, rectal-equivalent, tier, rule_id and rules_version.",
        "Without rule_id and version we cannot reconstruct what the app told a parent."],
 "done": ["Every field populated on every check",
          "Rows are readable only by the owning parent",
          "Never used for analytics or ad targeting"]},

"Build Ask evaluation harness": {
 "do": ["A golden set of questions with expected behaviour.",
        "Must include symptom questions that are REQUIRED to redirect to Health.",
        "Include edge cases near the guard's keyword boundaries."],
 "done": ["At least 30 questions",
          "At least 10 are symptom questions that must redirect",
          "The harness runs and reports pass rate",
          "A prompt change can be compared before and after"]},

"E2E test: onboarding -> home -> track, on a real device": {
 "do": ["Maestro or Detox against a dev build, not Expo Go."],
 "done": ["Signup through to marking a milestone passes end to end",
          "Runs on both platforms",
          "Documented so someone else can run it"]},

# ============================================================ WEEK 4

"Build product catalog with a written rationale per product": {
 "do": ["Every product needs a one-line reason tied to a developmental need.",
        "Age-bucketed: 0–3, 4–8, 9–14, 15–24 months.",
        "Indicative prices only. We are not a shop."],
 "done": ["Every product has a rationale — a recommendation without a reason is just an advert",
          "Every age bucket has at least four products",
          "No product implies medical necessity",
          "Prices are marked indicative"]},

"Recommendation rules by age bucket (0-3, 4-8, 9-14, 15-24)": {
 "do": ["Map each bucket to a product set with a priority order."],
 "done": ["Every age 0–24 returns at least three products",
          "Changing the baby's age changes the list",
          "No duplicates in one list"]},

"Recommendations data layer + retailer search URLs": {
 "do": ["Plain search URLs, no affiliate programme: https://www.amazon.com/s?k=belly+oil",
        "Build one URL template per retailer.",
        "URL-encode the search terms properly."],
 "done": ["All three retailers return a working search for every product",
          "Terms with spaces and punctuation are encoded correctly",
          "Links open in the phone's browser, not inside the app"]},

"Cart screen with retailer links, no checkout, no list total": {
 "do": ["Per the Master sheet: remove 'Add to List' and every payment step.",
        "Cards with name, rationale, indicative price, three retailer buttons.",
        "Standing disclaimer that these are suggestions, not medical necessity."],
 "done": ["No list, no total, no checkout anywhere",
          "Every card shows its rationale",
          "Retailer buttons open the right search",
          "Disclaimer present"]},

"Ask: OpenAI integration and context builder": {
 "do": ["In the Edge Function only. Key from `supabase secrets`, never the app.",
        "Build context: age in months and developmental stage. Nothing identifying."],
 "done": ["Real answers come back through the app",
          "No name, user id or email reaches OpenAI",
          "The key does not appear anywhere in the repo or the bundle",
          "Model and prompt version are recorded per call"]},

"Ask: Zod response validation + ai_runs logging": {
 "do": ["Validate the response shape before returning it. Log an ai_runs row per call."],
 "done": ["A malformed response is caught, not shown to a parent",
          "Every call logs tokens, latency and prompt version",
          "validation_ok is recorded accurately"]},

"Ask: triage guard tests and keyword tuning": {
 "do": ["The guard runs BEFORE the model call, never after.",
        "Bias to false positives — sending someone to the Fever Checker unnecessarily costs a tap.",
        "Test with real phrasings a worried parent would use."],
 "done": ["All 15 existing guard tests pass",
          "At least 10 new realistic symptom phrasings added and redirecting",
          "Ordinary parenting questions still get answered",
          "No model call happens on a redirect — verified in logs"],
 "note": "This is a safety component. Read docs/SAFETY.md first."},

"Ask: conversation persistence and history queries": {
 "do": ["History reads straight from Supabase with RLS. No Edge Function needed for that half."],
 "done": ["Conversations persist across app restarts",
          "Another parent's conversations are never visible",
          "History loads in a sensible order"]},

"Ask chat screen with standing disclaimer": {
 "do": ["Disclaimer visible before the first message is sent.",
        "Keyboard handling on a phone is the fiddly part — test with the keyboard open on a small screen."],
 "done": ["Disclaimer shows before any message",
          "The input is not hidden behind the keyboard on a small phone",
          "A redirect shows the Health hand-off, not answer text",
          "Failure shows a plain message and never a generated fallback"]},

"Wire PostHog events per tech-stack doc section 15": {
 "do": ["The events listed in the tech-stack doc.",
        "Health events must be excluded from any ad-targeting integration."],
 "done": ["Events fire and appear in PostHog",
          "No health data in any ad integration",
          "No personal data in event properties"]},

# ============================================================ WEEK 5

"Fever Checker screen: auto age, method selector, red-flag list": {
 "do": ["Age is filled automatically from the baby's birthday. Never ask.",
        "Add the measurement-method selector — rectal, oral, axillary, temporal, tympanic. This is new versus the Figma and it matters.",
        "Red-flag checklist exactly as in the engine."],
 "done": ["Age is pre-filled and not editable here",
          "Method selector present and changes the result correctly",
          "An axillary reading of 99.5°F for a 2-month-old returns EMERGENCY",
          "Tympanic under 6 months shows the reliability caution",
          "Impossible temperatures are rejected with a clear message"],
 "note": "An axillary reading runs about 1°F below rectal. Without the method selector we would tell that parent to go back to bed."},

"Three fever result screens, severity high-to-low": {
 "do": ["MONITOR, CALL, EMERGENCY. Severity descending on every screen.",
        "The emergency screen must be unmistakable — no green, no home-care advice above the fold.",
        "No medication dosing anywhere. Ever."],
 "done": ["All three render correctly for their tier",
          "Emergency shows call-911 guidance first",
          "No drug name appears with a dose or frequency",
          "The client never re-derives or overrides the tier"]},

"Persistent 911 banner above the fold on every Health screen": {
 "do": ["Visible without scrolling on entry to every Health screen. Not dismissible."],
 "done": ["Visible without scrolling on every Health screen",
          "No dismiss control",
          "Readable at the largest text size",
          "Present on the result screens too, not just the form"]},

"Apply clinical reviewer feedback to rules and copy": {
 "do": ["Apply every change they asked for. Do not argue with a threshold by yourself.",
        "Update the test table in the SAME PR.",
        "Bump RULES_VERSION."],
 "done": ["Every piece of feedback applied or explicitly discussed with them",
          "Test table updated in the same PR",
          "RULES_VERSION bumped",
          "All tests pass"]},

"Ask conversation history and sidebar": {
 "do": ["Per the Master sheet: history in a side navigation, like ChatGPT."],
 "done": ["Past conversations are listed and openable",
          "Works on a phone-sized screen",
          "Only your own conversations appear"]},

"Wire Sentry React Native, with source maps for both platforms": {
 "do": ["Source maps matter — without them a crash report is unreadable hex.",
        "Set them up now, not after the first crash."],
 "done": ["A deliberate test crash appears in Sentry with readable line numbers",
          "Both platforms configured",
          "No personal or health data in error payloads"]},

"Device pass: small iPhone, large Android, and one old slow phone": {
 "do": ["Our users are often on whatever phone they already had. Test on something cheap and three years old, not just a flagship."],
 "done": ["Every screen tested on all three",
          "Nothing is cut off on the smallest screen",
          "Usable on the slow device — no frozen taps",
          "Issues filed with screenshots"]},

"Accessibility pass: VoiceOver, TalkBack, large text": {
 "do": ["Our users are sleep-deprived and often in low light at 3am. This matters more here than on a normal product.",
        "Every interactive element needs a label. Test at the largest system text size."],
 "done": ["Every button and input has an accessibility label",
          "The app is usable end to end with VoiceOver",
          "Nothing overlaps or truncates at the largest text size",
          "Contrast checked on every screen"]},

"Run Ask evals, tune prompt, pin the winning version": {
 "do": ["Run the harness, adjust, re-run. Pin the version that wins."],
 "done": ["All symptom questions redirect — no exceptions",
          "Ordinary questions get useful answers",
          "The winning prompt version is marked active",
          "Results recorded so the next change can be compared"]},

# ============================================================ WEEK 6

"RLS penetration test against a seeded multi-account dataset": {
 "do": ["Seed several accounts with realistic data and actively try to reach another account's rows.",
        "Try the anon key directly against every table, not only through the app."],
 "done": ["No private table is readable across accounts",
          "The anon key alone reaches nothing private",
          "Findings written up, even if all clean"]},

"Full E2E suite green across all six tabs on a real device": {
 "do": ["Every tab, both platforms, against a dev build."],
 "done": ["All six tabs covered",
          "Green on both platforms",
          "Runs in CI or is documented well enough for anyone to run"]},

"Safety test table final pass and sign-off": {
 "do": ["Read all 33 cases and the 3 invariants once more, deliberately.",
        "Confirm nothing was weakened to make CI pass."],
 "done": ["All tests pass",
          "No case has been deleted or weakened since Week 3",
          "The under-3-months invariant still sweeps every combination",
          "Signed off in writing"]},

"Record clinical sign-off in REVIEW.md": {
 "do": ["Reviewer name, credentials, date, RULES_VERSION reviewed, and what they approved."],
 "done": ["REVIEW.md exists with all of it",
          "The version reviewed matches the version shipping",
          "docs/SAFETY.md status table updated to cleared"],
 "note": "HARD LAUNCH GATE. Without this the Health tab cannot ship to real parents."},

"Performance: cold start under 3s on a mid-tier phone": {
 "do": ["Cold start is the number that matters on mobile, not first paint."],
 "done": ["Under 3s on a mid-tier Android",
          "No blank white screen during launch",
          "Measured and written down, not eyeballed"]},

"Beta with 10-20 real first-time parents": {
 "do": ["Distribute through TestFlight and Play internal testing.",
        "Give them a way to report problems that is not 'message us on Discord'."],
 "done": ["At least 10 parents have it installed",
          "A feedback route exists and people have used it",
          "Feedback collected somewhere the team can read"]},

"Bug triage and fixes from beta": {
 "do": ["Triage daily. Anything in Health jumps the queue."],
 "done": ["Every report has a decision: fixing, not fixing, or after launch",
          "Health issues fixed first",
          "Nothing safety-related left open"]},

"Ship to TestFlight and Play internal testing, smoke test": {
 "do": ["Internal distribution, not the public stores. No review queue and it demos identically.",
        "Smoke test the install on a device that has never had the app."],
 "done": ["Installable from TestFlight and Play internal testing",
          "A clean install works end to end",
          "The team can install it",
          "Points at production Supabase with RLS on"]},

"App store assets: icon, splash, screenshots, privacy labels": {
 "do": ["Icon at every required size, splash screen, screenshots per platform.",
        "Both stores need a privacy declaration. We collect infant health data, so it must match the privacy policy exactly — they are read together."],
 "done": ["Icon and splash render correctly on both platforms",
          "Screenshots at required sizes",
          "Privacy declarations complete and consistent with the published policy",
          "Health data declared honestly"]},

# ============================================================ ASK (Pod I)

"Ask module structure and OpenAI client setup": {
 "do": ["Own supabase/functions/ask end to end. Structure it so prompt, context and validation are separate files."],
 "done": ["Folder structure agreed and committed",
          "OpenAI client initialised from a secret, never a literal",
          "A local run works with `supabase functions serve`"]},

"Ask: prompt versioning and rollout mechanism": {
 "do": ["prompt_versions table with exactly one active row.",
        "Every ai_runs row records which version answered."],
 "done": ["Switching the active version changes behaviour without a deploy",
          "Every run records its version",
          "Rolling back is one row update"]},

"Ask: conversation context window management and truncation": {
 "do": ["History caps at 20 messages per the contract. Decide what gets dropped and prove it stays coherent."],
 "done": ["Truncation rule written down",
          "A 30-message conversation still gives sensible answers",
          "Token use stays bounded"]},

"Ask: rate limiting, timeout handling and graceful failure": {
 "do": ["15s timeout. On any error the app shows a plain failure state.",
        "It must never fall back to a cached or generated answer."],
 "done": ["A timeout shows a plain message",
          "No fallback answer is ever generated",
          "Rate limiting stops one user exhausting the budget",
          "Failures are logged"]},

"Ask: build the eval question set with Keya": {
 "do": ["Golden set must include symptom questions required to redirect, plus edge cases near the keyword boundaries."],
 "done": ["At least 30 questions with expected behaviour",
          "Symptom cases included and redirecting",
          "Reviewed by both of you"]},

"Ask cost projection at beta scale": {
 "do": ["Measure real token use, project to 20 beta users, then to 1000."],
 "done": ["A per-question cost number",
          "A monthly projection at beta scale",
          "A projection at 1000 users, for the PMs"]},

# ============================================================ PRODUCT

"Confirm retailer links are plain search URLs, not affiliate": {
 "do": ["Confirmed: plain search links, no programme application, no approval wait.",
        "Say out loud that this means no revenue and no click tracking in v1."],
 "done": ["Decision confirmed in writing",
          "The team knows Cart is a convenience feature, not a revenue feature"]},

"Recruit the beta cohort - 10 to 20 first-time parents": {
 "do": ["Start Week 2. Finding and screening real first-time moms takes weeks.",
        "They need an iPhone or Android and a baby under two."],
 "done": ["At least 15 people have said yes, allowing for drop-out",
          "Device mix covers both platforms",
          "They know what they are agreeing to and that it is a student project"]},

"Approve Learn content copy before it ships": {
 "do": ["Read it as a tired parent would. Check every card carries a source label."],
 "done": ["Every item read and approved or sent back",
          "Every card has a source",
          "Nothing reads as medical instruction"]},

"Publish privacy policy and Terms of Service": {
 "do": ["Hard gate on the beta. We cannot put infant health data in a product with no privacy policy.",
        "Must state what we collect, why, how long we keep it, and how to delete it.",
        "Must match the app store privacy declarations exactly."],
 "done": ["Both published and reachable from inside the app",
          "Retention and deletion stated plainly",
          "Consistent with the store declarations",
          "Reviewed alongside Katrina's legal answer"]},
}
