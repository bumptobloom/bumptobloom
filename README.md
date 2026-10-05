# BumpToBloom

A trusted, personalized companion for first-time moms with babies from birth through 24 months.

BumpToBloom is a mobile-first progressive web app that provides age-based guidance, milestone tracking, temperature logging, product recommendations, and a safety-focused AI companion.

## MVP demo features

- Account creation, login, and password recovery
- Baby onboarding and profile management
- Personalized Home experience based on the baby’s age
- Learn guidance with trusted sources and safety disclaimers
- Track Milestones with age-based milestone checklists
- Vitals temperature log with method, notes, daily summaries, and local-time display
- Recommended for You with month-based product recommendations
- Ask Bloom with guarded health-question routing
- Structured Ask Bloom answers with sources and response feedback
- Row Level Security for parent and baby data
- Monitoring through Sentry and PostHog

---

## Quick start

```
git clone git@github.com:bumptobloom/bumptobloom.git
cd bumptobloom
npm install
cp .env.example apps/web/.env.local
npm run dev
```

Open ```http://localhost:3000``` The .env.example file contains placeholders only. Ask a project lead for the approved Development values. Never commit or share real keys.
For mobile testing, open the local network URL on a phone connected to the same Wi-Fi network.

New contributors should read [docs/ONBOARDING.md](docs/ONBOARDING.md) first.

---

## Project structure

```
apps/
  web/
    src/app/          Next.js App Router pages and routes
    src/components/   Reusable UI components
    src/lib/          API clients, validation, safety, and utilities

packages/
  fever-rules/        Deterministic temperature safety rules
  shared/             Shared types, schemas, and Ask safety logic

supabase/
  migrations/         Database migrations, applied in order
  seed/               Reference content, milestones, and products

data/                 Source datasets
docs/                 Architecture, safety, decisions, and API contracts
```

## Stack

| Layer | Technology |
|---|---|
| App | Next.js 15, TypeScript, App Router |
| Styling | Tailwind + shadcn/ui |
| Installable | Web manifest and service worker |
| Database and auth | Supabase with Row Level Security |
| Server logic | Next.js API routes and Server Actions |
| AI | OpenAI, called server-side only |
| Hosting | Vercel |
| Monitoring | Sentry and PostHog |
| CI | GitHub Actions |
| Testing | TypeScript, ESLint, node:test, and package-level tests |

BumpToBloom is a progressive web app. It can be installed from supported mobile and desktop browsers.

Why this and not an app-store app: see
[ADR-006](docs/DECISIONS.md#adr-006--a-progressive-web-app-phone-shaped-on-any-device).

---

## Safety principles

**1. Age is derived, never stored** 
`babies.birth_date` is the source of truth. The application derives the baby’s age instead of storing a permanent month value.

**2. AI does not make medical decisions** 
Ask Bloom does not determine fever severity or provide medical triage. Temperature safety logic is handled by the deterministic `packages/fever-rules` package.

Medical or emergency questions are redirected to appropriate professional care.

**3. No server secrets reach the browser** 
Values beginning with ```NEXT_PUBLIC_``` are visible in the browser. The Supabase public client values are protected by Row Level Security.

The OpenAI key and other server secrets are used only on the server.

**4. User data is isolated** 
Supabase Row Level Security ensures that each parent can access only their own account, baby profile, and related data.

**5. Contracts before code** 
Shared contracts and safety rules are documented before implementation. Changes to frozen contracts require review from the relevant squad leads.

---

## Development checks

Run these before opening a pull request:
```
git diff --check
npm run typecheck --workspaces --if-present
npm run lint --workspaces --if-present
npm run test --workspaces --if-present
npm run build --workspace=apps/web
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). 

In short:
- Branch from the latest main
- Use a focused branch name such as squad/short-description
- Keep pull requests small and focused
- Include testing information in the pull request
- Request review from someone outside your squad
- Never commit credentials, environment files, or private user data
