# BumpToBloom — 6-week engineering plan

**Sonakshi Panda, Lead Engineer · 25 Aug – 5 Oct 2026 · 11 engineers, 4 pods, 74 tasks**

The PRD, the technical stack doc, the Figma prototype and the Master sheet
disagree with each other in fourteen places. **Where they conflict, the Master
sheet wins** — it carries the team's MoSCoW priorities and is the most recent
agreed scope. This document says what we build, who builds it, and what has
to be settled this week.

---

## 1. Start here — two things that are not engineering tasks

### We have no pediatric clinical reviewer, and Health cannot ship without one

PRD §10 requires every Health-tab threshold and every line of result copy to be
authored or reviewed by a licensed pediatric clinician before release. No such
person is named anywhere in our documents. Until they sign off, the Fever Checker
cannot go to real parents — however good the code is.

That makes finding them a **week-one product task**, not a week-six checkbox. It
has the longest lead time on the project. The rules engine is deliberately
scheduled for week 3 so review can run in parallel across weeks 4–6 instead of
sitting on the critical path at the end.

**Owner: Shailee Shah. Week 1.**

### The prototype's fever path contradicts the PRD's own hard rule

PRD §8.6 states: *"any fever in an infant under 3 months is always classified as
urgent/emergency"* — correct, and consistent with standard pediatric guidance.

But Figma screen 11 shows a **2-month-old at 101.4°F**, there is no emergency
result screen in the prototype, and the flow lands on a fever article that leads
with a green *"Usually manageable at home"* block — dress lightly, offer fluids,
sponge bath.

Anyone clicking that path at Pitch Day sees home-care advice for a scenario that
is an emergency-room visit. The engine in this repo now enforces the rule and
proves it by brute force. Design still owes us the emergency result screen and a
reordered article that runs severity high-to-low.

**Owner: Sonakshi → Syeda. Week 1.**

---

## 2. Four decisions, made

Full reasoning in `docs/DECISIONS.md`. Disagree there, in a PR — not in a Discord
thread the India pod reads nine hours later.

| ADR | Decision | Why |
|---|---|---|
| **001** | **One language: TypeScript everywhere.** One repo, one deploy. Ask is a module in the web app, not a separate service. | I first drafted a hybrid with a Python service for Ask, assuming the backend group couldn't work in TypeScript. That was wrong — Keya, Shaff Had and Rehaan all can. Once that's true the hybrid's integration cost buys nothing, so we dropped it. |
| **002** | **0–24 months only.** Pregnancy is out. "I'm expecting" stays in onboarding and routes to a coming-soon screen. | Confirmed in your meeting. Building both paths roughly doubles the content dataset and adds a maternal-safety review burden we have no reviewer for. Note: roughly a third of the current Figma — every "Week 24" screen — now has no v1 implementation. |
| **003** | **Fever Checker only.** No symptom library. | The binding constraint isn't engineering time, it's clinical review. Ten topics × four sections is forty pieces of copy needing sign-off from a reviewer who doesn't exist yet. |
| **004** | **Store `birth_date`, never a month number.** | Answers design's open question about "days/weeks/months data" outright — the answer is a date picker. Fixes "what about kids between months?" and gives preterm corrected age for free. |

Two more recorded: **ADR-005** (naming — Cart in the UI, `act` in code) and
**ADR-006** (auth is in scope; PRD §12 is stale).

---

## 3. The fourteen conflicts

**Rule: the Master sheet is the authority.** Where the PRD or the tech-stack doc
says something different, the Master sheet is what we build.

