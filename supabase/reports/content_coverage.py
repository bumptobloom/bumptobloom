"""
Content coverage matrix — Learn tab.

Reads supabase/seed/content.sql directly (no DB, no credentials) and counts
published rows per (checkpoint x category) cell. Categories are discovered
from the file, not hardcoded — the category set is still under review.

Usage:
    python3 content_coverage.py --content-sql supabase/seed/content.sql
    python3 content_coverage.py --mock
"""

import argparse
import csv
import re
import sys
from datetime import datetime, timezone
from pathlib import Path

# Track's 5 v1 checkpoints (docs/API-CONTRACTS.md, supabase/seed/README.md).
CHECKPOINTS = [2, 6, 12, 18, 24]

# Column order in content.sql's INSERT statement. Update if that changes.
COLUMNS = [
    "id", "category", "title", "body", "min_age_month", "max_age_month",
    "source_label", "source_url", "version", "published",
]

# Demo baby checkpoint per Keya: ranks first in the gap list. Only affects
# this report — unrelated to the real Learn feed, which uses each baby's
# actual age.
DEMO_BABY_CHECKPOINT_MONTHS = 6
FALLBACK_PRIORITY_ORDER = [2, 6, 12, 18, 24]


def strip_sql_comments(text: str) -> str:
    """Removes full-line `-- ...` comments."""
    return "\n".join(
        line for line in text.splitlines() if not line.strip().startswith("--")
    )


def split_top_level(text: str, sep: str = ",") -> list[str]:
    """Splits on `sep` at the top level only — ignores `sep` inside a quoted
    string (with '' as an escaped quote) or inside parentheses."""
    parts, current = [], []
    in_string = False
    depth = 0
    i, n = 0, len(text)
    while i < n:
        ch = text[i]
        if in_string:
            if ch == "'":
                if i + 1 < n and text[i + 1] == "'":
                    current.append("''")
                    i += 2
                    continue
                in_string = False
            current.append(ch)
        else:
            if ch == "'":
                in_string = True
                current.append(ch)
            elif ch == "(":
                depth += 1
                current.append(ch)
            elif ch == ")":
                depth -= 1
                current.append(ch)
            elif ch == sep and depth == 0:
                parts.append("".join(current))
                current = []
            else:
                current.append(ch)
        i += 1
    parts.append("".join(current))
    return parts


def extract_top_level_tuples(text: str) -> list[str]:
    """Finds each top-level `(...)` row tuple, respecting quoted strings."""
    tuples = []
    in_string = False
    depth = 0
    start = None
    i, n = 0, len(text)
    while i < n:
        ch = text[i]
        if in_string:
            if ch == "'":
                if i + 1 < n and text[i + 1] == "'":
                    i += 2
                    continue
                in_string = False
            i += 1
            continue
        if ch == "'":
            in_string = True
        elif ch == "(":
            if depth == 0:
                start = i + 1
            depth += 1
        elif ch == ")":
            depth -= 1
            if depth == 0 and start is not None:
                tuples.append(text[start:i])
                start = None
        i += 1
    return tuples


def parse_sql_value(raw: str):
    v = raw.strip()
    if v.startswith("'") and v.endswith("'"):
        return v[1:-1].replace("''", "'")
    if v.lower() == "null":
        return None
    if v.lower() == "true":
        return True
    if v.lower() == "false":
        return False
    try:
        return int(v)
    except ValueError:
        try:
            return float(v)
        except ValueError:
            return v


def parse_content_sql(path: Path) -> list[dict]:
    """Parses content.sql's INSERT ... VALUES (...), (...) into row dicts."""
    text = strip_sql_comments(path.read_text(encoding="utf-8"))

    match = re.search(r"\bvalues\b", text, re.IGNORECASE)
    if not match:
        raise ValueError(f"No VALUES clause found in {path}")
    values_section = text[match.end():]

    raw_tuples = extract_top_level_tuples(values_section)
    if not raw_tuples:
        raise ValueError(f"Found VALUES but no row tuples in {path}")

    rows = []
    for idx, raw_tuple in enumerate(raw_tuples):
        fields = split_top_level(raw_tuple, ",")
        if len(fields) != len(COLUMNS):
            raise ValueError(
                f"Row {idx} in {path} has {len(fields)} fields, expected "
                f"{len(COLUMNS)} ({COLUMNS}). Raw tuple started: {raw_tuple[:80]!r}"
            )
        rows.append({col: parse_sql_value(val) for col, val in zip(COLUMNS, fields)})
    return rows


