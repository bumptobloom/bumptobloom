# Contributing

We are eleven part-time engineers across 12.5 hours of timezone. These rules
exist so that nobody has to wait for anybody.

## Branches

```
main       protected. production. only release PRs from develop.
develop    integration branch. everything merges here first.
<pod>/<short-description>    your work
```

Pod prefixes: `platform/`, `app/`, `ask/`, `data/`.
Examples: `app/track-milestone-list`, `ask/prompt-versioning`, `data/cdc-seed`.

## Pull requests

- **Keep them under ~400 lines.** A reviewer nine timezones away cannot ask a
  quick clarifying question. Small PRs get reviewed in one pass; large ones sit
  for two days.
- One review required, **from someone outside your pod**. That is how knowledge
  crosses timezones here.
- Fill in the template. "What breaks if this is wrong" is not optional.
- CI must be green. Do not merge red and fix forward — the next person to pull
  is asleep and won't know.

## Commits

Conventional commits: `feat:`, `fix:`, `chore:`, `docs:`, `test:`, `refactor:`.
Scope with the pod where useful: `feat(ai): add prompt version pinning`.

## Code that needs extra care

`packages/fever-rules/**` is CODEOWNER-gated to the Lead Engineer, and a rules
change without a matching test change will be closed. Read `docs/SAFETY.md`.

`supabase/migrations/**` — never edit a migration that has been applied. Add a
new one. Migrations are numbered and run in order.

`docs/API-CONTRACTS.md` is frozen after Week 1. Changing a shape means a PR here
approved by both affected pod leads, before the code changes.

## Definition of done

- [ ] Tested on a phone browser and a laptop — it has to work on both
- [ ] Loading and error states exist, not just the happy path
- [ ] No secret, key, or token in the diff
- [ ] RLS verified if it touches parent or baby data — test with two accounts
- [ ] Required disclaimer rendered if it's Track, Health, Ask, or Cart
- [ ] Tests added for logic; a screenshot added for UI
