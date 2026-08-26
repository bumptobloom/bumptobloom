# Architecture Decision Records

Short records of decisions that were expensive to make and would be expensive to
reverse. If you disagree with one, open a PR against this file — don't quietly
build something else.

---

## ADR-001 — Hybrid stack

**Status:** Accepted, Week 0
**Decided by:** Sonakshi (Lead Engineer)

### Context

The technical stack document specified an all-TypeScript system: Next.js for the
frontend, Next.js API routes for the backend, Supabase for data. Clean and
simple.

The problem is the team. Three of our four backend engineers — Keya, Shaff Had,
and Rehaan — list FastAPI, Pydantic, LangChain, PyTorch, and RAG pipelines as
their expertise. Not one of them lists TypeScript. Under the original plan they
would spend six weeks writing a language they don't work in, while the AI/RAG
skills we actually recruited for went unused.

The opposite extreme — a full FastAPI backend — plays to those strengths but
costs us API contracts, two deploy targets, Supabase token forwarding, and CORS
for *every* feature, including the ~80% of this app that is forms and lists.
With eleven part-time engineers across five timezones, integration is where a
six-week project dies.

### Decision

Split on the seam where the skills actually differ.

- **Next.js + Supabase owns all CRUD.** Babies, milestones, content, saved items,
  products. Server Actions and API routes. One deploy, no cross-service calls.
- **One FastAPI service owns Ask, and only Ask.** Prompt construction, OpenAI
  calls, response validation, conversation logging, and the eval harness.
  A single clean HTTP boundary: `POST /ask`.
- **Fever rules stay in TypeScript** as a pure package inside the web app. It is
  deterministic logic with no I/O, it must be trivially unit-testable, and it
  must not be reachable over a network boundary that could fail open.

### Consequences

Good: Python engineers own a real, meaty, isolated service. The CRUD majority
ships without waiting on cross-service plumbing. Exactly one integration seam to
get right instead of a dozen.

Bad: two deploy targets and two CI pipelines. The AI service needs its own auth
(a shared secret plus the Supabase JWT, verified server-side). We accept this.

---

## ADR-002 — 0–24 months only; pregnancy is out

**Status:** Accepted, Week 0
**Decided by:** Team meeting, confirmed by Sonakshi

### Context

Three documents disagreed:

- The PRD scopes the product as pregnancy through 24 months.
- The technical stack document says "Target: New moms with babies 0–24 months."
- The Figma prototype has a complete Week-24 pregnancy path — a pregnancy Learn
  feed, pregnancy Ask copy, and a Trimester 2 Cart.

Building both paths roughly doubles the content dataset and the Track logic, and
prenatal content carries its own maternal-safety review burden that we have no
reviewer for.

### Decision

MVP is **0–24 months**. The "I'm expecting" option stays in onboarding but routes
to a short "coming soon" screen that captures an email.

The tagline stays as written. We are telling a pregnancy-through-two-years story
and shipping the second half of it first.

### Consequences

Roughly a third of the current Figma screens have no v1 implementation — every
"Week 24" screen. Design needs to be told this explicitly and given the
"coming soon" screen to design. **Owner: Sonakshi → Katrina, Week 1 Day 1.**

The database has no pregnancy tables. Adding them later is additive, not a
migration of existing rows.

---

## ADR-003 — Health is the Fever Checker only

**Status:** Accepted, Week 0
**Decided by:** Sonakshi

### Context

PRD §8.6 requires a library of 10+ symptom topics, each with Overview, Home Care,
Call Your Pediatrician, and Seek Emergency Care sections. The technical stack
document narrows this: "For the MVP, Health is intentionally focused on the Fever
Checker rather than a full AI medical assistant."

The binding constraint is not engineering time. It is clinical review. PRD §10
requires every Health-tab item to be authored or reviewed by a licensed pediatric
clinician before release, and **we do not have a named clinical advisor yet.**
Ten topics × four sections is forty pieces of copy needing sign-off from a person
who does not currently exist on this project.