def mock_content_rows():
    """Fake data for --mock: dynamic categories, one unpublished row, one
    off-checkpoint row."""
    return [
        {"category": "feeding", "min_age_month": 0, "max_age_month": 2, "published": True},
        {"category": "sleep", "min_age_month": 0, "max_age_month": 2, "published": True},
        {"category": "feeding", "min_age_month": 6, "max_age_month": 8, "published": True},
        {"category": "crying_soothing", "min_age_month": 6, "max_age_month": 8, "published": True},
        {"category": "mom_wellbeing", "min_age_month": 3, "max_age_month": 5, "published": True},
        {"category": "sleep", "min_age_month": 0, "max_age_month": 24, "published": False},
    ]


def discover_categories(rows) -> list[str]:
    return sorted({r["category"] for r in rows if r.get("category")})


def build_matrix(rows, categories):
    matrix = {cp: {cat: 0 for cat in categories} for cp in CHECKPOINTS}
    for row in rows:
        if not row.get("published"):
            continue
        cat = row.get("category")
        if cat not in categories:
            continue
        lo, hi = row.get("min_age_month"), row.get("max_age_month")
        if lo is None or hi is None:
            continue
        for cp in CHECKPOINTS:
            if lo <= cp <= hi:
                matrix[cp][cat] += 1
    return matrix


def find_off_checkpoint_rows(rows):
    """Published rows whose range doesn't include any checkpoint — not a
    bug, just invisible to a checkpoint-exact grid."""
    off = []
    for row in rows:
        if not row.get("published"):
            continue
        lo, hi = row.get("min_age_month"), row.get("max_age_month")
        if lo is None or hi is None:
            continue
        if not any(lo <= cp <= hi for cp in CHECKPOINTS):
            off.append(row)
    return off


def flag_gaps(matrix, categories):
    gaps = []
    for cp in CHECKPOINTS:
        for cat in categories:
            count = matrix[cp][cat]
            if count == 0:
                gaps.append((cp, cat, count, "EMPTY"))
            elif count == 1:
                gaps.append((cp, cat, count, "NEAR-EMPTY"))
    return gaps


def rank_gaps(gaps):
    if DEMO_BABY_CHECKPOINT_MONTHS is not None and DEMO_BABY_CHECKPOINT_MONTHS not in CHECKPOINTS:
        raise ValueError(
            f"DEMO_BABY_CHECKPOINT_MONTHS={DEMO_BABY_CHECKPOINT_MONTHS} is not "
            f"one of {CHECKPOINTS}."
        )
    ordered = []
    if DEMO_BABY_CHECKPOINT_MONTHS is not None:
        ordered.append(DEMO_BABY_CHECKPOINT_MONTHS)
    ordered += [cp for cp in FALLBACK_PRIORITY_ORDER if cp not in ordered]
    priority_index = {cp: i for i, cp in enumerate(ordered)}
    severity_order = {"EMPTY": 0, "NEAR-EMPTY": 1}
    return sorted(
        gaps,
        key=lambda g: (priority_index.get(g[0], 999), severity_order[g[3]], g[0], g[1]),
    )


def write_matrix_csv(matrix, categories, path):
    with open(path, "w", newline="") as f:
        w = csv.writer(f)
        w.writerow(["checkpoint_month"] + categories)
        for cp in CHECKPOINTS:
            w.writerow([cp] + [matrix[cp][cat] for cat in categories])


