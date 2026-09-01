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

"Finish repo setup: keep CODEOWNERS handles current": {
 "do": ["Done 29 Aug: the branch ruleset covers main with 1 approving review, three required checks, no force pushes, no deletions.",
        "Done 29 Aug: .github/CODEOWNERS carries real handles instead of placeholders.",
        "Done 3 Sep: deleted the develop branch instead of syncing it. It predated the monorepo restructure and had no apps/web, so anything branched from it failed the Vercel preview build. It cost Shaff Had a morning and made Sivathmika's first PR go red for a reason unrelated to her code. We are trunk-based on main.",
        "Left to do: strip refs/heads/develop out of the ruleset target so it stops pointing at a branch that no longer exists, and rename the ruleset to match.",
        "Left to do: re-check each CODEOWNERS handle as people accept their invites. A handle that is not a repo collaborator is silently ignored by GitHub, which is how we ended up with a CODEOWNERS file that did nothing at all for the first week."],
 "done": ["The ruleset targets only refs/heads/main",
          "Every handle in CODEOWNERS belongs to an actual repo collaborator",
          "A test PR shows the CODEOWNERS reviewer being requested automatically"],
 "note": "The lesson worth keeping: a protection rule that names people who are not collaborators looks like it is working and is not. Check it with a real PR, not by reading the file."},

"Create Supabase project, apply migration 0001, verify RLS": {
 "do": ["Create it inside the bumptobloom organization, NOT a personal account. Project name bumptobloom-dev, region East US (North Virginia) us-east-1, which matches Vercel default iad1 so the database sits next to the code querying it. Free plan for now.",
        "Apply supabase/migrations/0001_init.sql.",
        "Create two test accounts, each with one baby, and prove they cannot see each other.",
        "Post the project URL and anon key somewhere the team can find them - a pinned message is fine. They are NOT secrets: the anon key is designed to ship to the browser, and .env.example already says so. RLS is what protects the data, which is exactly why the week 2 RLS test suite is Critical.",
        "The database password and the service_role key are the real secrets. service_role bypasses RLS completely. It goes into Vercel environment variables and nowhere else - not Discord, not a DM, not the repo."],
 "done": ["All 19 tables exist",
          "Signed in as account A, selecting from `babies` returns exactly one row",
          "Same check passes for baby_milestones, fever_checks, saved_content and ai_conversations",
          "Selecting from prompt_versions or audit_events with the anon key returns nothing",
          "URL and anon key are posted where the team can find them, and .env.example still has no real values",
          "The service_role key exists only in Vercel env vars, and nothing that should be server-side is prefixed NEXT_PUBLIC_"],
 "note": "This blocks almost every other engineering task. If one thing lands first, make it this."},

"Freeze API contracts with all pod leads": {
 "do": ["Walk docs/API-CONTRACTS.md with Joanna, Shaff Had and Sivathmika.",
        "Fix anything wrong now — after this it needs a PR.",
        "Say clearly in Discord that it is frozen and what that means."],
 "done": ["Every pod lead has read it and said yes",
          "Corrections are merged",
          "The team knows changes now go through a PR with two lead approvals"]},

"Send design the five change requests": {
 "do": ["One sitting with Syeda, five items, in this order of importance.",
        "5) FEVER ARTICLE, do this one first. A 2-month-old at 101.4F is an emergency room visit and our current screen opens with 'usually manageable at home, try a sponge bath'. Ask for three result screens - monitor, call your doctor, go now - with severity descending on each. The emergency one is the priority.",
        "1) ONBOARDING becomes a date picker, not a month slider. Send her ADR-004: we store the birthday and calculate age from it, which answers her open question about days vs weeks vs months. Ask for the new onboarding screen and the Change-age modal.",
        "2) PREGNANCY is out of MVP. Every 'Week 24' screen has no v1 implementation and she should know before she polishes any of them. Ask for one coming-soon screen behind 'I am expecting', with an email capture.",
        "3) TRACK is missing the Social/Emotional domain. The counter says '0 of 9' but only six checkboxes render. Should-have, not a blocker.",
        "4) TRACK has no disclaimer. The approved copy is already in the Master sheet so she does not need to write it. Every checklist view, non-dismissible, visible without scrolling."],
 "done": ["Three fever result screens exist in the Figma and the emergency one has no green and no home-care advice above the fold",
          "The fever article reorders so emergency guidance comes first",
          "New onboarding screen is in the Figma and the Month-8 slider and Change-age modal are both updated",
          "A coming-soon screen exists and the 'I am expecting' button is wired to it",
          "Either the fourth Track domain is added or the counter is corrected",
          "The Track disclaimer is on the screen, visible without scrolling, with no dismiss control"],
 "note": "The fever article is the highest-severity design item on the board. If Syeda only does one of the five, it is that one."},

