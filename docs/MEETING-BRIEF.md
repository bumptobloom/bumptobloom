# Meeting brief — Sonakshi, Lead Engineer

Read top to bottom. Roughly 20 minutes if you don't get stuck.

---

## 0. Your opener (30 seconds)

> "Before we start — I spent last night reading everything we have: the Master
> sheet, the technical stack doc, the Figma. They contradict each other in
> thirteen places. I've resolved the engineering ones and written them down, and
> the repo is live with the first week of work already assigned.
>
> But I have questions I can't answer alone, so let's start there."

---

## 1. QUESTIONS FIRST — things only you can answer

Ask these before presenting anything. They change what I say afterwards.

**1. What is the actual deliverable at the end of six weeks?**
A demo? A showcase? A working product with real users? I have Week 6 planned as
hardening and launch, but I don't know what we're launching *into*.

**2. Do we have a pediatrician, or a route to one?**
This is the one that worries me most. We're shipping triage advice to frightened
parents at 2am — that needs a doctor to review it before launch. We don't have
one, and it's the longest lead time on the project.

**3. Are we legally allowed to store babies' health data?**
Real accounts, real infants, symptom logs. Someone needs to check COPPA and state
health-privacy rules. Has anyone looked at this?

**4. Is it six weeks or seven?**
The tech-stack doc says seven. I've been told six. I planned for six — I need
that confirmed.

**5. Who pays for OpenAI, Supabase and hosting?**
Nobody has mentioned a budget. The Ask feature calls a paid API. Free tiers will
carry us through the build but not through a beta with real users. Is there money,
and who holds it?

**6. Can I send design change requests straight to Syeda, or do they go through a PM?**
I have five. I'd rather not go around anyone.

**7. Do we have affiliate accounts with Amazon, Target or Walmart yet?**
Approval takes one to three weeks. Cart ships in Week 4.

---

## 2. WALKTHROUGH — github.com/bumptobloom/bumptobloom

Share your screen. Seven stops, one sentence each.

**Stop 1 — the repo home page**
> "This is our repo. Everything lives here: the code, the plan, the decisions,
> the tasks. If it isn't in here it isn't real."

**Stop 2 — the `docs/` folder**
> "Six documents. `ONBOARDING` tells you who's in which pod and when we meet.
> `DECISIONS` records four calls I made and why. `API-CONTRACTS` is the exact shape
> of every API call, frozen at the end of this week. `SAFETY` is the rules for the
> Health feature. `ARCHITECTURE` is the diagram. `PLAN` is the six weeks."

**Stop 3 — `packages/fever-rules/`**
> "This is the only code that's already written, and it's the one place a bug
> could hurt a baby. It decides whether a fever means stay home, call your doctor,
> or go to the ER. Thirty-three tests, all passing, plus three that brute-force
> every possible age and temperature combination."

**Stop 4 — the Actions tab**
> "Every pull request runs these checks automatically. The safety tests run first
> and alone — if those fail, nothing else even runs."

**Stop 5 — the Issues tab**
> "Seventy-seven tasks, six weeks. Every one says who owns it, which week, and
> why it exists."

**Stop 6 — the Projects board**
> "Same tasks as a board. When you open a pull request that says 'Closes #42',
> the card moves itself. Nobody drags anything."

**Stop 7 — `CONTRIBUTING.md`**
> "Start from your issue, click Create a branch, write code, open a PR with
> 'Closes #42'. That's the whole workflow."

**Then say:**
> "You'll all get an invite. Read `ONBOARDING` first, then `DECISIONS` — four
> decisions were made before you arrived and they explain most of what looks odd."

---

## 3. THE DECISIONS — plain words

Four calls I made. All are reversible; argue with any of them.

**We're writing everything in TypeScript.** One language, one repo, one deploy.
I first planned a separate Python service for the AI part, because most of our
backend people are Python specialists. Then I found out they're all comfortable in
TypeScript, so the split stopped being worth the complexity.

**Babies only, 0 to 24 months.** No pregnancy in this version. The "I'm expecting"
button stays but says coming soon. Building both doubles the content work.

**The Health tab is just the fever checker.** No library of symptoms. Not a time
problem — a doctor has to approve every word, and we don't have a doctor.

**We store the baby's birthday, not their age.** Age gets calculated. This answers
the question design was stuck on about weeks versus months, and it means we can
support premature babies later for free.

### The problems I found

**The fever checker gives dangerous advice on one path.** A two-month-old with a
101.4 fever is an emergency room visit. Our prototype sends you to a page that
opens with "usually manageable at home, try a sponge bath." I've fixed the logic
in code. Design still needs to build the emergency screen.

**The app can't decide how old the baby is.** Home says Month 18, Learn and Cart
say Week 24, Health says Newborn. One screen shows two different ages at once.

**The milestone tracker is missing a whole category** and has no medical
disclaimer, even though the disclaimer wording is already written in the Master
sheet.