def write_gaps_report(ranked_gaps, matrix, categories, off_checkpoint_rows,
                       path, generated_at, mock, total_rows, source_path):
    with open(path, "w") as f:
        f.write("# Learn content coverage — gaps\n\n")
        f.write(f"Generated: {generated_at}\n")
        f.write(f"Source: {'MOCK DATA — not real' if mock else source_path}\n")
        f.write(f"Categories found ({len(categories)}, not hardcoded): {', '.join(categories)}\n")
        f.write(f"Total published content rows considered: {total_rows}\n\n")

        if off_checkpoint_rows:
            f.write(
                f"> **{len(off_checkpoint_rows)} published row(s) fall outside every "
                f"checkpoint** {CHECKPOINTS} — not counted below. Ranges: " +
                ", ".join(f"{r['min_age_month']}-{r['max_age_month']}mo/{r['category']}"
                          for r in off_checkpoint_rows) + "\n\n"
            )

        f.write(
            f"> Demo baby checkpoint: **{DEMO_BABY_CHECKPOINT_MONTHS}mo** (ranked first). "
            f"Fallback order: `{FALLBACK_PRIORITY_ORDER}`.\n\n"
        )

        f.write("## Full grid\n\n")
        f.write("| Checkpoint | " + " | ".join(categories) + " |\n")
        f.write("|---" * (len(categories) + 1) + "|\n")
        for cp in CHECKPOINTS:
            cells = []
            for cat in categories:
                count = matrix[cp][cat]
                marker = " ⚠️EMPTY" if count == 0 else (" ⚠️near-empty" if count == 1 else "")
                cells.append(f"{count}{marker}")
            f.write(f"| {cp}mo | " + " | ".join(cells) + " |\n")

        f.write(f"\n## Gaps ranked for content writers ({len(ranked_gaps)} total)\n\n")
        if not ranked_gaps:
            f.write("None — every cell has 2+ published items.\n")
        else:
            f.write("| Rank | Checkpoint | Category | Count | Severity |\n")
            f.write("|---|---|---|---|---|\n")
            for i, (cp, cat, count, severity) in enumerate(ranked_gaps, start=1):
                f.write(f"| {i} | {cp}mo | {cat} | {count} | {severity} |\n")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--mock", action="store_true", help="Use fake data.")
    parser.add_argument("--content-sql", default="supabase/seed/content.sql")
    parser.add_argument("--out-dir", default=".")
    args = parser.parse_args()

    generated_at = datetime.now(timezone.utc).isoformat()

    if args.mock:
        print("MOCK MODE — fake data, do not commit this output.")
        rows = mock_content_rows()
        source_path = "mock"
    else:
        source_path = args.content_sql
        content_path = Path(source_path)
        if not content_path.exists():
            sys.stderr.write(f"File not found: {content_path}\n")
            sys.exit(1)
        try:
            rows = parse_content_sql(content_path)
        except ValueError as e:
            sys.stderr.write(f"Failed to parse {content_path}: {e}\n")
            sys.exit(1)

    categories = discover_categories(rows)
    published_rows = [r for r in rows if r.get("published")]
    off_checkpoint = find_off_checkpoint_rows(rows)
    matrix = build_matrix(rows, categories)
    gaps = flag_gaps(matrix, categories)
    ranked = rank_gaps(gaps)

    out_dir = Path(args.out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    matrix_path = out_dir / "coverage_matrix.csv"
    gaps_path = out_dir / "coverage_gaps.md"

    write_matrix_csv(matrix, categories, matrix_path)
    write_gaps_report(ranked, matrix, categories, off_checkpoint, gaps_path,
                       generated_at, args.mock, len(published_rows), source_path)

    print(f"Categories found: {categories}")
    print(f"{len(published_rows)} published content rows considered.")
    if off_checkpoint:
        print(f"WARNING: {len(off_checkpoint)} row(s) fall outside every checkpoint — see report.")
    print(f"{len(gaps)} of {len(CHECKPOINTS) * len(categories)} cells are empty or near-empty.")
    print(f"Wrote {matrix_path} and {gaps_path}")


if __name__ == "__main__":
    main()
