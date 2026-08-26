# Safety governance — the Health feature

The Fever Checker is the only part of BumpToBloom where a bug can hurt a baby.
It is governed differently from the rest of the codebase. Read this before you
open `packages/fever-rules`.

---

## Current status: NOT CLEARED FOR REAL USERS

| Gate | State |
|---|---|
| Rules implemented | Done |
| Test table passing | Done — 33 cases + 3 brute-force invariants |
| Named pediatric reviewer | **MISSING — blocking** |
| Reviewer sign-off in `REVIEW.md` | **MISSING — blocking** |
| Legal review of SaMD exposure | **MISSING — blocking** |

Every threshold in the engine is an engineering placeholder taken from commonly
published pediatric guidance. **No clinician has reviewed any of it.** The
product cannot go to real parents until the two blocking gates close.

Finding the reviewer is a Week 1 PM task precisely because it is on the critical
path to launch and has a long lead time.

---

## The rules that cannot be weakened

These are enforced by brute-force tests, not by review discipline.

1. **Any fever in a baby under 3 months returns EMERGENCY.** No exceptions, no
   combination of other inputs. A test sweeps every age/temperature/method
   combination under 3 months and asserts this.
2. **Any red flag returns EMERGENCY**, at any age, at any temperature, including
   a normal one. A test sweeps every flag × age × temperature.
3. **No path returns HOME for a baby under 3 months.** Asserted across the same
   sweep.
4. **AI never determines a medical result.** The Ask service has no code path
   into `packages/fever-rules`. Triage is deterministic and offline.
5. **No medication dosing appears anywhere in the product.** Not a drug name
   paired with an amount, not a frequency, not "the label says". Always defer to
   the pediatrician or the product label.
6. **When inputs are ambiguous, escalate.** Never de-escalate to look calmer.

## Things that look like details and are not

**Measurement method changes the answer.** An axillary reading runs about 1°F
below rectal. A 2-month-old with an armpit reading of 99.5°F has a
rectal-equivalent of 100.5°F, which is an emergency. If we had ignored method we
would have told that parent to go back to bed. The engine normalises every
reading to rectal-equivalent before any threshold is applied.

**Tympanic readings are unreliable under 6 months.** The engine returns
`methodCaution: true` and the UI must surface it.

**Implausible temperatures are rejected, not guessed.** A reading of 45°F or
200°F is a typo or a broken thermometer. Refusing is safe; guessing is not.

**Result copy runs high-to-low.** The current Figma fever article leads with a
green "Usually manageable at home" block. If an emergency-tier result flows into
that article, the first thing a frightened parent reads is advice to give a
sponge bath. Severity must render in descending order on every Health screen.

---

## Changing the rules

1. Open a PR that touches `packages/fever-rules/src/index.ts`. CODEOWNERS routes
   it to the Lead Engineer automatically.
2. Add or update cases in `index.test.ts` **in the same PR**. A rules change with
   no test change gets closed.
3. Never delete or weaken a case to make CI pass. If a case is wrong, that is a
   question for the clinical reviewer, not for a developer.
4. Bump `RULES_VERSION`. Every `fever_checks` row records the version that
   produced it, so any past triage decision can be reconstructed exactly.
5. Get clinical sign-off recorded in `REVIEW.md` before it reaches `main`.

## What we log, and why

Every check writes to `fever_checks`: the inputs, the rectal-equivalent, the tier,
**the rule ID that fired**, and the rules version. If a parent ever tells us the
app gave them bad guidance, we can reconstruct precisely what it said and why.
Without the rule ID and version, we could not.

That table is under Row Level Security and is never used for analytics or ad
targeting. It is infant health data.

## Standing disclaimers

Required on every screen of the relevant feature, non-dismissible:

- **Health** — the persistent 911 banner, above the fold, plus the educational
  disclaimer.
- **Track** — *"Milestones shown are general guidelines based on typical
  development and are not a diagnosis or medical prediction. Development varies
  by individual — talk to your healthcare provider with any concerns."* This copy
  is already approved in the Master sheet and is currently **missing from the
  Figma Track screen.**
- **Ask** — general information, not medical advice; symptom questions route to
  Health.
- **Cart** — curated suggestions, not medical necessity.
