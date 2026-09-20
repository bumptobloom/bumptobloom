# Seed data

Reference data that ships with the product. Owned by Pod I: milestones by
Sivathmika, Learn content and the product catalog by Sahasra.

| File | Source | Status |
|---|---|---|
| `milestones.sql` | CDC "Learn the Signs. Act Early." | Generated from `data/milestones/milestones_0_24.csv` by `scripts/build_milestone_seed.py`. Do not edit by hand. |
| `month_guidance.sql` | Vishnu's approved month-by-month copy | Generated from `data/milestones/month_typical.csv` by `scripts/build_milestone_seed.py`. Do not edit by hand. |
| `activities.sql` | Evidence-based developmental play (0–24mo) | Week 2 |
| `content.sql` | CDC / AAP / WHO derived | Week 3 |
| `products.sql` | curated, hand-written rationales | Week 4 |

Rules:

- Every row carries a `source_label`. Every card in the product shows where its
  advice came from.
- The app exposes month navigation from 0–24. Intermediate months deliberately
  repeat the younger CDC checkpoint content approved in the source dataset.
- Track displays physical, cognitive and language. Social-emotional rows remain
  in the database for a later release and are not queried in V1.
- Seeds are applied with the service role, never from the client.

## Deployment

Neither Vercel nor CI applies database changes or runs this directory. A
database release must apply pending files from `supabase/migrations` in numeric
order using the Supabase CLI or SQL editor. Migration
`0006_milestones_month_by_month_data.sql` contains the release snapshot of
`milestones.sql` and `month_guidance.sql`, so the month-by-month schema and its
required reference rows ship together; there is no separate production seed
step. The seed files remain the re-runnable source for local and development
environments.
