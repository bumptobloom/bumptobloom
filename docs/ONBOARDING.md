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

Owns the repo, CI/CD, Supabase project, auth, schema and RLS, deploys, the fever
rules engine, AI architecture and the eval harness, and code review across all
pods.

> Keya has classes mornings and afternoons, so she is effectively a
> nights-and-weekends contributor. Her work is scoped to things that don't block
> anyone daily: AI architecture, prompt design, evaluation, schema review.

### Pod E — Frontend & Data (EDT)

| Person | Role | Capacity | Hours |
|---|---|---|---|
| **Joanna Zhang** | Front End Engineer | 15h | Mon/Wed/Fri mornings |
| **Melvin Bryant III** | Fullstack Engineer — bridge to Pod W | 10–20h | 8:30am–5:30pm EDT |
| **Natasha Saini** | Data Scientist — bridge to Pod W | 15h | after 8pm EDT |

Owns Home and Track UI (Joanna), Learn and Cart UI (Melvin), and every dataset:
CDC milestones, Learn content, product catalog (Natasha).

### Pod I — Backend & AI service (IST / GMT+3)

| Person | Role | Capacity | Hours |
|---|---|---|---|
| **Mohd Shaff Had Khan** | Back End Engineer — pod lead, bridge to Pod W | 20h | 9–11pm IST |
| **Shaikh Mohd Rehaan** | Backend + DS | 12h (20h pre-demo) | 9am–5pm IST |
| **Sivathmika Chowdary** | Fullstack Engineer | 15h | 9am–3pm IST |
| **Sahasra Miriyala** | Fullstack Engineer | 12h | — |
| **Rasheed Oyewole** | Back End Engineer | 8h | GMT+3 |

Owns the Ask module — prompts, context building, validation, evals (Shaff Had,
Rehaan) — plus Next.js API routes and CRUD (Sivathmika, Sahasra), and
fever-check persistence and the recommendations endpoint (Rasheed).

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

## Your first day

1. Read this file, then `docs/DECISIONS.md`. Six decisions were made before you
   arrived; they'll explain most of what looks odd.
2. Read `docs/API-CONTRACTS.md` for whatever you're building against.
3. If you touch Health at all, read `docs/SAFETY.md` first. Not optional.
4. Clone, install, get `npm run dev` working. Ask your pod lead for env values.
5. Take a `good-first-issue`. Open a PR. Get it reviewed by someone in a
   different pod — that's how knowledge crosses timezones here.
