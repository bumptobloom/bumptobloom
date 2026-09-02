# API contracts

**Frozen at end of Week 1.** This document is what makes eleven part-time people
in five timezones able to work without waiting on each other. Frontend builds
against these shapes with mocks; backend builds to them. Neither blocks the other.

Changing a frozen contract requires a PR to this file approved by both affected
squad leads. Do not change a shape in code and document it afterwards.

**This is a Next.js app.** Reads happen in Server Components using the user's
session; writes and anything needing a secret go through Server Actions or route
handlers. Row Level Security still guards every table.

Everything requires a Supabase session. All timestamps are ISO 8601 UTC. All IDs
are UUIDs. Shapes below are what `apps/web/src/lib/api/` returns, so pages never
see raw table rows.

---

## Home

Owned by Sahasra Miriyala (Pod I) · Implementation landing in Week 2.

```ts
getHome(babyId?: string): Promise<HomeData>     // apps/web/src/lib/api/home.ts
```

### TypeScript Types

```ts
export interface BabySummary {
  id: string;
  name: string;
  birthDate: string;        // ISO 8601 date string (YYYY-MM-DD)
  dueDate?: string | null;  // ISO 8601 date string, set for preterm babies
  ageMonths: number;        // Derived server-side, never stored or cached across days
  ageLabel: string;         // e.g. "18 months", "3 weeks", "Newborn"
  avatarUrl: string | null;
}

export interface ThisWeekGuidance {
  contentId: string;
  title: string;
  excerpt: string;
  sourceLabel: string;      // Required source attribution (e.g. "CDC Learn the Signs. Act Early.")
  sourceUrl?: string | null;
}

export interface MilestoneProgress {
  noticed: number;
  total: number;
  checkpointMonth: number;
}

export interface HomeData {
  baby: BabySummary | null; // Null if parent has not registered a baby yet
  thisWeek: ThisWeekGuidance | null;
  milestoneProgress: MilestoneProgress | null;
  disclaimer: string;
}
```

### Return Shape (JSON)

```json
{
  "baby": {
    "id": "uuid",
    "name": "Emma Rose",
    "birthDate": "2025-02-14",
    "dueDate": null,
    "ageMonths": 18.3,
    "ageLabel": "18 months",
    "avatarUrl": "https://…"
  },
  "thisWeek": {
    "contentId": "uuid",
    "title": "Month 18: what is typical",
    "excerpt": "By 18 months, toddlers combine…",
    "sourceLabel": "CDC Learn the Signs. Act Early.",
    "sourceUrl": "https://…"
  },
  "milestoneProgress": {
    "noticed": 6,
    "total": 9,
    "checkpointMonth": 18
  },
  "disclaimer": "BumpToBloom is an educational tool, not a medical device. Always consult your paediatrician for clinical concerns."
}
```

- `ageMonths` is computed server-side from `birthDate` (using standard month extraction). Clients must never compute it themselves and must never cache it across days.
- If `babyId` is omitted, defaults to the user's primary/active baby.
- If a parent has no registered baby yet, returns `{ baby: null, thisWeek: null, milestoneProgress: null, disclaimer: "..." }`. The Home screen renders the "Add your baby" prompt instead of crashing.
- `disclaimer` is mandatory and rendered standing at the bottom of the Home view.

---

## Track

```ts
getMilestones(babyId: string): Promise<MilestonesResponse>   // milestones for baby's checkpoint
markMilestone(babyId: string, milestoneId: string): Promise<void>
unmarkMilestone(babyId: string, milestoneId: string): Promise<void>
getActivities(babyId: string): Promise<ActivityItem[]>
markActivity(babyId: string, activityId: string): Promise<void>
```

`getMilestones` returns:

```json
{
  "checkpointMonth": 18,
  "checkpoints": [2, 6, 12, 18, 24],
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

Owned by Sahasra Miriyala (Pod I) · Implementation landing in Week 3.

```ts
getContent(babyId: string, category?: LearnCategory): Promise<LearnFeedResponse>
getContentItem(id: string): Promise<LearnItemDetail>
saveContent(id: string): Promise<SaveContentResult>
unsaveContent(id: string): Promise<SaveContentResult>
getSavedContent(babyId?: string): Promise<LearnItem[]>
```

### TypeScript Types

```ts
export type LearnCategory = 'developmental' | 'feeding' | 'sleep' | 'diaper';

