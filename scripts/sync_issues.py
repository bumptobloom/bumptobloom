#!/usr/bin/env python3
"""
Reconcile the GitHub issues against BumpToBloom-Monday-Import.csv.

The CSV is the source of truth. This script makes GitHub match it:

  * in GitHub but no longer in the CSV  -> closed, with a comment saying why
  * in the CSV but not in GitHub        -> created, labelled, milestoned, added
                                           to the project board
  * in both                             -> body, labels and milestone refreshed

Run the dry run first. It changes nothing and prints exactly what it would do:

    python3 scripts/sync_issues.py --dry-run
    python3 scripts/sync_issues.py

Safe to run repeatedly.
"""

import argparse
import csv
import importlib.util
import json
import pathlib
import subprocess
import sys
import time

_spec = importlib.util.spec_from_file_location(
    "task_details", pathlib.Path(__file__).parent / "task_details.py")
_td = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(_td)
DETAIL = _td.DETAIL

REPO = "bumptobloom/bumptobloom"
ORG = "bumptobloom"
CSV_PATH = "BumpToBloom-Monday-Import.csv"
PROJECT_TITLE = "BumpToBloom MVP"

CLOSE_COMMENT = (
    "Closing: this task no longer exists in the plan.\n\n"
    "Product confirmed in writing that BumpToBloom is a **progressive web app** "
    "— installable on a phone or a laptop, not an App Store listing. See "
    "`docs/DECISIONS.md`, ADR-006, which supersedes ADR-005.\n\n"
    "Almost all of these have a direct replacement issue on the board. The only "
    "one that is simply gone is registering the Apple and Google developer "
    "accounts, which saves $124 and a review queue.\n\n"
    "**Nothing about the schema, the fever rules, the safety work or the pods "
    "changed.** Only where the code runs changed."
)

DRY = False


def gh(args, check=True):
    if DRY and args[0] in ("issue", "project") and args[1] in (
        "create", "close", "edit", "comment", "item-add"
    ):
        print(f"   would: gh {' '.join(args[:3])} …")
        return ""
    r = subprocess.run(["gh"] + args, capture_output=True, text=True)
    if check and r.returncode != 0:
        print(f"   ! {r.stderr.strip()[:160]}", file=sys.stderr)
        return None
    return (r.stdout or "").strip()


UI_WORDS = ("screen", "page", "navigation", "banner", "tokens", "sidebar",
            "accessibility", "browser pass", "icons", "responsive shell")
DATA_WORDS = ("data layer", "rls", "supabase", "seed", "schema", "logging",
              "persistence", "profile", "auth", "milestones", "activities")
DISCLAIMER_TABS = ("track", "health", "fever", "ask", "cart", "learn")
SAFETY_WORDS = ("fever", "triage guard", "safety test", "clinical", "911")


def is_code(row) -> bool:
    """Product tasks don't produce a PR — they produce a decision or a document."""
    return row["Pod"] != "Product"


def pr_checklist(name: str) -> list[str]:
    """Universal checks first, then only the ones this task actually earns."""
    n = name.lower()
    items = [
        "`Closes #<this issue>` is in the PR description — that is what moves "
        "the card",
        "No secret in the diff. `NEXT_PUBLIC_*` is shipped to the "
        "browser and readable in devtools — the OpenAI key and the "
        "Supabase service role key never carry that prefix",
        "Reviewed by someone outside your pod",
    ]
    if any(w in n for w in UI_WORDS):
        items += [
            "Opened on a real phone via the preview URL, not only in a "
            "desktop browser with the window made narrow",
            "Screenshot attached, taken at 390px wide",
            "Checked at 1440px too — it should be a centred phone-shaped "
            "column, not a stretched page",
            "Loading and error states exist, not just the happy path",
        ]
    if any(w in n for w in DATA_WORDS):
        items.append("Verified with two accounts — account A cannot see "
                     "account B's data")
    if any(w in n for w in DISCLAIMER_TABS):
        items.append("The required disclaimer for this tab renders and cannot "
                     "be dismissed")
    if any(w in n for w in SAFETY_WORDS):
        items += [
            "**You have read `docs/SAFETY.md`**",
            "Test table updated in the SAME PR if you touched the rules",
            "`RULES_VERSION` bumped if a threshold changed",
            "No medication dosing anywhere in the diff",
        ]
    return items


