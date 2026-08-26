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
    6: "Week 6 (Sep 29-Oct 5) - Hardening & Pitch Day",
}


def span(week: int) -> tuple[str, str]:
    s = START + timedelta(days=(week - 1) * 7)
    return s.isoformat(), (s + timedelta(days=6)).isoformat()


# (week, name, owner, pod, priority, notes)
T = [
    # ---------------- WEEK 1 ----------------
    (1, "DECISION: Confirm pediatric clinical reviewer for Health content", "Shailee Shah", "Product", "Critical",
     "BLOCKING FOR LAUNCH. PRD 10 requires licensed pediatric sign-off. No reviewer is named today. Longest lead time on the project - start day 1, not week 5."),
    (1, "DECISION: Legal review - COPPA / HIPAA / state health-privacy exposure", "Katrina Ma", "Product", "Critical",
     "We are storing infant health data with accounts. PRD 11.2 flags this and it is unresolved. Also covers whether the Fever Checker risks SaMD classification."),
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
     "Figma shows 3 domains, PRD 8.3 requires 4. Counter says '0 of 9' but only 6 checkboxes render - the missing 3 are the absent section."),
    (1, "Tell design: Track has no disclaimer; copy is already approved", "Sonakshi Panda", "Pod W", "High",
     "PRD 8.3 requires it on every checklist view. Exact copy already sits in the Master sheet. Legally the most important screen to have it on."),
    (1, "Tell design: fever article must run severity high-to-low", "Sonakshi Panda", "Pod W", "Critical",
     "Currently leads with a green 'Usually manageable at home' block. An emergency-tier result must never land a parent on home-care advice first."),
    (1, "Fix PRD find-and-replace corruption, republish clean version", "Shailee Shah", "Product", "High",
     "A global 'act' -> 'Bloom Cart' replace broke the PRD dozens of times (interBloom Cartive, ImpBloom Cart, Bloom Cartive users). It is currently unsafe to quote."),
    (1, "Ratify naming + nav order", "Katrina Ma", "Product", "Medium",
     "Commerce tab has 5 names across our docs: Cart, Act, Sprout Cart, Bloom Cart, Essentials. ADR-005 proposes Cart in UI / act in code. Nav order Home-Track-Learn-Ask-Health-Cart."),
    (1, "Scaffold Next.js app: TypeScript, Tailwind, shadcn/ui, PWA manifest", "Melvin James Bryant III", "Pod E", "High", ""),
    (1, "Supabase Auth: log in, create account, forgot password", "Melvin James Bryant III", "Pod E", "High",
     "Matches existing Figma screens 1-2. Note PRD 12 wrongly lists auth as out of scope - see ADR-006."),
    (1, "Extract design tokens from Figma into Tailwind config", "Joanna Zhang", "Pod E", "High",
     "Design-change log item 1 was 'fonts are not consistent throughout'. Tokens are how that stops recurring."),
    (1, "Build nav shell and routing for all six tabs", "Joanna Zhang", "Pod E", "Medium",
     "Order per ADR-005. Flag: 6 tabs exceeds the 5-item convention on iOS and Android."),
    (1, "Baby profile: create + edit, date picker, derived age", "Tarigopula Sivathmika Chowdary", "Pod I", "High",
     "birth_date is the source of truth. Nothing stores 'month 8'. Optional due_date for preterm."),
    (1, "Scaffold FastAPI Ask service, deploy to Render, /health green", "Mohd Shaff Had Khan", "Pod I", "High",
     "Service exists and is reachable this week even though it does nothing yet. Proves the one integration seam early."),
    (1, "Set up Vercel project and per-PR preview deploys", "Sonakshi Panda", "Pod W", "Medium",
     "Preview deploys must never point at the production database."),
    (1, "Begin CDC milestone dataset extraction", "Natasha Saini", "Pod E", "High",
     "cdc.gov/act-early/milestones. All 4 domains x 9 checkpoints (0,2,4,6,9,12,15,18,24)."),
    (1, "Everyone: read DECISIONS + ONBOARDING + SAFETY, get dev env running", "Sonakshi Panda", "All", "High",
     "Six decisions were made before onboarding. Reading them prevents most rework."),

    # ---------------- WEEK 2 ----------------
    (2, "Seed milestones: 4 domains x 9 checkpoints, with sources", "Natasha Saini", "Pod E", "High",
     "Every row needs a source_label - PRD 11.4 requires visible attribution."),
    (2, "GET /api/milestones + POST mark-noticed + DELETE", "Tarigopula Sivathmika Chowdary", "Pod I", "High", ""),
    (2, "Track UI: checkpoint navigator, 4 domains, progress counter", "Joanna Zhang", "Pod E", "High",
     "Replace the unlabeled 1-6 pagination in the Figma with real checkpoint months."),
    (2, "Render the Track disclaimer on every checklist view", "Joanna Zhang", "Pod E", "Critical",
     "Non-dismissible. Copy is in the Master sheet and in docs/SAFETY.md."),
    (2, "GET /api/home/:babyId", "Sahasra Miriyala", "Pod I", "High", ""),
    (2, "Home dashboard UI: profile card, this-week card, quick actions", "Melvin James Bryant III", "Pod E", "High",
     "Per design-change log: Bloom bar removed, nav at bottom, edit icon on profile card."),
    (2, "Activities: table, seed, endpoints", "Sahasra Miriyala", "Pod I", "Medium", ""),
    (2, "Design Ask prompt architecture and baby-context builder", "Keya Chaudhari", "Pod W", "High",
     "Age in months only. No name, no user id, nothing identifying crosses into the AI service."),
    (2, "Age derivation utility + tests, including preterm corrected age", "Sonakshi Panda", "Pod W", "High",
     "Server-side only. Clients never compute age and never cache it across days."),
    (2, "RLS isolation test suite: two accounts, every private table", "Keya Chaudhari", "Pod W", "Critical",
     "Automated, runs in CI. Manual verification does not survive week 5."),

    # ---------------- WEEK 3 ----------------
    (3, "Build Learn content dataset: 6 categories across age buckets", "Natasha Saini", "Pod E", "High", ""),
    (3, "GET /api/content, save and unsave endpoints", "Sahasra Miriyala", "Pod I", "High", ""),
    (3, "Learn feed UI with category filters and save", "Melvin James Bryant III", "Pod E", "High", ""),
    (3, "Finalise fever rules engine, set RULES_VERSION", "Sonakshi Panda", "Pod W", "Critical",
     "Engine + 33-case test table are already written. This is the review and version pin."),
    (3, "Send fever rules and result copy to clinical reviewer", "Shailee Shah", "Product", "Critical",
     "Deliberately in week 3, not week 5, so review runs in parallel across weeks 4-6 instead of blocking launch. Depends on the week 1 reviewer task."),
    (3, "POST /api/health/fever-check endpoint", "Rasheed Adebayo OYEWOLE", "Pod I", "Critical",
     "Server derives age from birth_date - the client never sends it. Validation failure must never render as a reassuring result."),
    (3, "fever_checks persistence with rule_id and rules_version", "Rasheed Adebayo OYEWOLE", "Pod I", "High",
     "Without rule_id + version we cannot reconstruct what the app told a parent, or why."),
    (3, "Build Ask evaluation harness", "Keya Chaudhari", "Pod W", "Medium",
     "Golden question set with expected behaviours, including symptom questions that must redirect."),
    (3, "Playwright E2E: onboarding -> home -> track", "Melvin James Bryant III", "Pod E", "Medium", ""),

    # ---------------- WEEK 4 ----------------
    (4, "Build product catalog with a written rationale per product", "Natasha Saini", "Pod E", "High",
     "PRD 8.5 requires every card to say why it is recommended."),
    (4, "Recommendation rules by age bucket (0-3, 4-8, 9-14, 15-24)", "Rasheed Adebayo OYEWOLE", "Pod I", "Medium", ""),
    (4, "GET /api/recommendations/:babyId", "Rasheed Adebayo OYEWOLE", "Pod I", "Medium", ""),
    (4, "Cart UI with retailer links, no checkout, no list total", "Melvin James Bryant III", "Pod E", "High",
     "Design-change log: remove 'Add to List' and all payment steps. Also fixes the truncated '2 it' bug on the list screen."),
    (4, "Ask: OpenAI integration and context builder", "Mohd Shaff Had Khan", "Pod I", "High", ""),
    (4, "Ask: Pydantic response validation + ai_runs logging", "Shaikh Mohd Rehaan", "Pod I", "High", ""),
    (4, "Ask: triage guard tests and keyword tuning", "Shaikh Mohd Rehaan", "Pod I", "Critical",
     "Symptom questions must redirect to Health BEFORE any model call. Bias to false positives."),
    (4, "Next.js /api/ask proxy with service token", "Tarigopula Sivathmika Chowdary", "Pod I", "High",
     "Browser never calls the AI service directly. Keeps the OpenAI key server-side."),
    (4, "Ask chat UI with standing disclaimer", "Tarigopula Sivathmika Chowdary", "Pod I", "High",
     "Pairs with the /api/ask proxy she already owns - same person, both sides of the seam."),
    (4, "Wire PostHog events per tech-stack doc section 15", "Melvin James Bryant III", "Pod E", "Medium",
     "Health events excluded from any ad-targeting integration."),

    # ---------------- WEEK 5 ----------------
    (5, "Fever Checker form: auto age, method selector, red-flag list", "Joanna Zhang", "Pod E", "Critical",
     "Method selector is new vs the Figma and it matters - an axillary reading runs ~1F low, so 99.5 armpit in a 2-month-old is an emergency."),
    (5, "Three fever result screens, severity high-to-low", "Joanna Zhang", "Pod E", "Critical",
     "HOME / CALL / EMERGENCY. The emergency screen is the one to demo at Pitch Day."),
    (5, "Persistent 911 banner above the fold on every Health screen", "Joanna Zhang", "Pod E", "Critical", ""),
    (5, "Apply clinical reviewer feedback to rules and copy", "Sonakshi Panda", "Pod W", "Critical",
     "Bump RULES_VERSION. Update the test table in the same PR."),
    (5, "Ask conversation history and sidebar", "Tarigopula Sivathmika Chowdary", "Pod I", "Medium",
     "Master sheet asked for this: 'save the history on the left navigation as ChatGPT'."),
    (5, "Wire Sentry into both services", "Melvin James Bryant III", "Pod E", "Medium", ""),
    (5, "Mobile pass: 390px, real devices, both platforms", "Sahasra Miriyala", "Pod I", "High", ""),
    (5, "Accessibility pass toward WCAG 2.1 AA", "Sahasra Miriyala", "Pod I", "Medium",
     "PRD 11.3. Our users are sleep-deprived and often in low light. Contrast and text scaling matter more than usual here."),
    (5, "Run Ask evals, tune prompt, pin the winning version", "Keya Chaudhari", "Pod W", "Medium", ""),

    # ---------------- WEEK 6 ----------------
    (6, "RLS penetration test against a seeded multi-account dataset", "Keya Chaudhari", "Pod W", "Critical", ""),
    (6, "Full E2E suite green across all six tabs", "Melvin James Bryant III", "Pod E", "High", ""),
    (6, "Safety test table final pass and sign-off", "Sonakshi Panda", "Pod W", "Critical", ""),
    (6, "Record clinical sign-off in REVIEW.md", "Shailee Shah", "Product", "Critical",
     "HARD LAUNCH GATE. Without this the Health tab cannot ship to real parents. Everything else can be perfect and we still do not launch."),
    (6, "Performance: first render under 2s on mid-tier mobile", "Tarigopula Sivathmika Chowdary", "Pod I", "Medium", ""),
    (6, "Beta with 10-20 real first-time parents", "Katrina Ma", "Product", "High", ""),
    (6, "Bug triage and fixes from beta", "Sonakshi Panda", "All", "High", ""),
    (6, "Pitch Day demo build and run-through script", "Sonakshi Panda", "Pod W", "High",
     "Demo the EMERGENCY fever path, not the home-care one. It is the strongest thing we built and it shows the safety story."),
    (6, "Production deploy and smoke test", "Sonakshi Panda", "Pod W", "Critical", ""),
    # ---- rebalance: Pod I capacity ----
    (2, "AI service CI, containerisation and deploy pipeline", "Mohd Shaff Had Khan", "Pod I", "High",
     "Own the whole deploy path for apps/ai so Pod W is never in the loop for an AI release."),
    (3, "Ask: prompt versioning and rollout mechanism", "Mohd Shaff Had Khan", "Pod I", "High",
     "prompt_versions table with one active row. Every ai_runs row records which version answered."),
    (3, "Ask: conversation context window management and truncation", "Shaikh Mohd Rehaan", "Pod I", "Medium",
     "History caps at 20 messages per the contract. Decide what gets dropped and prove it stays coherent."),
    (4, "Ask: rate limiting, timeout handling and graceful failure", "Mohd Shaff Had Khan", "Pod I", "High",
     "15s timeout. On any error the client shows a plain failure state - it never falls back to a cached or generated answer."),
    (5, "Ask: build the eval question set with Keya", "Shaikh Mohd Rehaan", "Pod I", "Medium",
     "Golden set must include symptom questions that are required to redirect, and edge cases near the guard's keyword boundaries."),
    (6, "AI service load test and cost projection at beta scale", "Mohd Shaff Had Khan", "Pod I", "Medium",
     "We need a per-user cost number before anyone talks about scaling this."),
]

HEADERS = ["Group", "Name", "Owner", "Status", "Priority", "Pod", "Start Date", "Due Date", "Week", "Notes"]

with open("BumpToBloom-Monday-Import.csv", "w", newline="", encoding="utf-8") as f:
    w = csv.writer(f)
    w.writerow(HEADERS)
    for week, name, owner, pod, priority, notes in T:
        start, due = span(week)
        w.writerow([WEEKS[week], name, owner, "Not Started", priority, pod, start, due, f"W{week}", notes])

print(f"{len(T)} tasks written")