### Decision

Ship the Fever Checker. Do not ship the symptom library.

### Consequences

The "← All topics" link in the current Figma fever article has nowhere to go and
must be removed or repointed.

Finding a pediatric reviewer becomes a **Week 1 blocking task, owned by PM**, not
a Week 6 nice-to-have. The rules are written in Week 3 specifically so review can
run in parallel across Weeks 4–6 instead of blocking launch.

---

## ADR-004 — `birth_date`, never a stored age

**Status:** Accepted, Week 0
**Decided by:** Sonakshi

### Context

The design-change log has this open item: *"Onboarding — Kid Profile — Pending:
Will need Tech team to discuss the complex level of collecting days/weeks/months
data. Or we should change to 'what's the due date'."* The Figma onboarding
currently uses a 0–24 slider that produces "Month 8", and the Master sheet asks
"What about kids in between months (by weeks)?"

### Decision

Store `babies.birth_date` as a date. Derive age everywhere. Also store an
optional `due_date` for babies born preterm, so corrected age is available later.

The onboarding UI becomes a date picker, not a slider.

### Consequences

This answers the designers' open question outright — the answer is a date picker,
and someone needs to tell them. **Owner: Sonakshi → Syeda, Week 1 Day 1.**

Age becomes exact rather than bucketed, so "kids between months" stops being a
problem. Preterm support becomes additive later rather than a schema change.

The Figma "Month 8" slider and the "Change age" modal both need redesigning.

---

## ADR-005 — One name per thing

**Status:** Accepted, Week 0
**Decided by:** Sonakshi, needs PM ratification

### Context

The commerce tab currently has five names across our documents: **Cart** (Figma),
**Act** (technical stack doc), **Sprout Cart** (PRD §7), **Bloom Cart** (PRD §8.5
and the Figma Cart header), and **Essentials** (the `syeda-design` branch).

"Bloom Cart" exists because someone ran a global find-and-replace of "act" → "Bloom
Cart" across the PRD. That is also why the PRD now says "interBloom Cartive
prototype", "ImpBloom Cart", and "Bloom Cartive users" several dozen times. The
corruption then propagated into the Figma Cart header.

Navigation order is equally unsettled — the design-change log says *"Pending: we
might need to re-arrange the bar. Need to discuss in team."*

### Decision

The tab is **Cart** in the UI and `act` in code, routes, and analytics
(`/act`, `recommendations_viewed`). Two names, one for humans and one for
machines, deliberately and consistently.

Navigation order is fixed at: **Home · Track · Learn · Ask · Health · Cart**
— frequency of use, left to right.

Six tabs exceeds the five-item convention on both iOS and Android. Flagged for
design; not blocking.

### Consequences

The PRD needs a clean rewrite — the find-and-replace corruption makes it unsafe
to quote. **Owner: PM, Week 1.**

Design must update the Cart header and the nav order.

---

## ADR-006 — Auth is in scope

**Status:** Accepted, Week 0

### Context

PRD §12 lists "User accounts, authentication, and cross-device data sync" as out
of scope for v1. But the technical stack document specifies Supabase Auth, the
Figma has complete Log In and Create Account screens, and the Master sheet marks
login as a **Must have**.

### Decision

Auth is in. Supabase Auth, email and password, matching the Figma.

### Consequences

The PRD's out-of-scope section is stale and must be corrected, because §11.2's
privacy requirements (encryption, retention, deletion, HIPAA/COPPA review) only
bite once accounts exist — and they now do.

The Master sheet's open question **"where is the data stored"** is now answered:
Supabase Postgres, US region, with Row Level Security on every table holding
parent or baby data. The harder question — whether storing infant health data
triggers COPPA or state health-privacy obligations — is a **legal question that
is still open and is not mine to answer.** Escalated to PM, Week 1.
