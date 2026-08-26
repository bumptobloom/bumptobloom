# Contributing

We are eleven part-time engineers across 12.5 hours of timezone. These rules
exist so that nobody has to wait for anybody.

## Start from the issue, not from your editor

Every piece of work on the board is a GitHub issue. Start there:

1. Open your issue on the project board.
2. In the right sidebar under **Development**, click **Create a branch**.
   GitHub names it for you and links it to the issue.
3. Check it out locally: `git fetch && git switch <branch-name>`
4. When you open the PR, keep `Closes #42` in the description.

That `Closes #` line is what makes the board run itself: the PR shows up in the
issue's "Linked pull requests" column, and merging it closes the issue and moves
the card to Done. Nobody drags anything.

If you branch by hand instead, name it `<pod>/<short-description>` —
`web/track-milestone-list`, `ask/prompt-versioning`, `data/cdc-seed` — and still
put `Closes #42` in the PR.

```
main       protected. production. only release PRs from develop.
develop    integration branch. everything merges here first.
```

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

- [ ] Works on a 390px viewport (we are mobile-first, not mobile-also)
- [ ] Loading and error states exist, not just the happy path
- [ ] No secret, key, or token in the diff
- [ ] RLS verified if it touches parent or baby data — test with two accounts
- [ ] Required disclaimer rendered if it's Track, Health, Ask, or Cart
- [ ] Tests added for logic; a screenshot added for UI
