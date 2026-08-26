# Architecture

```
                        ┌──────────────────┐
                        │     Browser      │
                        │  Next.js PWA     │
                        └────────┬─────────┘
                                 │ HTTPS
                        ┌────────▼─────────┐
                        │  Next.js server  │   Vercel
                        │  Server Actions  │
                        │  + API routes    │
                        └──┬───────────┬───┘
              ┌────────────┘           └──────────────┐
              │                                       │
   ┌──────────▼──────────┐               ┌────────────▼───────────┐
   │  Supabase Postgres  │               │   Ask service          │  Render
   │  + Auth + Storage   │               │   FastAPI (Python)     │
   │  Row Level Security │               │   ──► OpenAI           │
   └─────────────────────┘               └────────────────────────┘

   ┌───────────────────────────────────────────────┐
   │  packages/fever-rules  (in-process, no I/O)   │
   │  deterministic triage — never reachable from  │
   │  the AI service, never over a network hop     │
   └───────────────────────────────────────────────┘
```

## Why this shape

See [ADR-001](DECISIONS.md#adr-001--hybrid-stack). Short version: the app is
mostly CRUD, so CRUD lives where the frontend already is. The one genuinely
different problem — generative AI — lives in Python where our Python engineers
are, behind a single HTTP seam.

## Rules that hold the shape together

**One integration seam.** `POST /ask` is the only cross-service call in the
system. If you find yourself adding a second, raise it before you build it.

**The browser never talks to the AI service.** Next.js proxies, so the OpenAI key
and the service token stay server-side and the CORS surface stays zero.

**Triage does not cross a network boundary.** A network call can time out, and a
timed-out fever check that fails open is the worst bug this product could have.
`packages/fever-rules` is a pure function imported in-process.

**Age is derived server-side.** The fever-check endpoint does not accept an age
from the client; it reads `birth_date`. A stale or tampered client cannot produce
a wrong triage.

**Nothing identifying reaches OpenAI.** The Ask request carries an age in months
and a question. No name, no user id, no email.

## Data flow: a fever check

```
Parent enters temp + method + red flags
        │
        ▼
POST /api/health/fever-check     (Next.js, authenticated)
        │
        ├─ look up baby, verify ownership via RLS
        ├─ derive ageMonths from birth_date
        ├─ assessFever()  ← packages/fever-rules, pure, deterministic
        └─ insert fever_checks (inputs, tier, ruleId, rulesVersion)
        │
        ▼
{ tier, ruleId, rectalEquivalentF, reasons, methodCaution }
        │
        ▼
UI renders copy for the tier, severity high → low
```

The AI service appears nowhere in that diagram. That is the point.

## Environments

| | Web | AI | DB |
|---|---|---|---|
| local | :3000 | :8000 | Supabase local or a dev project |
| preview | Vercel per-PR | Render preview | shared dev project |
| prod | Vercel | Render | prod project, RLS enforced |

Preview deploys never point at the production database.
