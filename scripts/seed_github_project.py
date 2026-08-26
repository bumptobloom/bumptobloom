#!/usr/bin/env python3
"""
Turn BumpToBloom-Monday-Import.csv into a real GitHub Projects board.

Creates: labels, one milestone per week, 74 issues, and a project board with
every issue on it.

Prerequisites:
    gh --version          # GitHub CLI installed
    gh auth status        # logged in

Run:
    python3 scripts/seed_github_project.py            # do it
    python3 scripts/seed_github_project.py --dry-run  # show what it would do

Safe to re-run: existing labels and milestones are reused, and issues are
matched by title so nothing gets duplicated.
"""

import argparse
import csv
import json
import subprocess
import sys
import time

REPO = "bumptobloom/bumptobloom"
CSV_PATH = "BumpToBloom-Monday-Import.csv"
PROJECT_TITLE = "BumpToBloom MVP"
ORG = "bumptobloom"

PRIORITY_COLORS = {"Critical": "B60205", "High": "D93F0B", "Medium": "FBCA04"}
POD_COLORS = {
    "Pod W": "1D76DB", "Pod E": "0E8A16", "Pod I": "5319E7",
    "Product": "666666", "All": "BFDADC",
}

DRY = False


def run(args, check=True, capture=True):
    if DRY:
        print("   $", " ".join(args[:6]), "…" if len(args) > 6 else "")
        return ""
    r = subprocess.run(args, capture_output=capture, text=True)
    if check and r.returncode != 0:
        err = (r.stderr or "").strip()
        # "already exists" is success for our purposes
        if "already exists" in err or "already_exists" in err:
            return ""
        print(f"   ! {err[:200]}", file=sys.stderr)
        return None
    return (r.stdout or "").strip()


def preflight():
    if subprocess.run(["which", "gh"], capture_output=True).returncode != 0:
        sys.exit("gh is not installed. See scripts/README-project-setup.md")
    if subprocess.run(["gh", "auth", "status"], capture_output=True).returncode != 0:
        sys.exit("Not logged in. Run: gh auth login")


def load_rows():
    with open(CSV_PATH, newline="", encoding="utf-8") as f:
        return list(csv.DictReader(f))


def make_labels(rows):
    print("\n[1/5] Labels")
    seen = set()
    for r in rows:
        for name, colors, desc in (
            (r["Priority"], PRIORITY_COLORS, "Priority"),
            (r["Pod"], POD_COLORS, "Owning pod"),
        ):
            if not name or name in seen:
                continue
            seen.add(name)
            run(["gh", "label", "create", name, "--repo", REPO,
                 "--color", colors.get(name, "EDEDED"),
                 "--description", desc, "--force"])
    print(f"   {len(seen)} labels")


def make_milestones(rows):
    """One milestone per week. Gives a progress bar per week for free."""
    print("\n[2/5] Milestones")
    existing = {}
    out = run(["gh", "api", f"repos/{REPO}/milestones?state=all"], check=False)
    if out:
        try:
            existing = {m["title"]: m["number"] for m in json.loads(out)}
        except json.JSONDecodeError:
            pass

    weeks = {}
    for r in rows:
        weeks.setdefault(r["Group"], r["Due Date"])

    for title, due in sorted(weeks.items()):
        if title in existing:
            print(f"   = {title}")
            continue
        run(["gh", "api", f"repos/{REPO}/milestones", "-X", "POST",
             "-f", f"title={title}",
             "-f", f"due_on={due}T23:59:59Z"], check=False)
        print(f"   + {title}")


def existing_issue_titles():
    out = run(["gh", "issue", "list", "--repo", REPO, "--limit", "500",
               "--state", "all", "--json", "title"], check=False)
    if not out:
        return set()
    try:
        return {i["title"] for i in json.loads(out)}
    except json.JSONDecodeError:
        return set()


def body_for(row):
    parts = [f"**Owner:** {row['Owner']}", f"**Pod:** {row['Pod']}  ·  "
             f"**Week:** {row['Week']}  ·  **Priority:** {row['Priority']}"]
    if row.get("Notes"):
        parts += ["", "---", "", row["Notes"]]
    parts += ["", "---", "",
              "_Seeded from the 6-week plan. Context: `docs/PLAN.md`, "
              "decisions: `docs/DECISIONS.md`._"]
    return "\n".join(parts)


def make_issues(rows):
    print("\n[3/5] Issues")
    have = existing_issue_titles()
    made = skipped = 0
    for i, r in enumerate(rows, 1):
        title = r["Name"]
        if title in have:
            skipped += 1
            continue
        args = ["gh", "issue", "create", "--repo", REPO,
                "--title", title, "--body", body_for(r),
                "--milestone", r["Group"]]
        for lab in (r["Priority"], r["Pod"]):
            if lab:
                args += ["--label", lab]
        # Assignees are deliberately left off: most of the team are not
        # collaborators yet, and gh fails the whole issue if one name is
        # unknown. Owner is in the body; assign in bulk once people join.
        if run(args, check=False) is not None:
            made += 1
        if i % 10 == 0:
            print(f"   {i}/{len(rows)}…")
        time.sleep(0.4)  # stay well under the secondary rate limit
    print(f"   created {made}, already there {skipped}")


def make_project():
    print("\n[4/5] Project board")
    out = run(["gh", "project", "list", "--owner", ORG, "--format", "json"],
              check=False)
    if out:
        try:
            for p in json.loads(out).get("projects", []):
                if p["title"] == PROJECT_TITLE:
                    print(f"   = {PROJECT_TITLE} (#{p['number']})")
                    return str(p["number"])
        except json.JSONDecodeError:
            pass
    out = run(["gh", "project", "create", "--owner", ORG,
               "--title", PROJECT_TITLE, "--format", "json"], check=False)
    if not out:
        return None
    num = str(json.loads(out)["number"])
    print(f"   + {PROJECT_TITLE} (#{num})")
    return num


def add_to_project(number):
    print("\n[5/5] Adding issues to the board")
    out = run(["gh", "issue", "list", "--repo", REPO, "--limit", "500",
               "--state", "open", "--json", "url"], check=False)
    if not out:
        return
    urls = [i["url"] for i in json.loads(out)]
    for i, url in enumerate(urls, 1):
        run(["gh", "project", "item-add", number, "--owner", ORG,
             "--url", url], check=False)
        if i % 10 == 0:
            print(f"   {i}/{len(urls)}…")
        time.sleep(0.3)
    print(f"   {len(urls)} items on the board")


def main():
    global DRY
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true")
    DRY = ap.parse_args().dry_run

    if not DRY:
        preflight()

    rows = load_rows()
    print(f"Read {len(rows)} tasks from {CSV_PATH}")

    make_labels(rows)
    make_milestones(rows)
    make_issues(rows)
    num = make_project()
    if num:
        add_to_project(num)

    print(f"\nDone. https://github.com/orgs/{ORG}/projects")
    print("\nNext, in the board UI:")
    print("  1. Add a Status field with: Backlog, Assigned, In progress, In review, Done")
    print("  2. Switch the view to Board, grouped by Status")
    print("  3. Add a second view grouped by Milestone for the 6-week roadmap")
    print("  4. Assign people once they've joined the org")


if __name__ == "__main__":
    main()
