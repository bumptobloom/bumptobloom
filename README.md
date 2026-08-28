# BumpToBloom

A trusted, personalized companion for first-time moms — babies 0–24 months.

**6-week MVP.** 11 engineers, 5 timezones, everyone part-time. That constraint
shapes every decision in this repo: contracts are frozen early, work is split so
squads don't block each other, and everything happens through PRs because we are
almost never online at the same time.

---

## Quick start

```bash
git clone git@github.com:bumptobloom/bumptobloom.git
cd bumptobloom
npm install
cp .env.example .env.local     # ask your pod lead for the real values
npm run dev                    # http://localhost:3000
```

Open it on your laptop, then open the same URL on your phone (same wifi, use your
machine's local IP). It's the same app — a phone-shaped column on desktop,
full-screen on mobile.

New to the project? Read [docs/ONBOARDING.md](docs/ONBOARDING.md) first — it takes
about fifteen minutes and will save you a week.

---

## What's in here

```
apps/
  web/                Next.js 15 + TypeScript + Tailwind + shadcn/ui.
                      A progressive web app — installable, works offline.
packages/
  fever-rules/        Pure TypeScript triage engine. No I/O, no deps, heavily
                      tested. Runs IN THE BROWSER so it works offline.
                      See docs/SAFETY.md before touching it.
  shared/             Shared types, Zod schemas, and the Ask triage guard.
supabase/
  migrations/         SQL, applied in order. Never edit an applied migration.
  seed/               Reference data (milestones, content, products).
data/                 Source datasets before they become seeds.
docs/                 Architecture, decisions, API contracts, safety.
```

## Stack

| Layer | Choice |
|---|---|
| App | Next.js 15, TypeScript, App Router |
| Styling | Tailwind + shadcn/ui |
| Installable | `manifest.json` + service worker (Serwist) |
| Data + auth | Supabase, guarded by Row Level Security |
| Server logic | Next.js API routes and Server Actions |
| Ask / AI | OpenAI, called server-side only |
| Hosting | Vercel |
| CI | GitHub Actions |
| Tests | Vitest, Playwright, node:test |

It's a **progressive web app** — a website people can install. On Android and
desktop Chrome the browser offers an Install prompt; on iPhone it's Share → Add
to Home Screen. Once installed it opens without browser chrome and works offline.

Why this and not an app-store app: see
[ADR-006](docs/DECISIONS.md#adr-006--a-progressive-web-app-phone-shaped-on-any-device).

---

## The three rules

**1. Age is derived, never stored.** `babies.birth_date` is the source of truth.
Nothing in this codebase stores "month 8". This closes the "what about babies
between months?" question and gives us preterm corrected-age support for free.

**2. AI never decides anything medical.** Ask cannot influence a fever result.
Triage is `packages/fever-rules` — deterministic, no network, running in the
browser. A mother at 2am on bad wifi still gets an answer, because the service
worker caches the shell.

**2b. No secret ever reaches the browser.** Anything prefixed `NEXT_PUBLIC_` is
readable by anyone who opens devtools. That's fine for the Supabase URL and anon
key, because RLS protects the data. The OpenAI key is server-side only.

**3. Contracts before code.** [docs/API-CONTRACTS.md](docs/API-CONTRACTS.md) is
frozen at the end of Week 1. Frontend builds against it, backend builds to it,
and neither waits for the other. Changing a frozen contract needs a PR that both
squad leads approve.

---

## Squads

| Squad | Owns | Lead |
|---|---|---|
| Platform | repo, auth, schema, deploys, design system | Sonakshi |
| Experience | Home, Track, Learn UI | Joanna |
| AI | Ask route, prompts, evals | Keya |
| Data & Safety | datasets, fever rules, Act catalog | Natasha |

Full roster, capacity and timezone map in [docs/ONBOARDING.md](docs/ONBOARDING.md).

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Short version: branch off `develop`,
name it `squad/short-description`, keep PRs under ~400 lines, and get one review
from someone outside your squad.
