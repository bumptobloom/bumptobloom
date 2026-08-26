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


# (week, name, owner, pod, priority, notes)
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
    (1, "Scaffold Expo app: TypeScript, Expo Router, NativeWind", "Melvin James Bryant III", "Pod E", "Critical",
     "BLOCKS most of week 1. Everyone should be able to run `npx expo start` and open the app in Expo Go on their own phone by Wednesday."),
    (1, "Supabase Auth: log in, create account, forgot password", "Melvin James Bryant III", "Pod E", "High",
     "Matches existing Figma screens 1-2. Master sheet marks login and create-account as Must have."),
    (1, "Extract design tokens from Figma into the NativeWind theme", "Joanna Zhang", "Pod E", "High",
     "Design-change log item 1 was 'fonts are not consistent throughout'. Tokens are how that stops recurring."),
    (1, "Build the Expo Router tab navigator for all six tabs", "Joanna Zhang", "Pod E", "Medium",
     "Order: Home-Track-Learn-Ask-Health-Cart. Flag: 6 tabs exceeds the 5-item convention on iOS and Android."),
    (1, "Baby profile: create + edit, date picker, derived age", "Tarigopula Sivathmika Chowdary", "Pod I", "High",
     "birth_date is the source of truth. Nothing stores 'month 8'. Optional due_date for preterm."),
    (1, "Scaffold the Ask Edge Function and deploy a stub", "Mohd Shaff Had Khan", "Pod I", "High",
     "Supabase Edge Function, Deno + TypeScript. Returns a hardcoded string this week. It exists because the OpenAI key can NEVER ship inside the app bundle - anything in a mobile build can be extracted in five minutes."),
    (1, "Set up EAS Build and get a dev build onto real devices", "Sonakshi Panda", "Pod W", "High",
     "Expo Go covers most work, but anything with native modules needs a dev build. Get one onto an iPhone and an Android before week 2."),
    (1, "Register Apple Developer and Google Play accounts", "Sonakshi Panda", "Pod W", "Critical",
     "LONG LEAD, START DAY 1. Apple is $99/yr, Google is $25 one-time. Apple identity verification can take days. Google requires new PERSONAL accounts to run a closed test with 12 testers for 14 continuous days before production - register as an ORGANISATION to avoid that, or we cannot be on Play by Oct 6."),
    (1, "Half-day React Native ramp-up for anyone new to it", "Sonakshi Panda", "Pod W", "High",
     "Nobody listed React Native on the intake sheet. The gap from React is small - View instead of div, Text instead of p, no CSS cascade - but it is not zero. Do it once, together, rather than eleven people googling separately."),
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
     "apps/mobile/lib/api/. Screens never see raw table rows."),
    (2, "Home screen: profile card, this-week card, quick actions", "Melvin James Bryant III", "Pod E", "High",
     "Per design-change log: Bloom bar removed, nav at bottom, edit icon on profile card."),
    (2, "Activities: table, seed, data layer", "Sahasra Miriyala", "Pod I", "Medium", ""),
    (2, "Design Ask prompt architecture and baby-context builder", "Keya Chaudhari", "Pod W", "High",
     "Age in months only. No name, no user id, nothing identifying reaches OpenAI. Runs in the Edge Function, not on the device."),
    (2, "Age derivation utility + tests, including preterm corrected age", "Sonakshi Panda", "Pod W", "High",
     "Server-side only. Clients never compute age and never cache it across days."),
    (2, "RLS isolation test suite: two accounts, every private table", "Keya Chaudhari", "Pod W", "Critical",
     "Automated, runs in CI. On mobile this matters more than it would on the web: the app talks to Supabase directly, so RLS IS our entire access-control layer. There is no server to catch a mistake."),

    # ---------------- WEEK 3 ----------------
    (3, "Build Learn content dataset: Developmental, Feeding, Sleep, Diaper", "Natasha Saini", "Pod E", "High", ""),
    (3, "Learn data layer: fetch by age and category, save, unsave", "Sahasra Miriyala", "Pod I", "High", ""),
    (3, "Learn screen with category filters and save", "Melvin James Bryant III", "Pod E", "High", ""),
    (3, "Finalise fever rules engine, set RULES_VERSION", "Sonakshi Panda", "Pod W", "Critical",
     "Engine + 33-case test table are already written. This is the review and version pin."),
    (3, "Send fever rules and result copy to clinical reviewer", "Shailee Shah", "Product", "Critical",
     "Deliberately in week 3, not week 5, so review runs in parallel across weeks 4-6 instead of blocking launch. Depends on the week 1 reviewer task."),
    (3, "Wire the fever engine into the app and log results", "Rasheed Adebayo OYEWOLE", "Pod I", "Critical",
     "assessFever() runs ON THE DEVICE so it works offline - a mom at 2am on bad wifi still gets an answer. Age comes from birth_date fetched at login; the app never asks for one. Logging to Supabase is fire-and-forget: if it fails, the parent already has their answer and must never see an error."),
    (3, "fever_checks logging with rule_id and rules_version", "Rasheed Adebayo OYEWOLE", "Pod I", "High",
     "Without rule_id + version we cannot reconstruct what the app told a parent, or why."),
    (3, "Build Ask evaluation harness", "Keya Chaudhari", "Pod W", "Medium",
     "Golden question set with expected behaviours, including symptom questions that must redirect."),
    (3, "E2E test: onboarding -> home -> track, on a real device", "Melvin James Bryant III", "Pod E", "Medium",
     "Maestro or Detox. Runs against a dev build, not Expo Go."),

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
    (4, "Ask: triage guard tests and keyword tuning", "Shaikh Mohd Rehaan", "Pod I", "Critical",
     "Symptom questions must redirect to Health BEFORE any model call. Bias to false positives."),
    (4, "Ask: conversation persistence and history queries", "Tarigopula Sivathmika Chowdary", "Pod I", "High",
     "History reads straight from Supabase with RLS - no Edge Function needed for that half."),
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
    (5, "Wire Sentry React Native, with source maps for both platforms", "Melvin James Bryant III", "Pod E", "Medium",
     "Without source maps a crash report is unreadable hex. Set them up now, not after the first crash."),
    (5, "Device pass: small iPhone, large Android, and one old slow phone", "Sahasra Miriyala", "Pod I", "High",
     "Our users are often on whatever phone they already had. Test on something cheap and three years old, not just a flagship."),
    (5, "Accessibility pass: VoiceOver, TalkBack, large text", "Sahasra Miriyala", "Pod I", "Medium",
     "Our users are sleep-deprived and often in low light at 3am. Contrast and text scaling matter more here than on a normal product."),
    (5, "Run Ask evals, tune prompt, pin the winning version", "Keya Chaudhari", "Pod W", "Medium", ""),

    # ---------------- WEEK 6 ----------------
    (6, "RLS penetration test against a seeded multi-account dataset", "Keya Chaudhari", "Pod W", "Critical", ""),
    (6, "Full E2E suite green across all six tabs on a real device", "Melvin James Bryant III", "Pod E", "High", ""),
    (6, "Safety test table final pass and sign-off", "Sonakshi Panda", "Pod W", "Critical", ""),
    (6, "Record clinical sign-off in REVIEW.md", "Shailee Shah", "Product", "Critical",
     "HARD LAUNCH GATE. Without this the Health tab cannot ship to real parents. Everything else can be perfect and we still do not launch."),
    (6, "Performance: cold start under 3s on a mid-tier phone", "Tarigopula Sivathmika Chowdary", "Pod I", "Medium",
     "Cold start is the number that matters on mobile, not first paint."),
    (6, "Beta with 10-20 real first-time parents", "Katrina Ma", "Product", "High", ""),
    (6, "Bug triage and fixes from beta", "Sonakshi Panda", "All", "High", ""),
    (6, "Ship to TestFlight and Play internal testing, smoke test", "Sonakshi Panda", "Pod W", "Critical",
     "Internal distribution, not the public stores - no review queue, and it demos identically. Public listing is a stretch goal, not the Oct 6 plan."),
    (6, "App store assets: icon, splash, screenshots, privacy labels", "Joanna Zhang", "Pod E", "High",
     "Both stores require a privacy declaration. We collect infant health data, so this must match whatever Vishnu's privacy policy says - they are read together."),
    # ---- rebalance: Pod I capacity ----
    (2, "Ask module structure and OpenAI client setup", "Mohd Shaff Had Khan", "Pod I", "High",
     "Own apps/web/src/lib/ask end to end - Pod W is not in the loop for Ask changes."),
    (3, "Ask: prompt versioning and rollout mechanism", "Mohd Shaff Had Khan", "Pod I", "High",
     "prompt_versions table with one active row. Every ai_runs row records which version answered."),
    (3, "Ask: conversation context window management and truncation", "Shaikh Mohd Rehaan", "Pod I", "Medium",
     "History caps at 20 messages per the contract. Decide what gets dropped and prove it stays coherent."),
    (4, "Ask: rate limiting, timeout handling and graceful failure", "Mohd Shaff Had Khan", "Pod I", "High",
     "15s timeout. On any error the client shows a plain failure state - it never falls back to a cached or generated answer."),
    (5, "Ask: build the eval question set with Keya", "Shaikh Mohd Rehaan", "Pod I", "Medium",
     "Golden set must include symptom questions that are required to redirect, and edge cases near the guard's keyword boundaries."),
    (6, "Ask cost projection at beta scale", "Mohd Shaff Had Khan", "Pod I", "Medium",
     "We need a per-user cost number before anyone talks about scaling this."),
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

HEADERS = ["Group", "Name", "Owner", "Status", "Priority", "Pod", "Start Date", "Due Date", "Week", "Notes"]

with open("BumpToBloom-Monday-Import.csv", "w", newline="", encoding="utf-8") as f:
    w = csv.writer(f)
    w.writerow(HEADERS)
    for week, name, owner, pod, priority, notes in T:
        start, due = span(week)
        w.writerow([WEEKS[week], name, owner, "Not Started", priority, pod, start, due, f"W{week}", notes])

print(f"{len(T)} tasks written")
