## What this does



## Why

<!-- Link the Monday item, or the ADR / contract section it implements. -->

## What breaks if this is wrong

<!-- Not optional. Your reviewer is nine timezones away and cannot ask. -->

## Checklist

- [ ] Works at 390px width
- [ ] Loading and error states, not just the happy path
- [ ] No secrets in the diff
- [ ] RLS tested with two accounts (if it touches parent/baby data)
- [ ] Required disclaimer rendered (Track / Health / Ask / Cart)
- [ ] Tests for logic, screenshot for UI
- [ ] `docs/API-CONTRACTS.md` updated if a shape changed

## Health feature only

- [ ] I read `docs/SAFETY.md`
- [ ] Test table updated in the same PR
- [ ] `RULES_VERSION` bumped
- [ ] No medication dosing anywhere in the diff