"Ratify naming + nav order": {
 "do": ["Pick one name for the commerce tab. It currently has five across our documents.",
        "Proposal: Cart in the UI, `act` in code and routes.",
        "Confirm nav order: Home, Track, Learn, Ask, Health, Cart."],
 "done": ["One name chosen and announced",
          "Nav order confirmed",
          "Design and engineering both told"]},

"Supabase client + Auth: log in, create account, forgot password": {
 "do": ["FIRST, and tell the channel when it lands: the shared Supabase client. There is no @supabase/ssr in apps/web today - the scaffold that merged in PR #113 never wired it. Sivathmika, Sahasra, Rasheed and Shaff Had all import this in week 2.",
        "Use `@supabase/ssr` so the session lives in cookies and Server Components can read it. Not localStorage - a Server Component cannot see localStorage.",
        "Client goes in `src/lib/supabase/`, reading NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY. Never SUPABASE_SECRET_KEY - that one bypasses RLS.",
        "THEN the three pages matching the Figma: log in, create account, forgot password.",
        "Middleware routes signed-in users to Home and signed-out users to log in."],
 "done": ["Another pod can import the client and run one query against Supabase",
          "Create account, log out, log in again all work in a browser",
          "Closing the tab and reopening the app keeps you signed in",
          "Forgot-password sends an email and the link works",
          "Wrong password shows a readable message, not a raw error",
          "A parent_profiles row is created on signup",
          "No secret in the repo, and nothing server-side hiding behind a NEXT_PUBLIC_ name"],
 "note": "Highest-leverage task in week 1. Four people's week 2 starts the day your client lands, so ship that half first even if the screens trail it."},

"Service worker with Serwist: cache the app shell, make the app installable": {
 "do": ["`src/app/manifest.ts` already exists from Melvin's scaffold. Read it, do not rewrite it.",
        "Add `@serwist/next` and register a service worker. Precache the app shell only.",
        "Do NOT cache Supabase API responses yet. Your own week 5 offline task decides what gets cached, and caching health data by accident is a decision, not a default.",
        "Placeholder icons are fine. Joanna replaces them in week 6.",
        "Test on a real Android phone (Chrome offers an install prompt) and a real iPhone (Share then Add to Home Screen - there is no prompt on iOS, that is expected, not a bug)."],
 "done": ["Chrome DevTools, Application, Manifest shows no errors",
          "A service worker is registered and shows as activated",
          "Installed on Android, opens with no browser address bar",
          "Added to the home screen on iPhone, opens full screen with our icon",
          "Lighthouse installability checks all pass"],
 "note": "This is the task that makes ADR-006 true. Without it we shipped a website. It needs nothing from anyone else, so it is safe to start on day one."},

"Draft the Home and Learn data-layer signatures for the contract freeze": {
 "do": ["Write function names and return shapes, not implementations. TypeScript types in a file, or a comment block in docs/API-CONTRACTS.md - either is fine.",
        "Cover getHome() for week 2 and the Learn fetch, save and unsave calls for week 3.",
        "For each one, say what a screen gets back. Pages never see raw table rows.",
        "Send it to Sonakshi before Friday's freeze."],
 "done": ["Every function you own in weeks 2 and 3 has a name and a return shape written down",
          "It is in docs/API-CONTRACTS.md before the Friday freeze",
          "Melvin can build the Home screen against your shape without your code existing yet"],
 "note": "This is week 1 work because Pod E builds screens against these shapes before you write the code. Getting the shape agreed now is worth more than starting the implementation early."},