def body_for(row):
    name = row["Name"]
    d = DETAIL.get(name, {})
    parts = [
        f"**Owner:** {row['Owner']}",
        f"**Pod:** {row['Pod']}  ·  **Week:** {row['Week']}  ·  "
        f"**Priority:** {row['Priority']}",
    ]

    if row.get("Notes"):
        parts += ["", "### Why this exists", "", row["Notes"]]

    if d.get("do"):
        parts += ["", "### What to do", ""]
        parts += [f"- {step}" for step in d["do"]]

    if d.get("done"):
        parts += ["", "### Done when", ""]
        parts += [f"- [ ] {c}" for c in d["done"]]

    if is_code(row):
        parts += ["", "### Before you raise a PR", ""]
        parts += [f"- [ ] {c}" for c in pr_checklist(name)]
    else:
        parts += ["", "### Before you call this done", "",
                  "- [ ] The outcome is written down somewhere the team can "
                  "find it, not only in a chat message",
                  "- [ ] Whoever is blocked by this has been told directly"]

    if d.get("note"):
        parts += ["", f"> **Note:** {d['note']}"]

    if not d:
        parts += ["", "> This task has no detailed description yet. Add one to "
                  "`scripts/task_details.py` rather than guessing."]

    parts += [
        "", "---", "",
        "_Plan: `docs/PLAN.md` · Decisions: `docs/DECISIONS.md` · "
        "Contracts: `docs/API-CONTRACTS.md` · Safety: `docs/SAFETY.md`_",
    ]
    return "\n".join(parts)


def main():
    global DRY
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--dry-run", action="store_true",
                    help="print what would change, touch nothing")
    DRY = ap.parse_args().dry_run

    rows = list(csv.DictReader(open(CSV_PATH, newline="", encoding="utf-8")))
    want = {r["Name"]: r for r in rows}
    print(f"CSV has {len(want)} tasks\n")

    # Fetch BOTH open and closed. A closed issue whose task is still on the
    # board is finished work, not a missing issue. Looking only at open ones
    # made every completed task look absent and recreated it on the next run.
    out = gh(["issue", "list", "--repo", REPO, "--limit", "400",
              "--state", "all", "--json", "number,title,body,state"])
    all_issues = json.loads(out or "[]")
    have = {i["title"]: i for i in all_issues if i.get("state") == "OPEN"}
    done = {i["title"]: i for i in all_issues if i.get("state") != "OPEN"}
    print(f"GitHub has {len(have)} open issues, {len(done)} closed\n")

    # Close: open issues whose task has left the board.
    stale = [t for t in have if t not in want]
    # Create: board tasks with no issue at all, open OR closed. A task whose
    # issue is closed has been done; recreating it would undo someone's work.
    fresh = [t for t in want if t not in have and t not in done]
    # Refresh: open issues still on the board. Closed ones are left alone so
    # we do not reopen or churn finished work.
    both = [t for t in want if t in have]

    revived = [t for t in want if t in done]
    if revived:
        print(f"Leaving {len(revived)} completed task(s) closed:")
        for t in revived:
            print(f"   ok #{done[t]['number']}  {t[:62]}")
        print()

    # ---------- 1. close what no longer exists ----------
    print(f"[1/3] Closing {len(stale)} obsolete issues")
    for t in stale:
        n = have[t]["number"]
        print(f"   #{n}  {t[:62]}")
        gh(["issue", "close", str(n), "--repo", REPO, "-c", CLOSE_COMMENT],
           check=False)
        time.sleep(0.3)

    # ---------- 2. create what's missing ----------
    print(f"\n[2/3] Creating {len(fresh)} new issues")
    for t in fresh:
        r = want[t]
        print(f"   +  {t[:62]}")
        args = ["issue", "create", "--repo", REPO, "--title", t,
                "--body", body_for(r), "--milestone", r["Group"]]
        for lab in (r["Priority"], r["Pod"], r.get("Discipline")):
            if lab:
                args += ["--label", lab]
        gh(args, check=False)
        time.sleep(0.4)

    # ---------- 3. refresh the rest ----------
    print(f"\n[3/3] Refreshing {len(both)} existing issues")
    changed = 0
    for t in both:
        r, issue = want[t], have[t]
        new_body = body_for(r)
        # Only touch it if the body actually differs — keeps the issue
        # timeline readable instead of 79 identical "edited" events.
        if (issue.get("body") or "").strip() == new_body.strip():
            continue
        changed += 1
        print(f"   ~  #{issue['number']}  {t[:56]}")
        gh(["issue", "edit", str(issue["number"]), "--repo", REPO,
            "--body", new_body, "--milestone", r["Group"]], check=False)
        time.sleep(0.3)
    print(f"   {changed} bodies updated, {len(both) - changed} already current")

    # ---------- put everything on the board ----------
    if fresh and not DRY:
        print("\nAdding new issues to the project board")
        pl = gh(["project", "list", "--owner", ORG, "--format", "json"],
                check=False)
        num = None
        if pl:
            for p in json.loads(pl).get("projects", []):
                if p["title"] == PROJECT_TITLE:
                    num = str(p["number"])
        if num:
            urls = gh(["issue", "list", "--repo", REPO, "--limit", "400",
                       "--state", "open", "--json", "url"], check=False)
            for i in json.loads(urls or "[]"):
                gh(["project", "item-add", num, "--owner", ORG,
                    "--url", i["url"]], check=False)
                time.sleep(0.25)
            print("   done (already-present items are ignored)")
        else:
            print(f"   ! couldn't find a project called {PROJECT_TITLE!r}")

    print(f"\nSummary: {len(stale)} closed, {len(fresh)} created, "
          f"{changed} updated")
    if not DRY:
        print("\nNow re-run: python3 scripts/assign_issues.py")


if __name__ == "__main__":
    main()
