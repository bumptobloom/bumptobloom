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
cp .env.example .env           # ask your pod lead for the real values

cd apps/mobile
npx expo start                 # scan the QR code with Expo Go on your phone
```

You need a phone. Install **Expo Go** from the App Store or Play Store, scan the
QR code, and the app opens on your device with live reload. No Xcode, no Android
Studio, no simulator required to get started.

New to the project? Read [docs/ONBOARDING.md](docs/ONBOARDING.md) first — it takes
about fifteen minutes and will save you a week.

---

## What's in here

```
apps/
  mobile/             Expo + React Native + TypeScript. The app itself —
                      every screen, ships to the App Store and Play Store.
packages/
  fever-rules/        Pure TypeScript triage engine. No I/O, no deps, heavily
                      tested. Runs ON THE DEVICE so it works offline.
                      See docs/SAFETY.md before touching it.
  shared/             Shared types, Zod schemas, and the Ask triage guard.
supabase/
  migrations/         SQL, applied in order. Never edit an applied migration.
  functions/          Edge Functions — the only place a secret key may live.
  seed/               Reference data (milestones, content, products).
data/                 Source datasets before they become seeds.
docs/                 Architecture, decisions, API contracts, safety.
```

## Stack

| Layer | Choice |
|---|---|
| App | Expo (React Native), TypeScript |
| Navigation | Expo Router |
| Styling | NativeWind (Tailwind syntax for React Native) |
| Data + auth | Supabase JS client, guarded by Row Level Security |
| Server logic | Supabase Edge Functions (Deno, TypeScript) |
| Ask / AI | OpenAI, called from an Edge Function only |
| Builds | EAS Build → TestFlight and Play internal testing |
| CI | GitHub Actions |
| Tests | Jest + React Native Testing Library, node:test |

Why React Native and not a website: see
[ADR-005](docs/DECISIONS.md#adr-005--react-native-with-expo-this-is-a-store-app-not-a-website).

---

## The three rules

**1. Age is derived, never stored.** `babies.birth_date` is the source of truth.
Nothing in this codebase stores "month 8". This closes the "what about babies
between months?" question and gives us preterm corrected-age support for free.

**2. AI never decides anything medical.** Ask cannot influence a fever result.
Triage is `packages/fever-rules` — deterministic, no network, running on the
device. A mother at 2am on bad wifi still gets an answer.

**2b. No secret ever ships in the app bundle.** Anything in a mobile build can be
extracted in five minutes. The OpenAI key lives in a Supabase Edge Function and
nowhere else.

**3. Contracts before code.** [docs/API-CONTRACTS.md](docs/API-CONTRACTS.md) is
frozen at the end of Week 1. Frontend builds against it, backend builds to it,
and neither waits for the other. Changing a frozen contract needs a PR that both
squad leads approve.

---

## Squads

| Squad | Owns | Lead |
|---|---|---|
| Platform | repo, auth, schema, builds, design system | Sonakshi |
| Experience | Home, Track, Learn UI | Joanna |
| AI | Ask Edge Function, prompts, evals | Keya |
| Data & Safety | datasets, fever rules, Act catalog | Natasha |

Full roster, capacity and timezone map in [docs/ONBOARDING.md](docs/ONBOARDING.md).

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Short version: branch off `develop`,
name it `squad/short-description`, keep PRs under ~400 lines, and get one review
from someone outside your squad.