"Extract design tokens from Figma into the Tailwind theme": {
 "do": ["Pull colours, font sizes, spacing and radii out of the Figma into one file.",
        "Do NOT wait for the app scaffold — write them as CSS custom properties now and wire them into the Tailwind theme later.",
        "Name them by role (background, surface, textPrimary), not by appearance (cream, green)."],
 "done": ["One file holds every colour, font size and spacing value",
          "Names describe role, not colour",
          "Both fonts are loaded via next/font and render without a flash of fallback text",
          "No hardcoded hex anywhere else in the app"],
 "note": "Can start immediately — it only needs Figma."},

"Build the bottom tab navigation for all five tabs": {
 "do": ["Six tabs: Home, Track, Learn, Ask, Health, Cart. Route folder for Cart is `act`.",
        "Use a route group with a shared layout so the tab bar persists across navigations.",
        "Each tab gets a placeholder page with its name.",
        "Order is Home, Learn, Ask, Track, Health. Product confirmed this as final on 1 Sep.",
        "Five tabs, not six. Cart is gone as a tab - shopping is a Recommended for You card on Home now.",
        "The Figma still shows the old six-tab order. Build to this list, not to the mock, and tell design the mock needs updating."],
 "done": ["All five tabs render and navigate on a phone and on a laptop",
          "Labels are readable at 390px wide",
          "The active tab is visually obvious",
          "The tab bar does not jump when the page below it changes height",
          "Icons match the Figma"]},

"Responsive shell: phone-width column on desktop, full-bleed on mobile": {
 "do": ["One layout component that every page renders inside. `max-w-[430px] mx-auto min-h-dvh`.",
        "Pin the tab bar to the bottom of that column, not the browser window — on a laptop it should sit inside the phone frame, not stretch across the screen.",
        "On a phone the column just fills the screen, so nothing special is needed there.",
        "Use `dvh`, not `vh` — mobile Safari's address bar makes `vh` wrong by about 60px and it is the classic cause of a tab bar hidden under the browser chrome.",
        "Respect the safe area insets (`env(safe-area-inset-bottom)`) so the tab bar clears the iPhone home indicator."],
 "done": ["At 1440px the app is a centred phone-shaped column",
          "At 390px it is full-bleed with no horizontal scrollbar",
          "The tab bar is visible and tappable in mobile Safari with the address bar showing",
          "Nothing is cut off by the iPhone home indicator",
          "No page sets its own max width — they all inherit this one"],
 "note": "Build this before anyone builds a real page, or every page gets its own slightly different width."},

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

"Scaffold the Ask API route and deploy a stub": {
 "do": ["`apps/web/src/app/api/ask/route.ts`, a POST handler.",
        "Read the Supabase session from cookies and reject an unauthenticated request with 401. Do not trust a user id sent in the body.",
        "Return a hardcoded string for now.",
        "Confirm the client can call it from a preview deploy, not just localhost."],
 "done": ["POST /api/ask returns a response on a Vercel preview URL",
          "An unauthenticated request gets 401",
          "The route reads `process.env.OPENAI_API_KEY` — never `NEXT_PUBLIC_` anything",
          "The key is set in Vercel env vars and is not in the repo",
          "Confirmed in DevTools that the key does not appear anywhere in the client bundle"],
 "note": "Needs Keya's Supabase project first."},

"Set up the Vercel project, preview deploys and environment variables": {
 "do": ["Connect the repo to Vercel. Root directory `apps/web`.",
        "Confirm every pull request gets its own preview URL and that the URL is posted on the PR automatically.",
        "Set the env vars in three scopes: `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` everywhere; `OPENAI_API_KEY` and `SUPABASE_SECRET_KEY` as server-side only.",
        "Give the whole team read access to the project so anyone can see build logs.",
        "Write the steps into `docs/ONBOARDING.md` — everyone will need this."],
 "done": ["A PR produces a working preview URL",
          "`main` deploys to a stable production URL",
          "Server-side keys are set in Vercel and are in no file in the repo",
          "Someone other than you has opened a build log",
          "Free-tier usage limits are noted somewhere, so nobody is surprised in Week 6"],
 "note": "Preview URLs are how design and the PMs review work without cloning anything. Worth getting right in Week 1."},

