# Seed data

Reference data that ships with the product. Owned by Pod I: milestones by
Sivathmika, Learn content and the product catalog by Sahasra.

| File | Source | Status |
|---|---|---|
<<<<<<< HEAD
| `milestones.sql` | CDC "Learn the Signs. Act Early." | Week 2 |
| `activities.sql` | Evidence-based developmental play (0–24mo) | Week 2 |
=======
| `milestones.sql` | CDC "Learn the Signs. Act Early." | Generated from `data/milestones/milestones.csv` by `scripts/build_milestone_seed.py`. Do not edit by hand. |
>>>>>>> 9fe0116 (feat(data): generate milestone seed SQL from the CDC CSV)
| `content.sql` | CDC / AAP / WHO derived | Week 3 |
| `products.sql` | curated, hand-written rationales | Week 4 |

Rules:

- Every row carries a `source_label`. Every card in the product shows where its
  advice came from.
- Milestones use five CDC checkpoints for v1: 2, 6, 12, 18, 24 months.
  The CDC also publishes 0, 4, 9 and 15. Those are additive: adding them later
  is new rows, not a migration.
- Four domains: physical, cognitive, language, social_emotional. The Master
  sheet lists social-emotional in one row and says "at least three types" in
  another; we store all four and treat the fourth as a should-have.
- Seeds are applied with the service role, never from the client.
