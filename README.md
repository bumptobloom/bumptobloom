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
cp .env.example .env.local     # ask your squad lead for the real values
npm run dev                    # web app on http://localhost:3000
```

For the AI service:

```bash
cd apps/ai
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

New to the project? Read [docs/ONBOARDING.md](docs/ONBOARDING.md) first — it takes
about fifteen minutes and will save you a week.

---

## What's in here

```
apps/
  web/                Next.js 15 + TypeScript + Tailwind + shadcn/ui.
                      Owns every screen and all CRUD. Deploys to Vercel.
  ai/                 FastAPI service. Owns Ask (and only Ask).
                      Deploys separately. Talks HTTP, never touches the DB directly.
packages/
  fever-rules/        Pure TypeScript triage engine. No I/O, no deps, heavily tested.
                      Imported by apps/web. See docs/SAFETY.md before touching it.
  shared/             Types and Zod schemas shared between web and ai.
supabase/
  migrations/         SQL, applied in order. Never edit an applied migration.
  seed/               Reference data (milestones, content, products).
data/                 Source datasets before they become seeds.
docs/                 Architecture, decisions, API contracts, safety.
```

## Stack

| Layer | Choice |
|---|---|
| Frontend | Next.js 15, TypeScript, Tailwind, shadcn/ui, PWA |
| App backend | Next.js Server Actions + API routes |
| AI service | Python, FastAPI, Pydantic |
| Database | Supabase Postgres with Row Level Security |
| Auth | Supabase Auth |
| Hosting | Vercel (web) + Render (ai) |
| CI | GitHub Actions |
| Tests | Vitest, Playwright, pytest |

Why the app is mostly TypeScript but Ask is Python: see
[ADR-001](docs/DECISIONS.md#adr-001--hybrid-stack).

---

## The three rules

**1. Age is derived, never stored.** `babies.birth_date` is the source of truth.
Nothing in this codebase stores "month 8". This closes the "what about babies
between months?" question and gives us preterm corrected-age support for free.

**2. AI never decides anything medical.** The Ask service cannot influence a
fever result. Triage is `packages/fever-rules`, which is deterministic and has no
network access. This is architectural, not a convention.

**3. Contracts before code.** [docs/API-CONTRACTS.md](docs/API-CONTRACTS.md) is
frozen at the end of Week 1. Frontend builds against it, backend builds to it,
and neither waits for the other. Changing a frozen contract needs a PR that both
squad leads approve.

---

## Squads

| Squad | Owns | Lead |
|---|---|---|
| Platform | repo, auth, schema, deploy, design system | Sonakshi |
| Experience | Home, Track, Learn UI | Joanna |
| AI | Ask service, prompts, evals | Keya |
| Data & Safety | datasets, fever rules, Act catalog | Natasha |

Full roster, capacity and timezone map in [docs/ONBOARDING.md](docs/ONBOARDING.md).

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Short version: branch off `develop`,
name it `squad/short-description`, keep PRs under ~400 lines, and get one review
from someone outside your squad.