"Half-day Next.js App Router ramp-up for anyone new to it": {
 "do": ["Cover the one thing that actually bites: Server Components run on the server and may read secrets; Client Components ship to the browser and may not. `\"use client\"` is the line between them.",
        "Show what `NEXT_PUBLIC_` really means — open DevTools, find the value in the bundle, so everyone has seen it with their own eyes.",
        "Cover Server Actions vs route handlers, and when data fetching belongs on the server.",
        "Record it — three timezones will miss it live."],
 "done": ["Session held and recorded",
          "Recording posted in the group",
          "Everyone who attended has the app running locally",
          "Everyone can say which of their own components are server and which are client"]},

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
        "Clone, `npm install`, `npm run dev`, get the app running locally."],
 "done": ["You have read all three",
          "The app runs on your machine",
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
 "do": ["Write it in apps/web/src/lib/api/. Pages never query Supabase directly.",
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

"Rewrite the triage guard response now that Health is a log": {
 "do": ["Read the current behaviour first: shouldRedirectToHealth() in packages/shared catches symptom-shaped questions before the model is called, and the UI then points the parent at the Health tab.",
        "That was right when Health gave triage advice. Health is now a temperature log with no guidance, so the redirect would land a frightened parent on a blank data-entry form.",
        "Replace the destination, not the detection. The keyword and classifier logic stays exactly as it is, and Rehaan's labelled evaluation set is still valid.",
        "New response is a plain refusal plus a route to real help: we cannot answer questions about symptoms, please contact your doctor or care team, and if this is an emergency call 911. No thresholds, no reassurance, no 'it is probably fine'.",
        "Write the exact copy into docs/SAFETY.md so it is reviewable in one place rather than buried in a component."],
 "done": ["A symptom question never reaches the model",
          "The response contains no triage, no thresholds and no reassurance",
          "911 is reachable in one tap from that response",
          "The 15 triage-guard tests still pass, and there is a new test asserting the response is the refusal and not a Health redirect",
          "The copy is in docs/SAFETY.md"],
 "note": "This is a safety behaviour changing because Product changed what Health is. It is small but it is Critical, because the failure mode is a scared parent being handed a form instead of an answer."},

"Final MVP walkthrough": {
 "do": ["One end-to-end pass through the whole product on a real phone, not a laptop browser at 390px.",
        "PMs and designers in the room. The first time anyone outside engineering sees it joined up must not be the demo.",
        "Walk all five tabs in the order a real mother would: sign up, add a baby, look at Home, check a milestone, read something in Learn, ask a question, log a temperature.",
        "Write down everything that breaks or feels wrong, triage it the same day, and be honest about what will not get fixed before the demo."],
 "done": ["The full flow has been walked on a real phone with Product watching",
          "Every problem found is written down and triaged, not just discussed",
          "We have agreed what is knowingly shipping broken"],
 "note": "Requested by Katrina on 1 Sep. Schedule it early enough in week 6 that there is time to act on what it finds."},

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
        "Compare row IDENTITY, not just row count. A count-based check cannot detect a reversed policy: with `!=` instead of `=`, A would see exactly one row and B would see exactly one row, and every count assertion would still pass while each parent read the other's baby. Assert the returned id equals the expected id.",
        "Run it in CI, not by hand."],
 "done": ["Every private table covered: parent_profiles, babies, baby_milestones, baby_activities, saved_content, fever_checks, ai_conversations, ai_messages, ai_runs",
          "Deliberately breaking a policy makes the suite fail - demonstrate it, do not assume it",
          "Reversing a policy (`=` to `!=`) makes the suite fail, not just dropping one",
          "It runs in CI on every PR",
          "prompt_versions and audit_events return nothing to a client"],
 "note": "The anon key ships to the browser, so a determined user can call Supabase directly with it and skip our Server Actions entirely. RLS is the ENTIRE access-control layer - going through our own server code is a convenience, not a boundary."},

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