| # | Conflict | Where it shows | Severity | Resolution / owner |
|---|---|---|---|---|
| 1 | Fever result leads with home-care advice | Figma 11–13 vs PRD §8.6 | **Critical** | Engine enforces it now. Design owes emergency screen + reordered article. |
| 2 | Stage state contradicts itself across tabs | Home = Month 18, Learn/Ask/Cart = Week 24, Health = Newborn | **Critical** | Worst case: the "Change age" modal reads Week 24 in the header and Month 18 in the body. Design. |
| 3 | No pediatric reviewer named | PRD §10 requires one | **Critical** | Hard launch gate. Shailee, week 1. |
| 4 | COPPA / HIPAA / SaMD exposure unreviewed | PRD §11.2 flags it; nothing followed | **Critical** | We store infant health data with accounts. Katrina, week 1. Legal question, not mine. |
| 5 | Track domain count | PRD §8.3 says 4. Master sheet says both "Social emotional, Language cognitive and movement" *and* "at least three types Physical, Cognitive and Language" | Medium | Master sheet is internally inconsistent here. Schema stores all four; Figma's three are acceptable for launch, Social/Emotional is a Should-have. Downgraded from Critical after re-reading the Master sheet. |
| 6 | Track has no disclaimer | PRD §8.3 requires it on every checklist view | High | Approved copy already sits in the Master sheet. Design just has to place it. |
| 7 | Backend stack vs team skills | I assumed the backend group couldn't write TypeScript | Settled | ADR-001, **all TypeScript**. My assumption was wrong — Keya, Shaff Had and Rehaan all can. Hybrid dropped. |
| 8 | Pregnancy in scope or not | PRD yes, stack doc 0–24mo, Figma builds it | Settled | ADR-002, out. |
| 9 | Auth in scope or not | PRD §12 says out; stack doc and Figma both build it | Settled | ADR-006, in. |
| 10 | Onboarding age model unresolved | Design-change log: "Pending: will need Tech team to discuss" | Settled | ADR-004, date picker. Design needs telling. |
| 11 | Commerce tab has five names | Cart · Act · Sprout Cart · Bloom Cart · Essentials | High | Proposed: Cart in UI, `act` in code. Katrina to ratify. |
| 12 | PRD corrupted by find-and-replace | "interBloom Cartive", "ImpBloom Cart", "Bloom Cartive users" | High | A global `act → Bloom Cart` replace. Currently unsafe to quote. Shailee. |
| 13 | Three different timelines | PRD says 8 weeks, stack doc says 7, we have 6 | High | Six. The plan below is what fits, given ADR-002 and ADR-003. |
| 14 | Learn has three different category sets | Master sheet: Developmental/Feeding/Sleep/**Diaper**. Stack doc: six categories. Figma: Development/Your Body/Wellness. | High | **Master sheet wins** — four categories, including Diaper, which appears nowhere else. Schema updated. |

Smaller design bugs, not tracked above: six bottom-nav items (convention caps at
five on both platforms), a stray red ★ next to "Month 8" in onboarding, and a
stock baby photo as the default avatar — which reads as *your* baby before you've
uploaded one.

One earlier finding is now moot: I flagged a truncated **"2 it"** on the Cart list
screen, but the Master sheet says *"remove your list and add to list
functionality"* — that whole screen is deleted, not fixed.

Also worth noting: the Master sheet calls the Ask tab **"Bloom AI Chat"**, which
is a sixth name in circulation. Its spec is explicit and useful though —
*"generic answers no guardrails"*, plus chat history in a left nav like ChatGPT.

---

## 4. Pods, and the constraint nobody wrote down

Our engineers span **PDT (UTC−7) to IST (UTC+5:30)** — 12.5 hours. Combined with
everyone's stated availability, **there is no single hour in the week when all
eleven can be online.** Not one.

That is not a scheduling problem to solve harder. It is a design constraint. So
pods are timezone-coherent, each has one named bridge person, and API contracts
freeze at the end of week 1 so pods build against agreed shapes instead of
waiting on each other.

### Pod W — Platform & Architecture (PDT)

| Person | Capacity |
|---|---|
| **Sonakshi Panda** — lead | 16h |
| **Keya Chaudhari** | 16h |

Owns the repo, CI/CD, Supabase, auth, schema and RLS, deploys, the fever rules
engine, AI architecture and evals, and review across all pods.

> Keya has classes mornings and afternoons — she's effectively a nights-and-weekends
> contributor, so her scope avoids anything that blocks other people daily.

### Pod E — Frontend & Data (EDT)

| Person | Capacity |
|---|---|
| **Joanna Zhang** — Front End | 15h, Mon/Wed/Fri mornings |
| **Melvin Bryant III** — Fullstack, bridge to Pod W | 10–20h |
| **Natasha Saini** — Data Scientist, bridge to Pod W | 15h, after 8pm EDT |

Owns Home and Track UI, Learn and Cart UI, and every dataset — CDC milestones,
Learn content, product catalog.

> Joanna works three mornings a week, so UI load is split with Melvin rather than
> stacked on her. Natasha's after-8pm-EDT slot is 5pm PDT — good overlap with Pod W.

### Pod I — Backend & Ask (IST / GMT+3)

| Person | Capacity |
|---|---|
| **Mohd Shaff Had Khan** — lead, bridge to Pod W | 20h, 9–11pm IST |
| **Shaikh Mohd Rehaan** | 12h (20h pre-demo) |
| **Sivathmika Chowdary** | 15h |
| **Sahasra Miriyala** | 12h |
| **Rasheed Oyewole** | 8h, GMT+3 |

Owns the Ask module — prompts, context, validation, evals — plus Next.js API
routes and CRUD, fever-check persistence and the recommendations endpoint.

> Shaff Had's 9–11pm IST is **8:30–10:30am PDT** — the single best bridge window
> that exists on this team. Protect it; it's how Pod W and Pod I stay in sync at all.
>
> Rasheed has the smallest capacity (8h) and is alone in GMT+3, so his scope is
> deliberately bounded and low-dependency.

### Meetings

| What | When |
|---|---|
| Bridge sync (Sona + Shaff Had) | Daily, 8:30am PDT / 9pm IST, 20 min |
| Pod stand-up | Async, in your pod's thread |
| All-hands | Tue, 8:30am PDT / 11:30am EDT / 5:30pm CEST / 9pm IST |
| Eng review | Fri, Pod W |

**Be honest about the all-hands:** it lands outside Sivathmika's, Rehaan's and
Syeda's stated working hours. It's the least-bad slot, not a good one. It's
recorded, decisions go into `docs/DECISIONS.md` the same day, and missing it is fine.

---

## 5. The six weeks

Reordered from the stack doc's seven-week plan in one important way: **the fever
rules move from week 6 to week 3**, so clinical review runs in parallel instead of
blocking launch. That's the single most valuable schedule change here.

| Week | Dates | Focus |
|---|---|---|
| **1** | Aug 25–31 | **Foundation & unblocking.** Repo, Supabase, auth, nav shell, baby profile with date picker, AI service reachable. *Contracts freeze.* Five design change-requests go out; both product blockers start. 21 tasks — front-loaded on purpose. |
| **2** | Sep 1–7 | **Home & Track.** Milestone dataset across all four domains and nine checkpoints. Track UI with a real checkpoint navigator, the disclaimer finally rendered, Home dashboard. *Automated RLS isolation tests* — manual verification will not survive week 5. |
| **3** | Sep 8–14 | **Learn & fever rules.** Learn feed and content dataset. *Fever rules finalised and sent for clinical review.* First E2E suite. |
| **4** | Sep 15–21 | **Cart & Ask.** Product catalog with a rationale per item, retailer links, no checkout. Ask goes live: OpenAI, Zod validation, run logging, and the *triage guard that redirects symptom questions before any model call.* |
| **5** | Sep 22–28 | **Health UI & polish.** Fever Checker form with the measurement-method selector, three result screens ordered high-to-low, persistent 911 banner. *Reviewer feedback applied,* rules version bumped. Mobile, accessibility, Sentry. |
| **6** | Sep 29–Oct 5 | **Hardening & Pitch Day.** RLS penetration test, full E2E, performance budget, beta with 10–20 real parents. *Clinical sign-off recorded* — the hard gate. Production deploy. |

**Pitch Day: demo the emergency fever path, not the home-care one.** It's the
strongest thing we'll have built and it tells the safety story.

---

## 6. What's already in the repo

Scaffolded, committed, tests green. Clone it, don't rebuild it.

```
apps/web/               Next.js 15 · TypeScript · Tailwind · shadcn/ui · PWA
packages/shared/        Ask triage guard · 15 tests passing
packages/fever-rules/   ← the important one. 33 cases + 3 brute-force invariants
supabase/migrations/    19 tables, RLS on every private one, birth_date not age
docs/                   DECISIONS · API-CONTRACTS · SAFETY · ARCHITECTURE · ONBOARDING
.github/                CI gates a rules change on a matching test change
```

The triage engine is worth reading first. It normalises every temperature to a
rectal equivalent *before* applying any threshold — an axillary reading runs about
1°F low, so a 2-month-old with an armpit reading of 99.5°F is an emergency. A
checker that ignored measurement method would have told that parent to go back to
bed. The under-3-months rule is proved by sweeping every age, temperature and
method combination rather than spot-checking a few.

### Push it

```bash
# create the org + empty repo at github.com/organizations/new, then:
unzip bumptobloom-repo.zip && cd bumptobloom
git remote add origin git@github.com:bumptobloom/bumptobloom.git
git push -u origin main
git checkout -b develop && git push -u origin develop
```

Then in **Settings → Branches**, protect `main` and `develop`: require one
approving review, require CI to pass, and require CODEOWNERS review. Update the
placeholder handles in `.github/CODEOWNERS` once everyone has joined the org.

---

## 7. What I could not decide for you

**Whether the thresholds are clinically right.** Every number in the engine is an
engineering placeholder taken from commonly published pediatric guidance. I'm not
a clinician and neither is anyone else on this project. The structure is sound and
the invariants are enforced — the values need a doctor.

**Whether storing infant health data triggers COPPA or HIPAA.** The Master sheet
asked "where is the data stored" and now has an answer: Supabase Postgres, US
region, RLS on every private table. Whether we're *allowed* to store it, and under
what obligations, is a legal question with real consequences and it needs a
lawyer, not a lead engineer.

**Whether six weeks is honest.** Roughly 720 real engineer-hours across the six
weeks. That's a genuine MVP — but only if we don't spend it on rework caused by
the thirteen contradictions above. Which is exactly what `docs/DECISIONS.md`
exists to prevent.
