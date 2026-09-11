# RLS tests

These scripts prove the security model: that a signed-in mother can read her own
rows and nobody else's, that an anonymous visitor gets nothing, and that the
admin-only tables are unreachable from a normal session.

## Running them

Run in this order, in the Supabase SQL editor or via psql. **The teardown is
part of the run, not an optional extra.**

| Step | Script | What it does |
|---|---|---|
| 1 | `confirm_schema_and_rls.sql` | Checks RLS is enabled everywhere it should be |
| 2 | `seed_rls_test_dataset.sql` | Creates the fixtures |
| 3 | `verify_account_a.sql` | Run as mom-a. Sees only A's rows |
| 4 | `verify_account_b.sql` | Run as mom-b. Sees only B's rows |
| 5 | `anonymous_access_test.sql` | Signed out. Sees nothing |
| 6 | `verify_private_table_total_counts.sql` | Admin-only tables return zero |
| 7 | `negative_control_reverse_babies_policy.sql` | Breaks a policy on purpose, proves the tests catch it |
| 8 | `restore_own_babies_policy.sql` | Puts that policy back |
| 9 | `teardown_rls_test_dataset.sql` | Only on a scratch database. See below. |

Steps 7 and 8 are a pair. If you run 7, you must run 8, or the babies policy
stays reversed.

The two Auth users, `mom-a@bumptobloom.test` and `mom-b@bumptobloom.test`, are
created by hand in the Supabase Auth dashboard and are not touched by any of
these scripts. Step 2 refuses to run if they do not exist.

## Why the fixtures stay

`seed_rls_test_dataset.sql` ends in `COMMIT`, not `ROLLBACK`, because steps 3
to 6 run in separate sessions and need the rows to still be there. The fixtures
are meant to live permanently in the shared database.

**Do not tear them down on the shared database as tidy-up.** CI runs
`btb_rls_check.py` on every pull request and that script asserts the nine
per-account rows exist. Delete them and the RLS isolation suite fails on every
PR, including ones that touch nothing but CSS. That happened on 11 September
2026 and blocked an unrelated PR.

The per-account rows are safe to leave. RLS scopes them, so only the two test
accounts can see them.

The four shared reference rows were the real risk, because they sit in tables
every user reads. On 11 September the August fixtures were still live: a
milestone called "Test milestone" at the 6-month checkpoint, a published
content row reading "Synthetic RLS test content" which was the only row in the
`content` table and therefore the one the Home screen would have rendered, an
activity spanning 0 to 24 months, and a `prompt_versions` row marked active
with model `synthetic-model`.

All four are now inert by construction rather than by clean-up:

| Row | Made harmless by |
|---|---|
| milestone | checkpoint 0, which the app never queries |
| activity | narrowed to 24–24 months, the smallest window the schema allows |
| content | `published = false`, so the read policy hides it from everyone |
| prompt version | `active = false`, so it can never become the live prompt |

The teardown is for scratch and branch databases, or for a deliberate clean
slate you intend to re-seed straight away.