"E2E test: onboarding -> home -> track, with Playwright": {
 "do": ["Playwright, running in a mobile viewport (390x844), not desktop.",
        "Point it at a Vercel preview URL in CI, not localhost — that is what catches deploy-only failures.",
        "Use a dedicated test account, not anyone's real one."],
 "done": ["Signup through to marking a milestone passes end to end",
          "Runs in CI on every PR",
          "The test account's data does not leak into anyone else's view",
          "Documented so someone else can run it locally"]},

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
 "do": ["In the `/api/ask` route handler only. Key from `process.env.OPENAI_API_KEY`, never the client.",
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

"Ask: conversation persistence and history queries": {
 "do": ["History reads straight from Supabase with RLS. No API route needed for that half."],
 "done": ["Conversations persist across a reload and a fresh session",
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

"Wire Sentry for Next.js, with source maps uploaded on deploy": {
 "do": ["`@sentry/nextjs`. Source maps matter — without them a browser error is unreadable minified soup.",
        "Cover both client-side and server-side (route handler) errors.",
        "Set it up now, not after the first crash."],
 "done": ["A deliberate test error appears in Sentry with readable line numbers",
          "A route handler error is captured too, not only a client one",
          "No personal or health data in error payloads",
          "The Sentry DSN is the only Sentry value in the client bundle"]},

"Browser pass: iOS Safari, Android Chrome, desktop Chrome, one old phone": {
 "do": ["iOS Safari is the one that breaks. It is the strictest about service workers, `vh` is wrong there because of the address bar, and there is no install prompt — it is Share -> Add to Home Screen.",
        "Test both in the browser tab AND in the installed app. They behave differently: the installed app has no back button.",
        "Our users are often on whatever phone they already had, so include something cheap and three years old."],
 "done": ["Every page checked in iOS Safari, Android Chrome and desktop Chrome",
          "Checked once installed, not only in a browser tab",
          "Navigating back works in the installed app, where there is no browser back button",
          "Nothing is cut off at 390px, and nothing is cut off by the iPhone home indicator",
          "Usable on the slow device — no frozen taps",
          "Issues filed with screenshots"]},

"Offline pass: cache the app shell, fever checker works with no network": {
 "do": ["Configure the service worker to precache the app shell and the Health route.",
        "Decide explicitly what is NOT cached: Supabase reads and the Ask route should fail cleanly offline rather than serve stale data. Stale milestone data is confusing; a stale AI answer is worse.",
        "Show a plain 'you are offline' state on the pages that need the network. Never a blank page.",
        "The fever engine is already pure TypeScript with no I/O, so it works offline for free — this task is proving it, and making sure logging failure never blocks the answer.",
        "Test the real way: install the app, turn on airplane mode, force-quit, reopen."],
 "done": ["Airplane mode: the installed app opens, no browser error page",
          "A full fever check runs offline and returns the right tier",
          "The 911 banner and the disclaimer still render offline",
          "Supabase logging fails silently — the parent sees the answer, never an error",
          "The check is written to Supabase when the network comes back, or is dropped deliberately and that choice is written down",
          "Network-dependent pages show an offline state, not a blank screen"],
 "note": "This is the claim we make in the demo, so it has to be literally true. Test it on a real phone in airplane mode, not with DevTools' offline checkbox."},

"Accessibility pass: VoiceOver, TalkBack, keyboard nav, 200% zoom": {
 "do": ["Our users are sleep-deprived and often in low light at 3am. This matters more here than on a normal product.",
        "Every interactive element needs an accessible name. Every image needs alt text.",
        "Keyboard navigation is new versus the mobile plan and is not optional on the web: tab through every page, and make sure focus is visible and never trapped.",
        "Test at 200% browser zoom and at the largest system text size."],
 "done": ["Every button and input has an accessible name",
          "The app is usable end to end with VoiceOver and with TalkBack",
          "Every page is reachable and operable with the keyboard alone, with a visible focus ring",
          "Nothing overlaps or truncates at 200% zoom",
          "Contrast checked on every page",
          "axe or Lighthouse accessibility scan is clean"]},

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

"Full E2E suite green across all five tabs": {
 "do": ["Every tab, in a mobile viewport, against a Vercel preview URL."],
 "done": ["All five tabs covered",
          "Green in CI on every PR",
          "Runs against a preview deploy, not localhost",
          "Documented well enough for anyone to run it locally"]},

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

"Performance: Lighthouse 90+, first load under 3s on throttled 4G": {
 "do": ["Run Lighthouse in mobile mode against the production URL, throttled. Not on campus wifi.",
        "Lighthouse also audits the PWA install requirements, so this proves installability at the same time — check that section too.",
        "The usual wins: `next/image` for every image, `next/font` for both fonts, and no unnecessary `\"use client\"` at the top of a page."],
 "done": ["Lighthouse performance 90 or better on mobile",
          "First load under 3s on throttled 4G",
          "No layout shift as fonts and images load",
          "The installability audit passes",
          "Measured and written down, not eyeballed"]},

"Beta with 10-20 real first-time parents": {
 "do": ["Send them the production URL with one page of instructions on adding it to the home screen — the iPhone steps are different from Android and are not obvious.",
        "Give them a way to report problems that is not 'message us on Discord'."],
 "done": ["At least 10 parents have it installed on their home screen",
          "A feedback route exists and people have used it",
          "Feedback collected somewhere the team can read"]},

"Bug triage and fixes from beta": {
 "do": ["Triage daily. Anything in Health jumps the queue."],
 "done": ["Every report has a decision: fixing, not fixing, or after launch",
          "Health issues fixed first",
          "Nothing safety-related left open"]},

"Deploy to production on Vercel and smoke test the install flow": {
 "do": ["Merge to `main`. It is live in about 40 seconds — no review queue, no store account.",
        "Point it at production Supabase with RLS on, and confirm the env vars are set for the production scope specifically, not only preview.",
        "Smoke test the install on a phone that has never opened the app: iPhone via Share -> Add to Home Screen, Android via the install prompt.",
        "Walk all six tabs on the installed app, not in a browser tab."],
 "done": ["The production URL loads for someone outside the team",
          "Installs cleanly on an iPhone and on an Android",
          "All six tabs work in the installed app",
          "Points at production Supabase with RLS on",
          "A second person has done the install from scratch"]},

"PWA icons, splash screens and install metadata": {
 "do": ["Maskable icons at 192 and 512, plus an Apple touch icon — iOS ignores the manifest icons and uses `apple-touch-icon` instead.",
        "A `short_name` short enough to fit under a home screen icon without an ellipsis.",
        "Theme colour and background colour, so the splash and status bar match the app instead of flashing white.",
        "Replaces the placeholders Melvin put in during Week 1."],
 "done": ["The installed icon looks right on an iPhone and on an Android home screen",
          "The name is not truncated under the icon",
          "No white flash on launch — the background colour matches",
          "Icons are maskable and are not cropped awkwardly on Android",
          "Chrome DevTools shows no manifest warnings"]},

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
        "Must match what the app actually collects — Katrina's legal answer is what it has to be consistent with."],
 "done": ["Both published and reachable from inside the app",
          "Retention and deletion stated plainly",
          "Consistent with Katrina's legal review",
          "Reviewed alongside Katrina's legal answer"]},

# ============================================================ DATA SCIENCE
# The four people whose roster Role carries DS: Natasha, Keya, Rehaan, Sonakshi.
# There is no model training here — six weeks, no users, no training data.
# The data science on this project is measurement, data quality and evaluation.

"DATA: Milestone dataset schema, validation rules and data dictionary": {
 "do": ["Decide the columns before filling any more rows: age_months, domain, text, source_label, source_url, and whichever else you need.",
        "Write the validation rules down as rules, not as vibes. Age must be one of the nine checkpoints. Domain must be one of the four. source_url must be non-empty and must resolve.",
        "Write a one-page data dictionary: what each column means and what a valid value looks like.",
        "Ship a small validation script that reads the dataset and fails loudly on a bad row — the seed task in Week 2 should run it."],
 "done": ["Schema written down and agreed with whoever writes the SQL seed",
          "A validation script exists and currently passes",
          "A deliberately broken row makes it fail — you tested the test",
          "Data dictionary is in the repo, not in a chat message",
          "The rule 'no row without a working source URL' is enforced by the script, not by memory"],
 "note": "Do this before extracting more. Filling 36 cells and then discovering half have no source is the failure this prevents."},

"DATA: Label a triage-guard evaluation set - 200 questions, two raters": {
 "do": ["Collect ~200 realistic questions a first-time mom would type. Half ordinary parenting, half symptom-shaped, and deliberately include the hard middle — 'she's been really fussy since her shots' is genuinely ambiguous.",
        "You and one other person label each one independently: symptom / not symptom. Do NOT label together — the disagreements are the useful part.",
        "Measure how often you agreed. If two humans only agree 70% of the time, no keyword list is going to hit 95%, and that is worth knowing before you spend a week tuning one.",
        "Resolve every disagreement and record why. Those cases become the interesting tests.",
        "Store it as a versioned file in the repo, not a spreadsheet in someone's Drive."],
 "done": ["200 labelled questions committed to the repo",
          "Two independent raters, agreement rate calculated and written down",
          "Every disagreement resolved with a one-line reason",
          "The ambiguous middle is represented, not just the easy cases",
          "No real user data — these are written by us, not taken from anyone"],
 "note": "This blocks the Week 4 measurement task. It is also the only labelled dataset this project will have, so it is worth doing properly once."},

"DATA: Analyse the mom interview data against our feature priorities": {
 "do": ["The Interview Data folder in the shared Drive already exists and engineering has never opened it.",
        "Code the transcripts for themes — what moms said they needed, what frustrated them, what they already use.",
        "Put the themes next to the Master sheet's Must / Should / Could split and look for disagreement.",
        "Report the disagreements specifically. 'The interviews support the plan' is a much weaker finding than 'four of six moms raised sleep and it is a Should have'."],
 "done": ["Every interview read and coded",
          "Themes ranked by how often they came up",
          "An explicit list of places the interviews and the Master sheet disagree",
          "Shared with engineering, not only with the PM group",
          "No participant names or identifying details copied into the repo"],
 "note": "Week 1 on purpose. If this changes a priority, we want to know before the thing is built."},

"DATA: Content coverage matrix - which age x category cells are empty": {
 "do": ["Nine age checkpoints across four Learn categories is 36 cells.",
        "Count what exists in each. Produce the grid, with counts, as a committed file.",
        "Flag the zeros and the ones — a 4-month-old whose Sleep category is empty gets an empty tab, and that is what a demo reviewer will click on.",
        "Hand the gaps to whoever is writing content, ranked by how likely that age is to be demoed."],
 "done": ["The 36-cell grid exists with real counts",
          "Empty and near-empty cells are listed explicitly",
          "Gaps handed to the content owner with a priority order",
          "Re-runnable as a script, because the counts change every week"]},

"DATA: Define the analytics question set and event schema": {
 "do": ["Write the questions FIRST, before any event is designed. Where do moms drop out of onboarding? Which tab do they open second? How many fever checks end in EMERGENCY? How many Ask questions get redirected to Health?",
        "For each question, name the events and properties that answer it.",
        "Name events consistently — pick a convention like `noun_verb` and stick to it.",
        "Hand the finished schema to Melvin before he wires PostHog in Week 4."],
 "done": ["A written list of questions we need answered",
          "An event schema that answers each one, reviewed by whoever will implement it",
          "Naming convention written down",
          "NO health or symptom content in any event property — the tier is fine, the free text is not",
          "Health events flagged as excluded from any ad-targeting integration"],
 "note": "Events designed without questions produce dashboards nobody can read. This is the cheap step that prevents that."},

"DATA: Ask golden set and a written scoring rubric": {
 "do": ["A golden question set is only half of it. The other half is a rubric specific enough that you and Rehaan score the same answer the same way.",
        "Rubric dimensions worth having: is it accurate, is it age-appropriate, does it stay out of medical advice, does it sound like a person.",
        "Score a handful together first to calibrate, then split the rest.",
        "Include the questions that MUST redirect to Health — a correct redirect is a pass, a helpful medical answer is a failure."],
 "done": ["Golden set committed, with the expected behaviour for each question",
          "A written rubric with a defined scale, not 'good / bad'",
          "You and one other person scored the same 10 answers and compared",
          "The harness runs and reports a score per dimension",
          "A prompt change can be compared before and after, numerically"],
 "note": "Your roster lists AI Evaluation, so this one is yours by right. Without a rubric, 'the prompt got better' is a feeling."},

"DATA: Fever rules evidence pack for the clinical reviewer": {
 "do": ["The clinician is the longest-lead item on the project. Make their job small.",
        "Generate every (age band x temperature x method) combination and what we output for it, with the rule id beside each row.",
        "Group it so the reviewer reads structure, not 400 rows: the under-3-months block first, then the thresholds.",
        "State the method normalisation explicitly — an axillary reading runs about 1F low, and that offset is the single thing most worth a doctor's eye.",
        "Include what we deliberately do NOT do: no medication, no dosing, no diagnosis."],
 "done": ["Every combination generated, nothing hand-picked",
          "Rule id shown for each outcome so a disagreement is traceable to a line of code",
          "The method offsets are called out on their own page",
          "RULES_VERSION stamped on the document",
          "Sent to the reviewer with a specific question, not just 'please review'"],
 "note": "A doctor can sign a table. Nobody can sign 400 lines of TypeScript."},

"DATA: Measure triage guard precision and recall, write down the trade-off": {
 "do": ["Score the guard against the labelled set from Week 1. Report precision, recall and a confusion matrix.",
        "Then write down, in the repo, the decision: we optimise for RECALL. Missing a symptom question is a safety incident. Sending someone to the Fever Checker unnecessarily costs one tap.",
        "Review every false negative individually — each one is a phrasing we did not think of, and it should become a test case.",
        "Tune, re-measure, and report the before and after. Never tune against a number you did not write down first."],
 "done": ["Precision, recall and confusion matrix reported on the labelled set",
          "The recall-over-precision decision is written in docs/SAFETY.md, with the reasoning",
          "Every false negative reviewed and added as a test case",
          "Before and after numbers both recorded — no silent tuning",
          "All 15 existing guard tests still pass",
          "Ordinary parenting questions still get answered — check the false positive rate did not explode",
          "Verified in logs that no model call happens on a redirect"],
 "note": "This is a safety component. Read docs/SAFETY.md before you touch it."},

"DATA: Does retrieved Learn content improve Ask answers? Run the experiment": {
 "do": ["TIMEBOXED. A negative result is a success and you should be willing to reach it by Wednesday.",
        "Two arms on the same golden set: plain age-context, versus age-context plus retrieved Learn articles.",
        "Score both with Keya's rubric. Same scorer, blind to which arm produced which answer if you can manage it.",
        "If retrieval does not measurably help, write that down and we ship the simple thing."],
 "done": ["Both arms scored on the same golden set with the same rubric",
          "The result is written down whichever way it went",
          "If it helps: a recommendation with the cost and latency impact stated",
          "If it does not: an explicit 'we are not adding a vector store for v1' in docs/DECISIONS.md",
          "No extra dependency merged to main on the strength of a hunch"],
 "note": "This is the one place RAG could earn its keep on this project. Proving it does not is worth as much as proving it does, and costs a lot less."},

"DATA: Source coverage audit - every content row has a real citation": {
 "do": ["Walk every milestone row and every Learn row. Confirm the source label points at something real and still live.",
        "Ship it as a script that checks the URLs, so this is re-runnable rather than a one-off read-through.",
        "Check the label matches the link — a row citing the CDC that links to a blog is worse than one with no source at all."],
 "done": ["Every row has a source label and a URL",
          "Every URL resolves — checked by script, not by eye",
          "Label and link agree on every row",
          "The script runs in CI or is documented so anyone can run it",
          "Broken ones fixed or the row pulled"],
 "note": "A dead CDC link on a milestone card is exactly the kind of thing a reviewer clicks during a demo."},

"DATA: Beta analysis - funnel, drop-off, and what parents actually asked": {
 "do": ["Not 'read the Discord messages'. Build the funnel: opened, signed up, created a baby profile, opened a second tab, came back a second day.",
        "Where did people stop? Which tabs went unopened entirely?",
        "What did they type into Ask, and how many got redirected to Health?",
        "Which fever tiers fired, and did anyone hit EMERGENCY?",
        "Pair the numbers with two or three verbatim quotes. The number says what happened, the quote says why."],
 "done": ["Funnel built with real counts at every step",
          "Drop-off points identified and ranked",
          "Ask questions themed, with the redirect rate reported",
          "Fever tier distribution reported",
          "Findings written up somewhere the whole team can read before the demo",
          "No participant names or contact details in the write-up"],
 "note": "This is the only real usage data the project will have before 6 October. It is also the strongest slide in the demo."},

}