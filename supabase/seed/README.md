# Seed data

Reference data that ships with the product. Owned by Natasha (Pod E).

| File | Source | Status |
|---|---|---|
| `milestones.sql` | CDC "Learn the Signs. Act Early." | Week 2 |
| `content.sql` | CDC / AAP / WHO derived | Week 3 |
| `products.sql` | curated, hand-written rationales | Week 4 |

Rules:

- Every row carries a `source_label`. PRD §11.4 requires visible attribution on
  every card in the product.
- Milestones use the nine PRD checkpoints: 0, 2, 4, 6, 9, 12, 15, 18, 24 months.
- **All four domains** are required at every checkpoint: physical, cognitive,
  language, social_emotional. The current Figma shows only three — that is a
  design bug, not a data decision.
- Seeds are applied with the service role, never from the client.
