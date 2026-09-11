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
| 9 | **`teardown_rls_test_dataset.sql`** | **Removes every fixture. Do not skip.** |

Steps 7 and 8 are a pair. If you run 7, you must run 8, or the babies policy
stays reversed.

The two Auth users, `mom-a@bumptobloom.test` and `mom-b@bumptobloom.test`, are
created by hand in the Supabase Auth dashboard and are not touched by any of
these scripts. Step 2 refuses to run if they do not exist.

## Why the teardown matters

`seed_rls_test_dataset.sql` ends in `COMMIT`, not `ROLLBACK`, because steps 3
to 6 run in separate sessions and need the rows to still be there. So nothing
cleans up on its own.

Most of the fixtures are scoped to the two test accounts and are invisible to
everyone else. Four are not. The milestone, activity, content and prompt version
rows live in shared reference tables that every user reads.

This has already bitten us once. The August fixtures were still in the
production database on 11 September: a milestone called "Test milestone" sitting
at the 6-month checkpoint, a published content row reading "Synthetic RLS test
content" which was the only row in the `content` table and therefore the one the
Home screen would have rendered, and a `prompt_versions` row marked active with
model `synthetic-model`.

Those four rows have since been made inert where possible. The milestone sits at
checkpoint 0, which the app never queries, and the prompt version is inactive so
it cannot be picked up as the live prompt. That is a second line of defence, not
a reason to skip step 9.
