# Team, pods, and how we work across 12.5 hours

## The constraint nobody wrote down

Our engineering team spans **PDT (UTC−7) to IST (UTC+5:30)** — a 12.5-hour
spread. Combined with everyone's stated availability, **there is no single hour
in the week when all eleven engineers can be online.** Not one.

That is not a scheduling problem to solve harder. It is a design constraint. So:

- Work is organised into **timezone-coherent pods** whose members genuinely
  overlap with each other daily.
- Each pod has **one named bridge person** whose hours reach the next pod.
- **API contracts are frozen in Week 1** (`docs/API-CONTRACTS.md`) so pods build
  against agreed shapes instead of waiting for each other.
- Decisions land in `docs/DECISIONS.md`, not in a Discord message that the India
  pod reads nine hours later.

---

## Pods

### Pod W — Platform & Architecture (PDT)

| Person | Role | Capacity | Hours |
|---|---|---|---|
| **Sonakshi Panda** | Lead Engineer (Fullstack, DS) — pod lead | 16h | flexible |
| **Keya Chaudhari** | Lead Engineer (Backend, DS) | 16h | Fri + weekends; weekdays after 6pm |

Owns the repo, CI/CD, Supabase project, auth, schema and RLS, Vercel and deploys,
the fever rules engine, AI architecture and evals, and code review across all pods.

> Keya has classes mornings and afternoons, so she is effectively a
> nights-and-weekends contributor. Her work is scoped to things that don't block
> anyone daily: AI architecture, prompt design, evaluation, schema review.

### Pod E — Frontend & Data (EDT)

| Person | Role | Capacity | Hours |
|---|---|---|---|
| **Joanna Zhang** | Front End Engineer | 15h | Mon/Wed/Fri mornings |
| **Melvin Bryant III** | Fullstack Engineer — bridge to Pod W | 10–20h | 8:30am–5:30pm EDT |

Owns Home and Track pages (Joanna), and Learn and Cart pages (Melvin).

> Natasha Saini left on 1 Sep. The datasets she owned moved to Pod I — see the
> pod table below and the task board for current owners.

### Pod I — Data layer & Ask (IST / GMT+3)

| Person | Role | Capacity | Hours |
|---|---|---|---|
| **Mohd Shaff Had Khan** | Back End Engineer — pod lead, bridge to Pod W | 20h | 9–11pm IST |
| **Shaikh Mohd Rehaan** | Backend + DS | 12h (20h pre-demo) | 9am–5pm IST |
| **Sivathmika Chowdary** | Fullstack Engineer | 15h | 9am–3pm IST |
| **Sahasra Miriyala** | Fullstack Engineer | 12h | — |
| **Rasheed Oyewole** | Back End Engineer | 8h | GMT+3 |

Owns the Ask route handler — prompts, context building, validation, evals (Shaff
Had, Rehaan) — plus the data layer and Supabase queries (Sivathmika, Sahasra),
and fever-check logging and recommendations (Rasheed).

> Shaff Had's 9–11pm IST slot is **8:30–10:30am PDT** — the single best bridge
> window that exists on this team. Protect it. It is how Pod W and Pod I stay in
> sync at all.
>
> Rasheed has the smallest capacity at 8h/week and is alone in GMT+3, so his
> scope is deliberately bounded and low-dependency.

### Outside engineering

**Product:** Shailee Shah (Delivery Lead), Katrina Ma (Product Owner),
Jasdeep Singh, Vishnu Deenadayal — all EDT.
**Design:** Syeda Yasrab Saba Gillani (CEST, Figma, 9am–3pm, requests a weekend
day off), Jennifer Robertson (PST).
**Mentors:** Lily Johnson (CST), Jana J. (PST, weekends).

---

## Meetings

