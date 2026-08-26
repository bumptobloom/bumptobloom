# Seed data

Reference data that ships with the product. Owned by Natasha (Pod E).

| File | Source | Status |
|---|---|---|
| `milestones.sql` | CDC "Learn the Signs. Act Early." | Week 2 |
| `content.sql` | CDC / AAP / WHO derived | Week 3 |
| `products.sql` | curated, hand-written rationales | Week 4 |

Rules:

- Every row carries a `source_label`. Every card in the product shows where its
  advice came from.
- Milestones use the nine CDC checkpoints: 0, 2, 4, 6, 9, 12, 15, 18, 24 months.
- Four domains: physical, cognitive, language, social_emotional. The Master
  sheet lists social-emotional in one row and says "at least three types" in
  another; we store all four and treat the fourth as a should-have.
- Seeds are applied with the service role, never from the client.
