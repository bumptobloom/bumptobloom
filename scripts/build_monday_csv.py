#!/usr/bin/env python3
"""Generate the Monday.com import CSV for the 6-week BumpToBloom MVP."""

import csv
from datetime import date, timedelta

START = date(2026, 8, 25)  # Week 1, Monday-equivalent kickoff

WEEKS = {
    1: "Week 1 (Aug 25-31) - Foundation & Unblocking",
    2: "Week 2 (Sep 1-7) - Home & Track",
    3: "Week 3 (Sep 8-14) - Learn & Fever Rules",
    4: "Week 4 (Sep 15-21) - Cart & Ask",
    5: "Week 5 (Sep 22-28) - Health UI & Polish",
    6: "Week 6 (Sep 29-Oct 5) - Hardening & Launch",
}


def span(week: int) -> tuple[str, str]:
    s = START + timedelta(days=(week - 1) * 7)
    return s.isoformat(), (s + timedelta(days=6)).isoformat()


# (week, name, owner, pod, priority, notes[, discipline])
# Discipline is a second label, orthogonal to Pod. Pods are timezone groups;
# discipline is what kind of work it is. "Data" marks the data-science
# workstream - the four people whose roster Role carries DS.
T = [
    # ---------------- WEEK 1 ----------------
    (1, "DECISION: Confirm pediatric clinical reviewer for Health content", "Shailee Shah", "Product", "Critical",
     "BLOCKING FOR LAUNCH. We are shipping triage advice to frightened parents; it needs a doctor's sign-off before release. No reviewer is named today. Longest lead time on the project - start day 1, not week 5."),
    (1, "DECISION: Legal review - COPPA / HIPAA / state health-privacy exposure", "Katrina Ma", "Product", "Critical",
     "We are storing infant health data under real accounts and nobody has checked whether we are allowed to. Also covers whether the Fever Checker risks being classified as a medical device."),
    (1, "Create GitHub org + repo, push scaffold, set branch protection", "Sonakshi Panda", "Pod W", "High",
     "Org bumptobloom. Protect main and develop. Require 1 review + green CI. Add CODEOWNERS handles."),
    (1, "Create Supabase project, apply migration 0001, verify RLS", "Keya Chaudhari", "Pod W", "High",
     "US region. Then prove isolation with two real accounts - Mom A must not see Mom B's baby."),
    (1, "Freeze API contracts with all pod leads", "Sonakshi Panda", "Pod W", "High",
     "docs/API-CONTRACTS.md. After this, changing a shape needs a PR. This is what lets 5 timezones work without blocking."),
    (1, "Tell design: onboarding becomes a date picker, not a month slider", "Sonakshi Panda", "Pod W", "High",
     "ADR-004. Answers the designers' open question 'complex level of collecting days/weeks/months data'. Store birth_date, derive age. Also fixes 'kids between months'."),
    (1, "Tell design: pregnancy is out of MVP, need a 'coming soon' screen", "Sonakshi Panda", "Pod W", "High",
     "ADR-002. Roughly a third of current Figma screens (every 'Week 24' one) have no v1 implementation. Design needs to hear this explicitly."),
    (1, "Tell design: Track is missing the Social/Emotional domain", "Sonakshi Panda", "Pod W", "High",
     "Figma shows 3 domains. Counter says '0 of 9' but only 6 checkboxes render - the missing 3 are the absent section. Master sheet lists social-emotional in one row and says 'at least three' in another, so this is a should-have not a blocker."),
    (1, "Tell design: Track has no disclaimer; copy is already approved", "Sonakshi Panda", "Pod W", "High",
     "Exact copy already sits in the Master sheet, approved. Legally the most important screen to have a disclaimer on, and the Figma does not show one."),
    (1, "Tell design: fever article must run severity high-to-low", "Sonakshi Panda", "Pod W", "Critical",
     "Currently leads with a green 'Usually manageable at home' block. An emergency-tier result must never land a parent on home-care advice first."),
    (1, "Ratify naming + nav order", "Katrina Ma", "Product", "Medium",
     "Commerce tab has 5 names across our docs: Cart, Act, Sprout Cart, Bloom Cart, Essentials. Proposal: Cart in the UI, act in code and routes. Nav order Home-Track-Learn-Ask-Health-Cart."),
    (1, "Scaffold the Next.js app: TypeScript, App Router, Tailwind", "Melvin James Bryant III", "Pod E", "Critical",
     "BLOCKS most of week 1. Everyone should be able to clone, run `npm run dev`, and open the app in a browser by Wednesday. Melvin's existing branch is the starting point, not a rebuild."),
    (1, "PWA manifest, icons and service worker - make it installable", "Melvin James Bryant III", "Pod E", "High",
     "NEW with ADR-006. This is the whole difference between a website and an app: manifest.json with name, icons and display:standalone, plus a service worker via Serwist. Until this lands, 'progressive web app' is just a website."),
    (1, "Supabase Auth: log in, create account, forgot password", "Melvin James Bryant III", "Pod E", "High",
     "Matches existing Figma screens 1-2. Master sheet marks login and create-account as Must have."),
    (1, "Extract design tokens from Figma into the Tailwind theme", "Joanna Zhang", "Pod E", "High",
     "Design-change log item 1 was 'fonts are not consistent throughout'. Tokens are how that stops recurring."),
    (1, "Build the bottom tab navigation for all six tabs", "Joanna Zhang", "Pod E", "Medium",
     "Order: Home-Track-Learn-Ask-Health-Cart. Flag: 6 tabs is one more than most phone apps carry comfortably - worth raising with design, not worth blocking on."),
    (1, "Responsive shell: phone-width column on desktop, full-bleed on mobile", "Joanna Zhang", "Pod E", "High",
     "NEW with ADR-006. Product wants it to look like a phone even on a laptop. One layout component every page sits inside - max-w-[430px], centred, with the tab bar pinned to the bottom of that column rather than the browser window. Build it once here so no page has to think about it again."),
    (1, "Baby profile: create + edit, date picker, derived age", "Tarigopula Sivathmika Chowdary", "Pod I", "High",
     "birth_date is the source of truth. Nothing stores 'month 8'. Optional due_date for preterm."),
    (1, "Scaffold the Ask API route and deploy a stub", "Mohd Shaff Had Khan", "Pod I", "High",
     "A Next.js route handler at app/api/ask/route.ts. Returns a hardcoded string this week. It exists because the OpenAI key can NEVER reach the browser - anything in the client bundle is readable in devtools in about five seconds."),
    (1, "Set up the Vercel project, preview deploys and environment variables", "Sonakshi Panda", "Pod W", "High",
     "Every PR should get its own preview URL - that is how design and the PMs review work without cloning anything. Server-side secrets go in Vercel env vars, never in the repo."),
    (1, "Half-day Next.js App Router ramp-up for anyone new to it", "Sonakshi Panda", "Pod W", "High",
     "The gap is not React, it is the App Router: Server Components run on the server and can hold secrets, Client Components ship to the browser and cannot. Getting that wrong is how a key leaks. Do it once, together, rather than eleven people googling separately."),
    (1, "DATA: Milestone dataset schema, validation rules and data dictionary", "Natasha Saini", "Pod E", "High",
     "Comes BEFORE more extraction. Decide the columns, the allowed values, and what makes a row invalid, then fill. Typing 36 cells into a spreadsheet and discovering afterwards that half have no source is the failure mode this prevents.", "Data"),
    (1, "DATA: Label a triage-guard evaluation set - 200 questions, two raters", "Shaikh Mohd Rehaan", "Pod I", "High",
     "shouldRedirectToHealth() is a classifier and we have never measured it. You cannot tune what you cannot score. Two people label independently so we know how much of the disagreement is the guard and how much is us. This blocks the week 4 measurement task.", "Data"),
    (1, "DATA: Analyse the mom interview data against our feature priorities", "Katrina Ma", "Product", "Medium",
     "There is an Interview Data folder in the Drive that engineering has never opened. Real moms already told us what they need. Code the themes and check them against the Master sheet's Must/Should/Could split - if they disagree, we want to know in week 1, not week 6.", "Data"),
    (1, "Begin CDC milestone dataset extraction", "Natasha Saini", "Pod E", "High",
     "cdc.gov/act-early/milestones. All 4 domains x 9 checkpoints (0,2,4,6,9,12,15,18,24)."),
    (1, "Everyone: read DECISIONS + ONBOARDING + SAFETY, get dev env running", "Sonakshi Panda", "All", "High",
     "Six decisions were made before onboarding. Reading them prevents most rework."),

    # ---------------- WEEK 2 ----------------
    (2, "Seed milestones: 4 domains x 9 checkpoints, with sources", "Natasha Saini", "Pod E", "High",
     "Every row needs a source_label. Every card shows where its advice came from - that is what separates this from a forum post."),
    (2, "Milestones data layer: fetch, mark noticed, unmark", "Tarigopula Sivathmika Chowdary", "Pod I", "High",
     "Direct Supabase calls. RLS is the access control - there is no API server to hide behind."),
    (2, "Track screen: checkpoint navigator, 4 domains, progress counter", "Joanna Zhang", "Pod E", "High",
     "Replace the unlabeled 1-6 pagination in the Figma with real checkpoint months."),
    (2, "Render the Track disclaimer on every checklist view", "Joanna Zhang", "Pod E", "Critical",
     "Non-dismissible. Copy is in the Master sheet and in docs/SAFETY.md."),
    (2, "Home data layer: getHome() with Supabase queries", "Sahasra Miriyala", "Pod I", "High",
     "apps/web/src/lib/api/. Pages never see raw table rows."),
    (2, "Home screen: profile card, this-week card, quick actions", "Melvin James Bryant III", "Pod E", "High",
     "Per design-change log: Bloom bar removed, nav at bottom, edit icon on profile card."),
    (2, "Activities: table, seed, data layer", "Sahasra Miriyala", "Pod I", "Medium", ""),
    (2, "DATA: Content coverage matrix - which age x category cells are empty", "Natasha Saini", "Pod E", "High",
     "9 age checkpoints x 4 Learn categories is 36 cells. Some will have ten articles and some will have zero, and nobody currently knows which. The matrix is what tells the writers where to write instead of guessing.", "Data"),
    (2, "DATA: Define the analytics question set and event schema", "Katrina Ma", "Product", "Medium",
     "Do this BEFORE Melvin wires PostHog in week 4. Write the questions first - where do moms drop out of onboarding, which tab do they open second, how many fever checks end in EMERGENCY - then design events that answer them. Events designed without questions produce dashboards nobody can read.", "Data"),
    (2, "Design Ask prompt architecture and baby-context builder", "Keya Chaudhari", "Pod W", "High",
     "Age in months only. No name, no user id, nothing identifying reaches OpenAI. Runs in the API route on the server, never in the browser."),
    (2, "Age derivation utility + tests, including preterm corrected age", "Sonakshi Panda", "Pod W", "High",
     "Server-side only. Clients never compute age and never cache it across days."),
    (2, "RLS isolation test suite: two accounts, every private table", "Keya Chaudhari", "Pod W", "Critical",
     "Automated, runs in CI. RLS IS our entire access-control layer - there is no separate API server to catch a mistake, and anything the browser can call, a determined user can call directly with the anon key."),

    # ---------------- WEEK 3 ----------------
    (3, "Build Learn content dataset: Developmental, Feeding, Sleep, Diaper", "Natasha Saini", "Pod E", "High", ""),
    (3, "Learn data layer: fetch by age and category, save, unsave", "Sahasra Miriyala", "Pod I", "High", ""),
    (3, "Learn screen with category filters and save", "Melvin James Bryant III", "Pod E", "High", ""),
    (3, "Finalise fever rules engine, set RULES_VERSION", "Sonakshi Panda", "Pod W", "Critical",
     "Engine + 33-case test table are already written. This is the review and version pin."),
    (3, "Send fever rules and result copy to clinical reviewer", "Shailee Shah", "Product", "Critical",
     "Deliberately in week 3, not week 5, so review runs in parallel across weeks 4-6 instead of blocking launch. Depends on the week 1 reviewer task."),
    (3, "Wire the fever engine into the app and log results", "Rasheed Adebayo OYEWOLE", "Pod I", "Critical",
     "assessFever() runs IN THE BROWSER so it works offline once the shell is cached - a mom at 2am on bad wifi still gets an answer. Age comes from birth_date fetched at login; the app never asks for one. Logging to Supabase is fire-and-forget: if it fails, the parent already has their answer and must never see an error."),
    (3, "fever_checks logging with rule_id and rules_version", "Rasheed Adebayo OYEWOLE", "Pod I", "High",
     "Without rule_id + version we cannot reconstruct what the app told a parent, or why."),
    (3, "DATA: Ask golden set and a written scoring rubric", "Keya Chaudhari", "Pod W", "High",
     "Your roster lists AI Evaluation, so this is yours. A golden question set is only half of it - the other half is a rubric specific enough that you and Rehaan score the same answer the same way. Without that, 'the prompt got better' is a feeling, not a result.", "Data"),
    (3, "DATA: Fever rules evidence pack for the clinical reviewer", "Sonakshi Panda", "Pod W", "High",
     "The clinician is the longest-lead item on the project, so make their job small. Generate every (age band x temperature x method) cell and what we output for it, as one table with the rule id beside each row. A doctor can sign a table. Nobody can sign 400 lines of TypeScript.", "Data"),
    (3, "E2E test: onboarding -> home -> track, with Playwright", "Melvin James Bryant III", "Pod E", "Medium",
     "Playwright, running against a Vercel preview URL in CI. Mobile viewport, not desktop."),

    # ---------------- WEEK 4 ----------------
    (4, "Build product catalog with a written rationale per product", "Natasha Saini", "Pod E", "High",
     "Every card must say why the product is recommended. A recommendation without a reason is just an advert."),
    (4, "Recommendation rules by age bucket (0-3, 4-8, 9-14, 15-24)", "Rasheed Adebayo OYEWOLE", "Pod I", "Medium", ""),
    (4, "Recommendations data layer + retailer search URLs", "Rasheed Adebayo OYEWOLE", "Pod I", "Medium",
     "Plain search links, no affiliate programme: https://www.amazon.com/s?k=belly+oil - build the URL template per retailer."),
    (4, "Cart screen with retailer links, no checkout, no list total", "Melvin James Bryant III", "Pod E", "High",
     "Design-change log: remove 'Add to List' and all payment steps. Also fixes the truncated '2 it' bug on the list screen."),
    (4, "Ask: OpenAI integration and context builder", "Mohd Shaff Had Khan", "Pod I", "High", ""),
    (4, "Ask: Zod response validation + ai_runs logging", "Shaikh Mohd Rehaan", "Pod I", "High", ""),
    (4, "DATA: Measure triage guard precision and recall, write down the trade-off", "Shaikh Mohd Rehaan", "Pod I", "Critical",
     "Score the guard against the labelled set from week 1 and publish a confusion matrix. Then write down, in the repo, that we optimise for RECALL and accept the false positives - missing a symptom question is a safety incident, sending someone to the Fever Checker unnecessarily costs one tap. Every false negative gets reviewed individually.", "Data"),
    (4, "Ask: conversation persistence and history queries", "Tarigopula Sivathmika Chowdary", "Pod I", "High",
     "History reads straight from Supabase with RLS - no API route needed for that half."),
    (4, "Ask chat screen with standing disclaimer", "Tarigopula Sivathmika Chowdary", "Pod I", "High",
     "Keyboard handling on a phone is the fiddly part - test with the keyboard open on a small screen."),
    (4, "Wire PostHog events per tech-stack doc section 15", "Melvin James Bryant III", "Pod E", "Medium",
     "Health events excluded from any ad-targeting integration."),

    # ---------------- WEEK 5 ----------------
    (5, "Fever Checker screen: auto age, method selector, red-flag list", "Joanna Zhang", "Pod E", "Critical",
     "Method selector is new vs the Figma and it matters - an axillary reading runs ~1F low, so 99.5 armpit in a 2-month-old is an emergency."),
    (5, "Three fever result screens, severity high-to-low", "Joanna Zhang", "Pod E", "Critical",
     "HOME / CALL / EMERGENCY. The emergency screen is the one worth demoing - it shows the safety story."),
    (5, "Persistent 911 banner above the fold on every Health screen", "Joanna Zhang", "Pod E", "Critical", ""),
    (5, "Apply clinical reviewer feedback to rules and copy", "Sonakshi Panda", "Pod W", "Critical",
     "Bump RULES_VERSION. Update the test table in the same PR."),
    (5, "Ask conversation history and sidebar", "Tarigopula Sivathmika Chowdary", "Pod I", "Medium",
     "Master sheet asked for this: 'save the history on the left navigation as ChatGPT'."),
    (5, "Wire Sentry for Next.js, with source maps uploaded on deploy", "Melvin James Bryant III", "Pod E", "Medium",
     "Without source maps a browser error is unreadable minified soup. Set them up now, not after the first crash."),
    (5, "Browser pass: iOS Safari, Android Chrome, desktop Chrome, one old phone", "Sahasra Miriyala", "Pod I", "High",
     "iOS Safari is the one that breaks - it is the strictest about service workers and the install flow is Share -> Add to Home Screen, not a prompt. Our users are often on whatever phone they already had, so include something cheap and three years old."),
    (5, "Offline pass: cache the app shell, fever checker works with no network", "Rasheed Adebayo OYEWOLE", "Pod I", "High",
     "NEW with ADR-006. This is the claim we make in the demo, so it has to be true: airplane mode on, open the installed app, run a fever check, get an answer. The service worker caches the shell; the rules are pure TypeScript with no I/O. Logging fails silently and the parent never sees an error."),
    (5, "Accessibility pass: VoiceOver, TalkBack, keyboard nav, 200% zoom", "Sahasra Miriyala", "Pod I", "Medium",
     "Our users are sleep-deprived and often in low light at 3am. Contrast and text scaling matter more here than on a normal product. Keyboard navigation is new vs the mobile plan and it is not optional on the web."),
    (5, "Run Ask evals, tune prompt, pin the winning version", "Keya Chaudhari", "Pod W", "Medium", "", "Data"),
    (5, "DATA: Does retrieved Learn content improve Ask answers? Run the experiment", "Mohd Shaff Had Khan", "Pod I", "Medium",
     "TIMEBOXED, and a negative result is a success. Score plain age-context against age-context-plus-retrieved-Learn-articles on the golden set. If retrieval does not measurably help, we write that down and ship the simple thing - that is a real finding and it saves us a vector store we do not need.", "Data"),
    (5, "DATA: Source coverage audit - every content row has a real citation", "Natasha Saini", "Pod E", "High",
     "Walk every milestone and Learn row and confirm the source label points at something real and still live. A dead CDC link on a milestone card is the kind of thing a reviewer finds in the demo. Ship a script so this is re-runnable, not a one-off read-through.", "Data"),

    # ---------------- WEEK 6 ----------------
    (6, "RLS penetration test against a seeded multi-account dataset", "Keya Chaudhari", "Pod W", "Critical", ""),
    (6, "Full E2E suite green across all six tabs", "Melvin James Bryant III", "Pod E", "High", ""),
    (6, "Safety test table final pass and sign-off", "Sonakshi Panda", "Pod W", "Critical", ""),
    (6, "Record clinical sign-off in REVIEW.md", "Shailee Shah", "Product", "Critical",
     "HARD LAUNCH GATE. Without this the Health tab cannot ship to real parents. Everything else can be perfect and we still do not launch."),
    (6, "Performance: Lighthouse 90+, first load under 3s on throttled 4G", "Tarigopula Sivathmika Chowdary", "Pod I", "Medium",
     "Lighthouse also audits the PWA install requirements, so this task proves installability at the same time. Test throttled, not on campus wifi."),
    (6, "Beta with 10-20 real first-time parents", "Katrina Ma", "Product", "High", ""),
    (6, "Bug triage and fixes from beta", "Sonakshi Panda", "All", "High", ""),
    (6, "DATA: Beta analysis - funnel, drop-off, and what parents actually asked", "Natasha Saini", "Pod E", "High",
     "Not 'read the Discord messages'. Where did people stop in onboarding, which tabs went unopened, what did they type into Ask, which fever tiers fired. This is the only real usage data the project will ever have before the demo - it is also the strongest slide in it.", "Data"),
    (6, "Deploy to production on Vercel and smoke test the install flow", "Sonakshi Panda", "Pod W", "Critical",
     "No review queue and no store account - a push to main is live in about 40 seconds. The smoke test is the part that matters: install it on an iPhone and an Android from the real URL and walk all six tabs."),
    (6, "PWA icons, splash screens and install metadata", "Joanna Zhang", "Pod E", "High",
     "Maskable icons at 192 and 512, an Apple touch icon, theme colour, and a short_name that fits under a home screen icon. This is what the app looks like once it is installed, so it is the first thing a beta tester sees."),
    # ---- rebalance: Pod I capacity ----
    (2, "Ask module structure and OpenAI client setup", "Mohd Shaff Had Khan", "Pod I", "High",
     "Own apps/web/src/lib/ask and app/api/ask end to end - Pod W is not in the loop for Ask changes."),
    (3, "Ask: prompt versioning and rollout mechanism", "Mohd Shaff Had Khan", "Pod I", "High",
     "prompt_versions table with one active row. Every ai_runs row records which version answered."),
    (3, "Ask: conversation context window management and truncation", "Shaikh Mohd Rehaan", "Pod I", "Medium",
     "History caps at 20 messages per the contract. Decide what gets dropped and prove it stays coherent."),
    (4, "Ask: rate limiting, timeout handling and graceful failure", "Mohd Shaff Had Khan", "Pod I", "High",
     "15s timeout. On any error the client shows a plain failure state - it never falls back to a cached or generated answer."),
    (5, "Ask: build the eval question set with Keya", "Shaikh Mohd Rehaan", "Pod I", "Medium",
     "Golden set must include symptom questions that are required to redirect, and edge cases near the guard's keyword boundaries."),
    (6, "Ask cost projection at beta scale", "Mohd Shaff Had Khan", "Pod I", "Medium",
     "We need a per-user cost number before anyone talks about scaling this.", "Data"),
    # ---- PM-owned work with long lead times ----
    (1, "Confirm retailer links are plain search URLs, not affiliate", "Jasdeep Singh", "Product", "Medium",
     "Confirmed: we use plain search links like https://www.amazon.com/s?k=belly+oil - no programme application, no approval wait. Trade-off worth saying out loud: no revenue and no click tracking in v1. Cart is a convenience feature, not a revenue feature."),
    (2, "Recruit the beta cohort - 10 to 20 first-time parents", "Vishnu Deenadayal", "Product", "High",
     "Starts week 2, not week 6. Finding, screening and scheduling real first-time moms takes weeks. The week 6 beta task depends entirely on this being done early."),
    (3, "Approve Learn content copy before it ships", "Jasdeep Singh", "Product", "High",
     "Natasha builds the dataset; someone has to sign off that the copy is accurate and on-brand before it reaches parents. Check every card carries a source label too."),
    (4, "Publish privacy policy and Terms of Service", "Vishnu Deenadayal", "Product", "Critical",
     "Hard gate on the beta. We cannot put real parents' infant health data into a product with no privacy policy, and we need a stated retention and deletion policy. Pairs with Katrina's legal review."),
]

HEADERS = ["Group", "Name", "Owner", "Status", "Priority", "Pod", "Discipline",
           "Start Date", "Due Date", "Week", "Notes"]

with open("BumpToBloom-Monday-Import.csv", "w", newline="", encoding="utf-8") as f:
    w = csv.writer(f)
    w.writerow(HEADERS)
    for row in T:
        week, name, owner, pod, priority, notes = row[:6]
        disc = row[6] if len(row) > 6 else ""
        start, due = span(week)
        w.writerow([WEEKS[week], name, owner, "Not Started", priority, pod, disc,
                    start, due, f"W{week}", notes])

print(f"{len(T)} tasks written")
