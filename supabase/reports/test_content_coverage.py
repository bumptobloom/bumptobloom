"""
Tests for content_coverage.py. Run: python3 test_content_coverage.py
"""
import tempfile
from pathlib import Path

from content_coverage import (
    parse_content_sql, discover_categories, build_matrix, flag_gaps,
    rank_gaps, find_off_checkpoint_rows, mock_content_rows, CHECKPOINTS,
)

failures = []


def check(label, condition):
    if condition:
        print(f"PASS {label}")
    else:
        print(f"FAIL {label}")
        failures.append(label)


# --- parse_content_sql: tricky quoting cases ---
SAMPLE_SQL = """
-- a full-line comment, must be stripped
insert into content (
  id, category, title, body, min_age_month, max_age_month,
  source_label, source_url, version, published
) values
  (
    'id-1',
    'feeding',
    'Curly quote: Baby's Cues',
    'Body with a curly apostrophe, a comma, in it, and (parens too).',
    0,
    2,
    'Source',
    'https://example.com',
    1,
    true
  ),
  (
    'id-2',
    'sleep',
    'Escaped quote test',
    'It''s escaped with two single quotes, valid SQL.',
    3,
    5,
    'Source',
    null,
    1,
    false
  );
"""
# Note: the "curly" quote above is a real unicode apostrophe, not ASCII.
SAMPLE_SQL = SAMPLE_SQL.replace("Baby's Cues", "Baby\u2019s Cues")

with tempfile.TemporaryDirectory() as tmp:
    path = Path(tmp) / "content.sql"
    path.write_text(SAMPLE_SQL, encoding="utf-8")
    rows = parse_content_sql(path)

    check("parses correct row count", len(rows) == 2)
    check("comment line stripped, didn't break parsing", len(rows) == 2)
    check("curly apostrophe preserved, not treated as delimiter",
          rows[0]["title"] == "Curly quote: Baby\u2019s Cues")
    check("comma inside quoted body did not split the field",
          "comma, in it" in rows[0]["body"])
    check("parens inside quoted body did not break tuple boundaries",
          "(parens too)" in rows[0]["body"])
    check("escaped '' unescapes to single '",
          rows[1]["body"] == "It's escaped with two single quotes, valid SQL.")
    check("integer fields parsed as int", rows[0]["min_age_month"] == 0 and rows[0]["max_age_month"] == 2)
    check("boolean true parsed correctly", rows[0]["published"] is True)
    check("boolean false parsed correctly", rows[1]["published"] is False)
    check("null parsed as None", rows[1]["source_url"] is None)

# --- malformed file: wrong field count should raise, not silently misparse ---
BAD_SQL = """
insert into content (id, category) values
  ('only-one-field');
"""
with tempfile.TemporaryDirectory() as tmp:
    path = Path(tmp) / "bad.sql"
    path.write_text(BAD_SQL, encoding="utf-8")
    try:
        parse_content_sql(path)
        check("wrong field count raises instead of silently misparsing", False)
    except ValueError:
        check("wrong field count raises instead of silently misparsing", True)

# --- discover_categories: dynamic, not hardcoded ---
rows = mock_content_rows()
categories = discover_categories(rows)
check("categories discovered dynamically from data, not a hardcoded 4",
      categories == sorted({"feeding", "sleep", "crying_soothing", "mom_wellbeing"}))
check("category set can differ from the old fixed 4-category list",
      "developmental" not in categories and "diaper" not in categories)

# --- build_matrix / flag_gaps with dynamic categories ---
matrix = build_matrix(rows, categories)
check("matrix has all checkpoints", set(matrix.keys()) == set(CHECKPOINTS))
check("matrix columns match discovered categories, not a fixed list",
      set(matrix[2].keys()) == set(categories))
check("published sleep row at cp2 correctly counted", matrix[2]["sleep"] == 1)
check("published row correctly counted", matrix[2]["feeding"] == 1)
check("published row at cp6 counted for two categories", matrix[6]["feeding"] == 1 and matrix[6]["crying_soothing"] == 1)
check("category with zero rows anywhere near cp2 is truly empty", matrix[2]["crying_soothing"] == 0)

# Dedicated, unambiguous check that an unpublished row contributes nothing
unpub_only = [{"category": "x", "min_age_month": 0, "max_age_month": 2, "published": False}]
unpub_matrix = build_matrix(unpub_only, ["x"])
check("a category with only an unpublished row shows zero, not one", unpub_matrix[2]["x"] == 0)

gaps = flag_gaps(matrix, categories)
gap_lookup = {(cp, cat): (count, sev) for cp, cat, count, sev in gaps}
check("zero-count cell flagged EMPTY", gap_lookup[(2, "crying_soothing")] == (0, "EMPTY"))
check("count-of-1 cell flagged NEAR-EMPTY", gap_lookup[(2, "feeding")] == (1, "NEAR-EMPTY"))

ranked = rank_gaps(gaps)
check("ranking preserves all gaps", len(ranked) == len(gaps))
cp6_gaps = [g for g in ranked if g[0] == 6]
check("demo checkpoint (6) gaps rank before others", ranked[0][0] == 6 if cp6_gaps else True)

# --- find_off_checkpoint_rows: the actual real-data scenario ---
off_rows = [
    {"category": "feeding", "min_age_month": 3, "max_age_month": 5, "published": True},  # off
    {"category": "sleep", "min_age_month": 0, "max_age_month": 2, "published": True},    # on (cp2)
    {"category": "sleep", "min_age_month": 3, "max_age_month": 5, "published": False},   # off but unpublished
]
off = find_off_checkpoint_rows(off_rows)
check("off-checkpoint published row is detected", len(off) == 1)
check("unpublished off-checkpoint row is NOT flagged (irrelevant either way)",
      off[0]["category"] == "feeding")

# --- boundary: max_age_month inclusive ---
boundary_rows = [{"category": "sleep", "min_age_month": 0, "max_age_month": 6, "published": True}]
b_categories = discover_categories(boundary_rows)
b_matrix = build_matrix(boundary_rows, b_categories)
check("max_age_month boundary is inclusive (6 counts when max=6)", b_matrix[6]["sleep"] == 1)
check("checkpoint just past max_age_month not counted", b_matrix[12]["sleep"] == 0)

# --- empty dataset ---
empty_matrix = build_matrix([], [])
check("empty content list doesn't crash", empty_matrix == {cp: {} for cp in CHECKPOINTS})

print()
if failures:
    print(f"{len(failures)} test(s) FAILED: {failures}")
    exit(1)
else:
    print("All tests passed.")
