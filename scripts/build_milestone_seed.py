"""Generate supabase/seed/milestones.sql from data/milestones/milestones.csv.

The CSV is the source of truth. This script only translates it. If a milestone
is wrong, fix the CSV and re-run:

    python3 scripts/build_milestone_seed.py

Run scripts/validate_milestones.py first — this script does not re-check
checkpoints, domains or source URLs.

Row identity is uuid5 over (checkpoint_month, domain, sort_order), not over the
title. That is deliberate: a mother's noticed milestones are stored in
baby_milestones by milestone_id, so if the id changed every time someone fixed a
typo in a title, re-seeding would silently wipe her progress. Renaming a
milestone is safe. Renumbering sort_order is not, and should be treated as
deleting one row and adding another.
"""

import csv
import uuid
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CSV_PATH = ROOT / "data" / "milestones" / "milestones.csv"
SQL_PATH = ROOT / "supabase" / "seed" / "milestones.sql"

# Fixed namespace. Changing this changes every id, which orphans every row in
# baby_milestones. Do not change it.
NAMESPACE = uuid.UUID("6f9619ff-8b86-d011-b42d-00c04fc964ff")

DOMAIN_ORDER = ["physical", "cognitive", "language", "social_emotional"]


def milestone_id(checkpoint: int, domain: str, sort_order: int) -> str:
    key = f"btb:milestone:{checkpoint}:{domain}:{sort_order}"
    return str(uuid.uuid5(NAMESPACE, key))


def sql_str(value: str | None) -> str:
    if value is None or value == "":
        return "null"
    return "'" + value.replace("'", "''") + "'"


def main() -> None:
    with CSV_PATH.open(newline="", encoding="utf-8") as handle:
        rows = list(csv.DictReader(handle))

    rows.sort(
        key=lambda r: (
            int(r["checkpoint_month"]),
            DOMAIN_ORDER.index(r["domain"]),
            int(r["sort_order"]),
        )
    )

    seen: set[tuple[int, str, int]] = set()
    lines: list[str] = []
    current_checkpoint: int | None = None

    for row in rows:
        checkpoint = int(row["checkpoint_month"])
        domain = row["domain"]
        sort_order = int(row["sort_order"])

        key = (checkpoint, domain, sort_order)
        if key in seen:
            raise SystemExit(
                f"Duplicate (checkpoint_month, domain, sort_order): {key}. "
                "Two rows would share an id and the second would overwrite the "
                "first. Fix sort_order in the CSV."
            )
        seen.add(key)

        if checkpoint != current_checkpoint:
            lines.append(f"  -- {checkpoint} MONTHS")
            current_checkpoint = checkpoint

        lines.append(
            "  (\n"
            f"    '{milestone_id(checkpoint, domain, sort_order)}',\n"
            f"    {sql_str(domain)},\n"
            f"    {checkpoint},\n"
            f"    {sql_str(row['title'])},\n"
            f"    {sql_str(row.get('description'))},\n"
            f"    {sql_str(row['source'])},\n"
            f"    {sql_str(row['source_url'])},\n"
            f"    {sort_order}\n"
            "  ),"
        )

    lines[-1] = lines[-1].rstrip(",")

    checkpoints = sorted({int(r["checkpoint_month"]) for r in rows})

    header = f"""-- ============================================================
-- MILESTONE SEED DATA
-- GENERATED FILE — do not edit by hand.
-- Source: data/milestones/milestones.csv
-- Regenerate: python3 scripts/build_milestone_seed.py
--
-- {len(rows)} milestones across {len(checkpoints)} CDC checkpoints
-- ({", ".join(str(c) for c in checkpoints)} months) and four domains.
--
-- Source: CDC "Learn the Signs. Act Early." Every row carries its own
-- source and source_url; the per-row values win over this comment.
--
-- Applied with the service role, never from the client. milestones has RLS
-- enabled and is readable by any signed-in parent, but writable by nobody.
--
-- Re-runnable. Ids are derived from (checkpoint_month, domain, sort_order),
-- so re-seeding updates rows in place and never breaks the baby_milestones
-- rows that record what a mother has already noticed.
-- ============================================================

insert into milestones (
  id, domain, checkpoint_month, title, description, source, source_url, sort_order
)
values
"""

    footer = """
on conflict (id) do update set
  domain = excluded.domain,
  checkpoint_month = excluded.checkpoint_month,
  title = excluded.title,
  description = excluded.description,
  source = excluded.source,
  source_url = excluded.source_url,
  sort_order = excluded.sort_order;
"""

    SQL_PATH.write_text(header + "\n".join(lines) + footer, encoding="utf-8")
    print(f"Wrote {SQL_PATH.relative_to(ROOT)} — {len(rows)} milestones")

    for checkpoint in checkpoints:
        per_domain = {
            d: sum(
                1
                for r in rows
                if int(r["checkpoint_month"]) == checkpoint and r["domain"] == d
            )
            for d in DOMAIN_ORDER
        }
        total = sum(per_domain.values())
        detail = ", ".join(f"{d}={n}" for d, n in per_domain.items())
        print(f"  {checkpoint:>2} months: {total:>2} ({detail})")


if __name__ == "__main__":
    main()