export interface LearnItem {
  id: string;
  category: LearnCategory;
  title: string;
  excerpt: string;
  sourceLabel: string;      // Required on every item — cites clinical/educational source
  sourceUrl: string | null;
  saved: boolean;           // Computed for authenticated parent
}

export interface LearnItemDetail extends LearnItem {
  body: string;             // Full educational guide / article markdown
  minAgeMonth: number;
  maxAgeMonth: number;
}

export interface LearnFeedResponse {
  items: LearnItem[];
  categories: LearnCategory[];
  activeCategory?: LearnCategory | 'all';
}

export interface SaveContentResult {
  saved: boolean;
  contentId: string;
  savedAt?: string;
}
```

### Return Shape (JSON)

```json
{
  "items": [
    {
      "id": "uuid",
      "category": "sleep",
      "title": "Naps at 18 months",
      "excerpt": "Most toddlers at 18 months transition to one afternoon nap…",
      "sourceLabel": "CDC-informed guidance",
      "sourceUrl": "https://…",
      "saved": false
    }
  ],
  "categories": ["developmental", "feeding", "sleep", "diaper"],
  "activeCategory": "all"
}
```

- **Categories**: Exactly 4 agreed categories per Master Sheet (ADR-002): `developmental`, `feeding`, `sleep`, `diaper`.
- **Age filtering**: `getContent` returns content where `baby.ageMonths` falls within `[min_age_month, max_age_month]`.
- `sourceLabel` is required on every item. Every card shows where its advice came from — that is what separates this from a forum post.
- `saved` is resolved per authenticated parent profile. `saveContent` and `unsaveContent` run as Server Actions.
- `getContentItem` retrieves full article content for modal/detail views.
- Pages never see raw database columns (e.g., `published` flags, internal `version`, or snake_case fields).

---

## Health — Fever Checker

**Runs in the browser.** No network call, so it works offline.

```ts
import { assessFever } from '@btb/fever-rules';

const result = assessFever({ ageMonths, tempF, method, redFlags });
// then, fire and forget:
fetch('/api/health/fever-check', { method: 'POST', body: JSON.stringify({ ... }) });
```

Input:

```json
{
  "babyId": "uuid",
  "tempF": 101.4,
  "method": "rectal",
  "redFlags": ["trouble_breathing"]
}
```

`ageMonths` is derived from the `birth_date` we fetched from the database. The
app never asks the parent for an age and never stores one.

Result:

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

`assessFever` throws `FeverInputError` on impossible input. **A validation failure
must never render as a reassuring result.** Catch it, show the error and the
emergency banner.

If the logging POST fails, do nothing about it. The parent already has their
answer; a logging failure must never surface as an error on this page.

---

## Cart (route `/act`)

```ts
getRecommendations(babyId)
getProduct(id)
```

Retailer links are plain search URLs — no affiliate programme, no tracking:
`https://www.amazon.com/s?k=belly+oil+for+pregnancy`

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

`rationale` is required — a recommendation without a reason is just an advert.
There is no
cart total and no checkout; per the design-change log, "Add to List" and all
payment steps are removed for the MVP.

---

## Ask

Ask is a **Next.js route handler**, because it needs the OpenAI key and that key
must never reach the browser.

```
POST /api/ask     { "babyId": "uuid", "conversationId": "uuid|null", "question": "..." }
GET  /api/ask/conversations
GET  /api/ask/conversations/:id
```

Conversation history can also be read in a Server Component with RLS — no route
needed for that half.

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
   return the Health hand-off and stop. No model call happens.
4. Build context — age in months and developmental stage only. **No name, no
   user id, no email.** Nothing identifying reaches OpenAI.
5. Call OpenAI, validate the response with Zod, log an `ai_runs` row.

`redirectedToHealth: true` means the client shows the Health hand-off instead of
answer text.

**Failure behaviour:** 15s timeout. On any error the app shows a plain "couldn't
reach the assistant" state. It never falls back to a cached or generated answer,
and it never degrades toward anything medical.

Unlike the fever checker, Ask genuinely needs a connection. When the service
worker reports offline, say so plainly rather than letting the request hang.
