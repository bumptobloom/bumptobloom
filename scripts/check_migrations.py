#!/usr/bin/env python3
"""Two file-level checks on supabase/migrations. No database, no credentials.

Written 29 Sep after the same two migrations were renumbered three times in
one day, and after a stale filename in a comment survived four rounds of
review. Both were caught by people reading Discord threads. Neither needs to
be.

  1. Every migration is NNNN_name.sql and no two share a number.

     On a pull_request event GitHub builds the merge commit, so this runs
     against the PR merged into main. That is what catches the case that
     actually breaks: PR A merges taking 0010, then PR B -- which also has
     0010 -- goes red the moment it rebuilds, instead of someone noticing by
     hand. It cannot see two open PRs colliding before either has merged;
     that needs the API and is a bigger job than this.

  2. Nothing in the repo refers to a migration filename that does not exist.

     Comments, docs and tests name migrations constantly. When a file is
     renumbered those references go stale and quietly point at the wrong
     migration, which is worse than pointing at nothing: 0010 was the Ask
     feedback migration and the range test's header still called it
     0010_temperature_readings_range.sql.

Run locally the same way CI does:

    python3 scripts/check_migrations.py
"""

import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
MIGRATIONS = ROOT / "supabase" / "migrations"

# NNNN_lower_snake_case.sql
FILENAME_RE = re.compile(r"^(\d{4})_([a-z0-9]+(?:_[a-z0-9]+)*)\.sql$")

# A reference to a migration file anywhere in the repo.
REFERENCE_RE = re.compile(r"\b(\d{4}_[a-z0-9_]+\.sql)\b")

# Directories that are not ours to police.
SKIP_DIRS = {".git", "node_modules", ".next", ".btb-draft", "dist", "build", ".venv"}

# This checker and its tests are the only files in the repo that name migrations
# which are deliberately not real: the docstring above quotes the stale 0010
# reference that motivated check 2, the bad-filename error shows an example
# name, and every reference test is built from fixture names. Scanning them
# makes check 2 fail on the checker itself -- 15 problems on a clean tree, red
# on every PR, which is exactly how this landed the first time. The cost is
# that a genuinely stale reference inside these two files is the one place
# check 2 cannot help. That is the price of having check 2 at all.
SKIP_FILES = {
    "scripts/check_migrations.py",
    "scripts/test_check_migrations.py",
}


def tracked_files() -> list[Path]:
    """Only files git knows about, so a stray local file cannot fail CI."""
    out = subprocess.run(
        ["git", "ls-files", "-z"],
        cwd=ROOT,
        capture_output=True,
        text=True,
        check=True,
    ).stdout
    paths = []
    for name in out.split("\0"):
        if not name:
            continue
        if any(part in SKIP_DIRS for part in Path(name).parts):
            continue
        if name in SKIP_FILES:
            continue
        paths.append(ROOT / name)
    return paths


def check_filenames_and_numbers(migrations: Path = MIGRATIONS) -> list[str]:
    errors: list[str] = []
    by_number: dict[str, list[str]] = {}

    if not migrations.is_dir():
        return [f"{migrations} does not exist"]

    for path in sorted(migrations.iterdir()):
        if path.name.startswith("."):
            continue
        if path.suffix != ".sql":
            errors.append(f"not a .sql file: supabase/migrations/{path.name}")
            continue

        match = FILENAME_RE.match(path.name)
        if not match:
            errors.append(
                f"bad migration filename: supabase/migrations/{path.name}\n"
                f"    expected NNNN_lower_snake_case.sql, e.g. 0012_add_a_thing.sql"
            )
            continue

        by_number.setdefault(match.group(1), []).append(path.name)

    for number, names in sorted(by_number.items()):
        if len(names) > 1:
            listed = "\n".join(f"      {n}" for n in sorted(names))
            errors.append(
                f"two migrations share the number {number}:\n{listed}\n"
                f"    Renumber the later one. Rename the highest number first so a\n"
                f"    rename never lands on a name still in use, and update any\n"
                f"    comment or test that comes with it."
            )

    return errors


def check_references(known: set[str], files: list[Path] | None = None,
                     root: Path = ROOT) -> list[str]:
    errors: list[str] = []

    for path in tracked_files() if files is None else files:
        try:
            text = path.read_text(encoding="utf-8")
        except (UnicodeDecodeError, OSError):
            continue  # binary or unreadable, nothing to check

        for line_no, line in enumerate(text.splitlines(), start=1):
            for referenced in REFERENCE_RE.findall(line):
                if referenced in known:
                    continue
                rel = path.relative_to(root)
                errors.append(
                    f"{rel}:{line_no} refers to {referenced}, which does not exist\n"
                    f"    {line.strip()[:100]}\n"
                    f"    A migration was probably renumbered without updating this."
                )

    return errors


def main() -> int:
    known = {p.name for p in MIGRATIONS.glob("*.sql")} if MIGRATIONS.is_dir() else set()

    errors = check_filenames_and_numbers()
    errors += check_references(known)

    if errors:
        print("Migration check FAILED\n")
        for error in errors:
            print(f"  - {error}")
        print(f"\n{len(errors)} problem(s).")
        return 1

    print(f"Migration check passed - {len(known)} migrations, numbers unique, no stale references.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
