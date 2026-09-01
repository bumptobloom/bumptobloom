# Architecture

```
         ┌──────────────────────────────────────────┐
         │   THE BROWSER — phone or laptop          │
         │   Next.js PWA, installable, works offline│
         │                                          │
         │   • every page                           │
         │   • packages/fever-rules  ← runs here,   │
         │     offline, deterministic               │
         │   • service worker caches the shell      │
         └───────────────────┬──────────────────────┘
                             │ HTTPS
                 ┌───────────▼────────────┐
                 │  Next.js server        │   Vercel
                 │  Server Actions        │
                 │  + API routes          │
                 │  + /api/ask (OpenAI key)│
                 └───┬────────────────┬───┘
                     │                │
        ┌────────────▼──────┐   ┌─────▼──────┐
        │ Supabase Postgres │   │  OpenAI    │
        │ + Auth + Storage  │   └────────────┘
        │ Row Level Security│
        └───────────────────┘

   ┌───────────────────────────────────────────────┐
   │  packages/fever-rules  (in-process, no I/O)   │
   │  deterministic triage — never reachable from  │
   │  the AI service, never over a network hop     │
   └───────────────────────────────────────────────┘
```

## Why this shape

See [ADR-006](DECISIONS.md#adr-006--a-progressive-web-app-phone-shaped-on-any-device).
It is a website people can install, running on phone and laptop from one codebase.

## Rules that hold the shape together

**No secret ever reaches the browser.** Anything prefixed `NEXT_PUBLIC_` is
visible to anyone who opens devtools. That is fine for the Supabase URL and anon
key, because RLS protects the data. The OpenAI key is server-side only, in a route
handler. If you find yourself writing `NEXT_PUBLIC_OPENAI`, stop.

**RLS still matters as much as it did.** Server Components query Supabase with the
user's session, so a bad policy leaks data regardless of what the server does.
Keep the isolation tests green.

**One deployment.** No second service, no cross-service call, no service token.
If you find yourself proposing one, raise it before you build it.

**Triage runs in the browser, deliberately.** A network call can time out, and a
timed-out fever check that fails open is the worst bug this product could have. The
service worker caches the shell, so a mother at 2am on hotel wifi still gets an
answer. The result is logged afterwards, and logging failing never blocks it.

**Age is derived from `birth_date`, which comes from the database.** The client
cannot invent an age; it can only use the one we gave it.

**Nothing identifying reaches OpenAI.** The Ask context carries an age in months
and a question. No name, no user id, no email.

**Symptom questions never reach the model.** `packages/shared` runs the triage
guard before the OpenAI call, not after. See docs/SAFETY.md.

## Data flow: a fever check

```
Parent enters temp + method + red flags
        │
        ▼
IN THE BROWSER — no network needed
        ├─ read birth_date from the session (fetched at login)
        ├─ derive ageMonths
        ├─ assessFever()  ← packages/fever-rules, pure, deterministic
        └─ render the tier immediately
        │
        ▼
Fire-and-forget: POST /api/health/fever-check to log it
        (if this fails, the parent already has their answer)
```

OpenAI appears nowhere in that diagram. That is the point — triage is
deterministic, in-process, and cannot fail open.

## Environments

| | App | DB |
|---|---|---|
| local | `npm run dev` on :3000 | Supabase local or a dev project |
| preview | Vercel, one URL per PR | shared dev project |
| prod | Vercel | prod project, RLS enforced |

Preview deploys never point at the production database.
