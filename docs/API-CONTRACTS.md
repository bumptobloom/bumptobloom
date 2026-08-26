# API contracts

**Frozen at end of Week 1.** This document is what makes eleven part-time people
in five timezones able to work without waiting on each other. Frontend builds
against these shapes with mocks; backend builds to them. Neither blocks the other.

Changing a frozen contract requires a PR to this file approved by both affected
squad leads. Do not change a shape in code and document it afterwards.

Every route below except `/api/auth/*` requires a Supabase session.
All timestamps are ISO 8601 UTC. All IDs are UUIDs.

---

## Home

```
GET /api/home/:babyId
```

```json
{
  "baby": {
    "id": "uuid",
    "name": "Emma Rose",
    "birthDate": "2025-02-14",
    "ageMonths": 18.3,
    "ageLabel": "18 months",
    "avatarUrl": "https://…"
  },
  "thisWeek": {
    "contentId": "uuid",
    "title": "Month 18: what is typical",
    "excerpt": "By 18 months, toddlers combine…",
    "sourceLabel": "CDC Learn the Signs. Act Early."
  },
  "milestoneProgress": { "noticed": 6, "total": 9, "checkpointMonth": 18 }
}
```

`ageMonths` is computed server-side from `birthDate`. Clients must never compute
it themselves and must never cache it across days.

---

## Track

```
GET  /api/milestones?babyId=…            → milestones for the baby's checkpoint
POST /api/babies/:babyId/milestones      → { milestoneId } marks noticed
DELETE /api/babies/:babyId/milestones/:milestoneId
GET  /api/activities?babyId=…
POST /api/babies/:babyId/activities      → { activityId }
```

`GET /api/milestones` response:

```json
{
  "checkpointMonth": 18,
  "checkpoints": [0, 2, 4, 6, 9, 12, 15, 18, 24],
  "domains": [
    {
      "domain": "physical",
      "label": "Physical",
      "items": [
        { "id": "uuid", "title": "Walks up steps holding a hand", "noticed": false }
      ]
    }
  ],
  "disclaimer": "Milestones shown are general guidelines…"
}
```

All **four** domains are always returned — `physical`, `cognitive`, `language`,
`social_emotional`. The current Figma renders only three; `social_emotional` is
missing there and must be added. The `disclaimer` field is non-optional and the
client must render it.

---

## Learn

```
GET    /api/content?babyId=…&category=…
GET    /api/content/:id
POST   /api/content/:id/save
DELETE /api/content/:id/save
```

```json
{
  "items": [
    {
      "id": "uuid",
      "category": "sleep",
      "title": "Naps at 18 months",
      "excerpt": "…",
      "sourceLabel": "CDC-informed guidance",
      "sourceUrl": "https://…",
      "saved": false
    }
  ],
  "categories": ["developmental","feeding","sleep","diaper"]
}
```

`sourceLabel` is required on every item — PRD §11.4 requires visible attribution
on every card.

---

## Health — Fever Checker

```
POST /api/health/fever-check
GET  /api/health/fever-checks/:babyId
```

Request:

```json
{
  "babyId": "uuid",
  "tempF": 101.4,
  "method": "rectal",
  "redFlags": ["trouble_breathing"]
}
```

The client does **not** send age. The server derives it from `birth_date`, so a
stale client cannot produce a wrong triage.

Response:

```json
{
  "tier": "EMERGENCY",
  "ruleId": "R2_NEONATE_FEVER",
  "rectalEquivalentF": 101.4,
  "reasons": ["age_under_3_months", "fever_present"],
  "methodCaution": false,
  "rulesVersion": "2026.08.1",
  "checkId": "uuid"
}
```

`tier` is one of `HOME`, `CALL`, `EMERGENCY`. The client renders copy for the
tier — it never re-derives or overrides it. Severity renders high-to-low.

Validation failures return `422` with a machine-readable reason. **A validation
failure must never render as a reassuring result.** Show the error and the
emergency banner.

---

## Cart (route `/act`)

```
GET /api/recommendations/:babyId
GET /api/products/:id
GET /api/products/:id/retailers
```

```json
{
  "ageMonths": 18.3,
  "bucketLabel": "15–24 months",
  "products": [
    {
      "id": "uuid",
      "name": "Board Books Set",
      "rationale": "Supports the fast vocabulary growth typical at this age.",
      "indicativePriceCents": 1600,
      "imageUrl": "https://…",
      "retailers": [{ "slug": "amazon", "name": "Amazon", "url": "https://…" }]
    }
  ],
  "disclaimer": "Curated suggestions, not medical necessity…"
}
```

`rationale` is required — PRD §8.5 requires every card to say why. There is no
cart total and no checkout; per the design-change log, "Add to List" and all
payment steps are removed for the MVP.

---

## Ask

Ask runs inside the web app (ADR-001). There is no second service and no
cross-service contract — these are the routes the browser calls.

```
POST /api/ask     { "babyId": "uuid", "conversationId": "uuid|null", "question": "..." }
GET  /api/ask/conversations
GET  /api/ask/conversations/:id
```

Response:

```json
{
  "answer": "...",
  "conversationId": "uuid",
  "promptVersion": "2026.08.1",
  "model": "gpt-4o-mini",
  "validationOk": true,
  "redirectedToHealth": false
}
```

The handler, in order:

1. Verify the session and that this baby belongs to this parent.
2. Derive `ageMonths` from `birth_date`. The client never sends an age.
3. **Run `shouldRedirectToHealth()` from `packages/shared`.** If it returns true,
   return the Health hand-off and stop. No model call happens. PRD §8.7.
4. Build context — age in months and developmental stage only. **No name, no
   user id, no email.** Nothing identifying reaches OpenAI.
5. Call OpenAI, validate the response with Zod, log an `ai_runs` row.

`redirectedToHealth: true` means the client shows the Health hand-off instead of
answer text.

**Failure behaviour:** 15s timeout. On any error the client shows a plain
"couldn't reach the assistant" state. It never falls back to a cached or
generated answer, and it never degrades toward anything medical.
