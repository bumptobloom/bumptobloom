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
                        │  + Ask module    │
                        └──┬───────────┬───┘
                           │           │
   ┌───────────────────────▼─┐   ┌─────▼──────────────────┐
   │  Supabase Postgres      │   │   OpenAI API           │
   │  + Auth + Storage       │   │   (only external call) │
   │  Row Level Security     │   │                        │
   └─────────────────────────┘   └────────────────────────┘

   ┌───────────────────────────────────────────────┐
   │  packages/fever-rules  (in-process, no I/O)   │
   │  deterministic triage — never reachable from  │
   │  the AI service, never over a network hop     │
   └───────────────────────────────────────────────┘
```

## Why this shape

See [ADR-001](DECISIONS.md#adr-001--one-language-typescript-everywhere). Short
version: one language, one repo, one deploy. An earlier hybrid proposal put Ask
in a separate Python service; it was dropped once it turned out the backend group
is comfortable in TypeScript, because the hybrid's integration cost then bought
nothing.

## Rules that hold the shape together

**No internal network hops.** Every component of this system runs in the same
process. The only external call we make is to OpenAI. If you find yourself
proposing a second service, raise it before you build it.

**The browser never calls OpenAI.** The key lives server-side, in Server Actions
and API routes only.

**Triage does not cross a network boundary.** A network call can time out, and a
timed-out fever check that fails open is the worst bug this product could have.
`packages/fever-rules` is a pure function imported in-process.

**Age is derived server-side.** The fever-check endpoint does not accept an age
from the client; it reads `birth_date`. A stale or tampered client cannot produce
a wrong triage.

**Nothing identifying reaches OpenAI.** The Ask context carries an age in months
and a question. No name, no user id, no email.

**Symptom questions never reach the model.** `packages/shared` runs the triage
guard before the OpenAI call, not after. See docs/SAFETY.md.

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

OpenAI appears nowhere in that diagram. That is the point — triage is
deterministic, in-process, and cannot fail open.

## Environments

| | Web | DB |
|---|---|---|
| local | :3000 | Supabase local or a dev project |
| preview | Vercel per-PR | shared dev project |
| prod | Vercel | prod project, RLS enforced |

Preview deploys never point at the production database.
