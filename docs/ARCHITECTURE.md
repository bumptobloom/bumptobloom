# Architecture

```
              ┌────────────────────────────────────┐
              │        THE PHONE                   │
              │   Expo / React Native app          │
              │                                    │
              │   • every screen                   │
              │   • packages/fever-rules  ← runs   │
              │     here, offline, deterministic   │
              └──────┬──────────────────────┬──────┘
                     │                      │
       Supabase JS   │                      │  HTTPS
       (RLS enforced)│                      │
              ┌──────▼─────────────┐  ┌─────▼──────────────────┐
              │ Supabase Postgres  │  │ Supabase Edge Function │
              │ + Auth + Storage   │  │  /ask                  │
              │ Row Level Security │  │  holds the OpenAI key  │
              └────────────────────┘  └─────┬──────────────────┘
                                            │
                                      ┌─────▼──────┐
                                      │  OpenAI    │
                                      └────────────┘

   ┌───────────────────────────────────────────────┐
   │  packages/fever-rules  (in-process, no I/O)   │
   │  deterministic triage — never reachable from  │
   │  the AI service, never over a network hop     │
   └───────────────────────────────────────────────┘
```

## Why this shape

See [ADR-005](DECISIONS.md#adr-005--react-native-with-expo-this-is-a-store-app-not-a-website).
This ships to the App Store and Play Store, so it is a React Native app. There is
no web server of ours anywhere in this diagram — Supabase is the backend.

## Rules that hold the shape together

**No secret ever ships in the app bundle.** Anything in a mobile build can be
extracted in about five minutes. The OpenAI key lives in the `/ask` Edge Function
and nowhere else. If you find yourself putting a key in `app.config.ts`, stop.

**Most data access needs no server at all.** The app talks to Supabase directly
and Row Level Security decides what it may see. That is why the RLS tests matter
so much here — they are not a nice-to-have, they are the entire access-control
layer.

**Edge Functions exist for exactly two reasons:** something needs a secret, or
something must not be decided by the client. Today that is only `/ask`. If you
want a third, raise it first.

**Triage runs on the device, deliberately.** A network call can time out, and a
timed-out fever check that fails open is the worst bug this product could have. A
mother at 2am on hotel wifi still gets an answer. The result is logged to Supabase
afterwards, and logging failing never blocks the answer.

**Age is derived from `birth_date`, which comes from the database.** The app
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
ON THE DEVICE — no network needed
        ├─ read birth_date from the local session (fetched at login)
        ├─ derive ageMonths
        ├─ assessFever()  ← packages/fever-rules, pure, deterministic
        └─ render the tier immediately
        │
        ▼
Fire-and-forget: insert a fever_checks row via Supabase
        (if this fails, the parent already has their answer)
```

OpenAI appears nowhere in that diagram. That is the point — triage is
deterministic, in-process, and cannot fail open.

## Environments

| | App | DB |
|---|---|---|
| local | Expo Go on your own phone | Supabase local or a dev project |
| internal | EAS build → TestFlight / Play internal | shared dev project |
| prod | App Store / Play Store | prod project, RLS enforced |

Internal builds never point at the production database.