| What | When | Who |
|---|---|---|
| **Bridge sync** | Daily, 8:30am PDT / 9pm IST, 20 min | Sona + Shaff Had (+ anyone) |
| **Pod stand-up** | Async in your pod's Discord thread | Each pod, own time |
| **All-hands** | Tue, 8:30am PDT / 11:30am EDT / 5:30pm CEST / 9pm IST | Everyone who can |
| **Eng review** | Fri, Sona + Keya | Pod W |

**Be honest about the all-hands:** that slot lands outside Sivathmika's,
Rehaan's, and Syeda's stated working hours. It is the least-bad slot, not a good
one. It is recorded, and decisions from it go into `docs/DECISIONS.md` the same
day. If you can't make it, you are not expected to.

## Capacity

Roughly **149 engineer-hours a week nominal**, call it 120 real. Over six weeks
that is about 720 hours. That is a genuine MVP if — and only if — we don't spend
it on rework caused by contradicting documents. Which is exactly what
`docs/DECISIONS.md` exists to prevent.

---

## Environments and deploys

### Where things run

| | URL | Deploys from |
|---|---|---|
| Production | https://bumptobloom-web.vercel.app | `main`, on every merge |
| Preview | posted automatically on your PR | your branch, on every push |
| Local | http://localhost:3000 | `npm run dev` |

**Every pull request gets its own live preview URL.** Vercel posts it as a check
on the PR. That link is how design and the PMs review work without cloning
anything, so put it in the message when you ask someone to look at a screen.

### Local setup

Copy `.env.example` to `.env.local` and fill in the two Supabase values. They are
pinned in the dev channel.

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
```

Those two are browser-safe by design. The publishable key ships to every visitor
in the JavaScript bundle, and Row Level Security is what actually protects the
data. That is why the RLS test suite is Critical and not a nice-to-have.

`SUPABASE_SECRET_KEY` is not in that list on purpose. It bypasses RLS entirely,
it lives only in Vercel's environment variables, and nothing on your laptop needs
it. If you ever think you need it locally, ask first — the answer is almost
certainly a different design.

Never commit `.env.local`. Never commit `.next/`.

### How the Vercel project is configured

Only relevant if you are changing build settings, but worth knowing when a build
fails in a way that makes no sense locally.

- **Root Directory** is `apps/web`, not the repo root, with "include files
  outside the root directory" left on so the `packages/*` workspaces resolve.
- **Install command** is Vercel's default, which installs from the repo root.
- **Node 22**, matching `engines` and CI.
- `next.config.ts` sets `transpilePackages` for `@btb/fever-rules` and
  `@btb/shared`. They ship raw TypeScript with no build step, so without that
  line the first import of either one fails the build with a parse error that
  looks like a Vercel problem and is not.

### Free-tier limits, so nobody is surprised in week 6

Both Vercel and Supabase are on free plans. Two things to know now rather than
during the demo:

- **Supabase free projects pause after about a week of inactivity**, and there
  are no automatic backups. If the database looks dead after a quiet weekend, it
  is probably paused, not broken. Un-pause it from the dashboard.
- **Vercel Hobby is for non-commercial use** and has bandwidth and build-minute
  limits. Check Usage in the Vercel dashboard before the beta rather than after.
  Hobby is also a personal account, so build logs are not visible to the team.
  Preview URLs are, which covers what most people actually need.

Upgrading either one is a cost decision that needs an owner. It is on the board.

---

## Your first day

1. Read this file, then `docs/DECISIONS.md`. Six decisions were made before you
   arrived; they'll explain most of what looks odd.
2. Read `docs/API-CONTRACTS.md` for whatever you're building against.
3. If you touch Health at all, read `docs/SAFETY.md` first. Not optional.
4. Clone, install, get `npm run dev` running. Open it on your laptop and on your
   phone. Env values and the Vercel setup are in **Environments and deploys**
   above.
5. Take a `good-first-issue`. Open a PR. Get it reviewed by someone in a
   different pod — that's how knowledge crosses timezones here.
