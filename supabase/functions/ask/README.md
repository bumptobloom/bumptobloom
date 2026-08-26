# Ask — Supabase Edge Function

Deno + TypeScript. The only server code we write, and the only place the OpenAI
key exists.

```bash
supabase functions serve ask                    # local
supabase secrets set OPENAI_API_KEY=sk-...      # once, per project
supabase functions deploy ask
```

## Why this exists at all

The app could call OpenAI directly — and it would work, and the key would be
extractable from the app bundle by anyone who downloaded it. Then someone runs up
our bill, or worse, uses our key for something we get blamed for.

So: the app sends its Supabase JWT, this function verifies it, builds the prompt,
calls OpenAI, and returns the answer.

## What crosses the boundary

In: `babyAgeMonths`, a developmental stage string, the question, recent history.
**No name, no user id, no email.** Nothing that identifies a family reaches OpenAI.

Out: the answer, the prompt version, the model, and whether we redirected the
question to Health instead of answering it.

## The guard runs first

`shouldRedirectToHealth()` from `packages/shared` runs **before** the OpenAI call,
not after. We never generate text for a symptom question and then decide whether
to show it. See `docs/SAFETY.md`.

Contract: `docs/API-CONTRACTS.md` → "Ask".
