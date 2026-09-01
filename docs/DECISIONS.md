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

Everything in TypeScript. One repository, one language.

- **The app and the server logic are the same language**, so a developer can
  follow a feature end to end without switching.
- **Fever rules stay a pure package** (`packages/fever-rules`) with no I/O.
- **Shared safety logic lives in `packages/shared`** — the triage guard was
  written in Python first and has been ported, tests and all.

See ADR-005 for where that TypeScript actually runs, which changed once we
learned this ships to the app stores.

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

---

## ADR-005 — React Native with Expo (SUPERSEDED)

**Status:** ~~Accepted~~ **Superseded by ADR-006, Week 1.** Kept because the
reasoning still matters — read it alongside ADR-006 to see what changed and why.
**Decided by:** Sonakshi, after the team confirmed the target

### Context

I built the first week of planning around Next.js and a progressive web app. That
was my misreading — nobody had written the target down, and I filled the gap with
the wrong assumption.

**BumpToBloom ships to the Apple App Store and Google Play.** A Next.js site
cannot be submitted to either. Wrapping one in a shell is possible but Apple
routinely rejects thin web wrappers, and it would give first-time moms a worse
experience than the Figma promises.

### Decision

**React Native, via Expo.** Specifically:

| Concern | Choice |
|---|---|
| App framework | Expo (React Native), TypeScript |
| Navigation | Expo Router — file-based, works like Next.js routing |
| Styling | NativeWind — Tailwind syntax, compiles to React Native styles |
| Data + auth | Supabase JS client, called straight from the app, guarded by RLS |
| Anything needing a secret | Supabase Edge Functions (Deno, TypeScript) |
| Builds and store submission | EAS Build and EAS Submit |
| Shipping fixes | EAS Update — pushes JS changes without a store review |

Vercel and Next.js are out. `apps/web` is now `apps/mobile`.

### Two things this changes about safety

**The OpenAI key can never live in the app.** Anything shipped in a mobile bundle
can be extracted — this is not theoretical, it is a five-minute job. The Ask
feature therefore calls a **Supabase Edge Function**, which holds the key and
makes the OpenAI call server-side. The app never sees it.

**The fever rules now run on the device, and that is an improvement.**
`packages/fever-rules` is pure TypeScript with no I/O, so it runs unchanged inside
React Native. That means a mother at 2am on bad hotel wifi still gets a triage
answer. A network round-trip could time out; a local function cannot. The result
is logged to Supabase afterwards, and logging failing never blocks the answer.

Age is still derived from `birth_date`, which is fetched from the database — so
the client cannot invent an age, it can only use the one we gave it.

### Consequences

Good: real app-store presence. Native feel. Offline triage. Push notifications
become possible later. Roughly 60% of the UI work is the same React components
in slightly different primitives — `View` instead of `div`, `Text` instead of
`p` — so nobody has to relearn how to build a screen.

Bad, and worth being honest about:

- **Two new paid accounts and a long lead time.** Apple Developer Program is
  $99/year, Google Play is $25 one-time. Both need registering immediately.
- **Store review is a queue we do not control.** Apple is typically a few days.
  Google requires new personal developer accounts to run a closed test with 12
  testers for 14 continuous days before production release.
- **We must demo from TestFlight and Play internal testing**, not the public
  stores. Working back from 6 October, a public listing is not a safe bet. An
  internal build demos identically and needs no review.
- Nobody on the team listed React Native experience. The gap from React is small,
  but it is not zero, and week 1 should account for it.

---

## ADR-006 — A progressive web app, phone-shaped, on any device

**Status:** Accepted, Week 1. Confirmed in writing by Product.
**Supersedes:** ADR-005.

### Context

The target has now been stated three times: a website, then an App Store and Play
Store app, and now a progressive web app that works on both phone and laptop.
This one came with written confirmation from Product, which the previous two did
not.

A PWA is a website that can be installed. On Android and desktop Chrome the
browser offers an Install prompt; on iPhone it is Share → Add to Home Screen.
Once installed it opens without browser chrome, has its own icon, and works
offline. It is not in the app stores and cannot be found by searching them.

### Decision

**Next.js 15 as a progressive web app.**

| Concern | Choice |
|---|---|
| App | Next.js 15, TypeScript, App Router |
| Styling | Tailwind + shadcn/ui |
| Installable | `manifest.json` + a service worker (Serwist) |
| Data + auth | Supabase, called from Server Components and Server Actions |
| Server logic | Next.js API routes and Server Actions |
| OpenAI key | Server-side only, in a route handler |
| Fever rules | `packages/fever-rules`, running in the browser |
| Hosting | Vercel |

**Melvin's scaffold from Week 1 is the right foundation.** He had already created
`src/app/manifest.ts` before anyone used the word PWA. The
`platform/switch-to-expo` PR is closed rather than merged, and his branch stands.

### The phone-shaped layout

Product wants the app to look like a phone even on a laptop — a fixed-width
column, centred, the way the Figma prototype reads. On a phone it fills the
screen; on a desktop it sits in the middle.

This is a legitimate choice and it is much faster to build than two real layouts.
It is worth being honest that a 390px column on a 1440px screen reads as a demo
rather than a product, and that at some point the desktop view should be allowed
to breathe. Not a Week 1 problem, and not a reason to argue now.

### What this changes about safety

**The OpenAI key stays server-side**, now in a Next.js route handler rather than
an Edge Function. Simpler: one deployment, one language, no cross-service call.

**The fever rules still run on the client** and still work offline, because the
service worker caches the app shell and `packages/fever-rules` is pure
TypeScript with no I/O. A mother at 2am on bad wifi still gets an answer. That
property survived all three pivots because the engine never depended on the
runtime.

### Consequences

Good: no app store accounts, no review queue, no Apple identity verification, no
Google 14-day testing rule. **$124 of store fees disappear.** Deploys take about
40 seconds. Anyone opens a link and it works — no install step before a beta
tester can try it. And it genuinely runs on a laptop, which the mobile plan did
not.

Bad, and worth naming: no app store presence or discoverability. Push
notifications work on Android and desktop but are limited on iOS. And this is the
third runtime in two days — the schema, the fever engine, the pods and the safety
work have survived every pivot unchanged, but the team's confidence in the plan
has not, and that is a real cost that does not show up in a task list.

### The rule going forward

The target is now written down. Any further change to it needs the same: written
confirmation from Product, in the channel, before engineering re-points anything.
