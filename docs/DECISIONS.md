# Architecture Decision Records

Short records of decisions that were expensive to make and would be expensive to
reverse. If you disagree with one, open a PR against this file — don't quietly
build something else.

---

## ADR-001 — One language: TypeScript everywhere

**Status:** Accepted, Week 0. *Supersedes an earlier hybrid proposal.*
**Decided by:** Sonakshi (Lead Engineer), after checking with the backend group

### Context

The technical stack document specified an all-TypeScript system: Next.js for the
frontend, Next.js API routes for the backend, Supabase for data.

My first read of the roster pushed against that. Keya, Shaff Had and Rehaan all
list FastAPI, Pydantic, LangChain, PyTorch and RAG pipelines as their expertise,
and none of them listed TypeScript on the intake sheet. I drafted a hybrid —
Next.js for CRUD, one FastAPI service for Ask — on the assumption that asking
them to work in TypeScript would waste six weeks and the skills we recruited for.

**That assumption was wrong.** All three are comfortable in TypeScript. The
intake sheet captured what they specialise in, not the limit of what they can
write. Once that's true, the hybrid's costs have nothing left to buy.

### Decision

Everything in TypeScript. One repository, one language, one deploy.

- **Next.js + Supabase owns all CRUD** — babies, milestones, content, saved
  items, products — through Server Actions and API routes.
- **Ask is a module inside the web app**, not a separate service. Prompt
  construction, the OpenAI call, response validation with Zod, conversation
  logging, and the triage guard all live in `apps/web/src/lib/ask/`.
- **Fever rules stay a pure package** (`packages/fever-rules`) with no I/O.
- **Shared safety logic lives in `packages/shared`** — the triage guard was
  written in Python first and has been ported, tests and all.

### Consequences

Good: no cross-service API contract, no second deploy target, no service token,
no CORS, no timeout handling between our own components, one CI pipeline. In a
six-week project with eleven part-time engineers across five timezones, every one
of those is a place integration could have failed, and none of them now exist.

Bad: we give up Python's AI ecosystem. For MVP Ask — a single OpenAI call with a
context builder and schema validation — the TypeScript SDK is entirely adequate.
If we later add real RAG with a vector store and an eval harness, that is the
point to revisit this, and a Python service can be added then without unpicking
anything else.

Also worth naming: the AI work is now less differentiated as a specialism. Shaff
Had and Rehaan still own Ask end to end, because prompt design, context building
and eval discipline are the hard parts, and those are language-independent.

---

## ADR-002 — 0–24 months only; pregnancy is out

**Status:** Accepted, Week 0
**Decided by:** Team meeting, confirmed by Sonakshi

### Context

Three documents disagreed:

- The Figma and the tagline scope the product as pregnancy through 24 months.
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

The Figma prototype implies a library of symptom topics — the fever article has
an "← All topics" link. The technical stack document narrows this: "For the MVP,
Health is intentionally focused on the Fever Checker rather than a full AI
medical assistant."

The binding constraint is not engineering time. It is clinical review. Anything
in the Health tab is triage advice going to a frightened parent, so every line of
it needs a licensed pediatric clinician to sign off before release — and **we do
not have one yet.** Ten topics × four sections is forty pieces of copy waiting on
a person who does not currently exist on this project.

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