---

## 4. THE TECH STACK

```
              ┌──────────────────────────────┐
              │        THE APP               │
              │   A website she can install  │
              │   Phone, tablet or laptop    │
              │                              │
              │   • every page               │
              │   • fever checker ← runs     │
              │     here, works offline      │
              └───┬──────────────────────┬───┘
                  │                      │
        ┌─────────▼────────┐  ┌──────────▼─────────┐
        │    Supabase      │  │  Ask API route     │
        │                  │  │  holds the OpenAI  │
        │ • database       │  │  key, calls OpenAI │
        │ • login          │  │                    │
        │ • photo storage  │  │  never medical     │
        └──────────────────┘  └────────────────────┘
```

Say it like this:

> "It's a progressive web app — a website, but one she can add to her home
> screen and open like any other app, with its own icon and no browser bar.
> It works on her phone and on a laptop. Written in Next.js and TypeScript, so
> everyone's writing the same language. Supabase holds the data and handles
> login. OpenAI powers the Ask tab and nothing else.
>
> The fever checker runs **in the browser itself** — no AI, no internet needed.
> A mom at 2am on bad wifi still gets an answer, and it can't be talked into
> the wrong one."

**If someone asks "so it's not a real app?":**

> "It installs, it has an icon, it opens full screen, it works offline. What it
> doesn't have is an App Store listing — nobody can find it by searching the
> store, we send them a link. In exchange we skip $124 of store fees, Apple's
> review queue, and Google's 14-day testing rule. For a demo on 6 October,
> that trade is the only one that fits."

**In one line each:**

- **Next.js 15 + TypeScript** — the app, one codebase for every device
- **Tailwind + shadcn/ui** — how we style it, so it looks consistent
- **Supabase** — database, login, and photo storage, all in one
- **Next.js API routes** — the only place our OpenAI key can safely live
- **OpenAI** — the Ask tab only
- **manifest.json + service worker** — what makes it installable and offline-capable
- **Vercel** — hosting; every push to `main` is live in about 40 seconds
- **GitHub Actions** — runs the tests on every change

---

## 5. THE TEAM — three pods

**The thing nobody wrote down:** we span 12 and a half hours, from California to
India. Once you add everyone's stated hours, **there is no single hour in the week
when all eleven engineers can be online.** Not one.

So I stopped trying to schedule around it and built the team so it doesn't matter.

**Pod W — Platform (California)**
Me and Keya. Repo, database, login, deploys, the fever rules, code review.

**Pod E — Frontend and Data (US East)**
Joanna, Melvin, Natasha. The screens, and all the content and milestone data.

**Pod I — Backend and Ask (India, Saudi Arabia)**
Shaff Had, Rehaan, Sivathmika, Sahasra, Rasheed. The APIs and the AI feature.

**How they connect:** each pod has one bridge person whose hours reach the next
pod. Shaff Had works 9 to 11pm India time, which is 8:30 to 10:30am for me — the
single best overlap window that exists on this team.

**And this is why the API contracts freeze at the end of this week.** Once the
shapes are agreed, the frontend builds against them and the backend builds to
them, and neither has to wait for the other to wake up.

> "Be honest about the Tuesday all-hands — it falls outside Sivathmika's,
> Rehaan's and Syeda's working hours. It's the least-bad slot, not a good one.
> It's recorded and decisions go in the repo the same day. If you can't make it,
> you're not expected to."

---

## 6. FOR THE PMs — four asks

Frame these as *things that will hurt us if nobody owns them*, and let Shailee
distribute. Don't assign.

> "There are four things where the delay isn't engineering time — it's someone
> else's calendar. I've written them as issues so we can decide owners together."

**1. We need a pediatrician to review the Health content.**
Nothing in the Health tab can launch without it. Longest lead time we have.

**2. Someone needs to apply to Amazon, Target and Walmart affiliate programs.**
Approval takes one to three weeks. Cart ships Week 4. If this slips, the shopping
tab launches with dead links — and that's the whole business model.

**3. Beta recruiting has to start Week 2, not Week 6.**
Finding and screening ten to twenty real first-time moms takes weeks.

**4. We need a privacy policy and terms of service before the beta.**
We'll be storing infant health data under real accounts.

**Then hand it over:**
> "Shailee, you're delivery lead — how do you want to split these?"

---

## 7. IF YOU ONLY HAVE FIVE MINUTES

- Repo is live, CI is green, 77 tasks assigned, first week is ready to go
- Thirteen contradictions found across our documents; engineering ones are resolved
- **We cannot launch the Health tab without a pediatrician, and we don't have one**
- **The prototype currently gives home-care advice for a case that's an ER visit** —
  logic is fixed, design still needs the screen
- Three questions I need answered: what's the final deliverable, who's paying for
  the API, and is six weeks confirmed
