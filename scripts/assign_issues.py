#!/usr/bin/env python3
"""
Assign all 74 issues to their owners, once people have accepted their org invite.

Run the dry run first — it prints the name→username mapping it worked out, and
you should eyeball it before letting it touch anything:

    python3 scripts/assign_issues.py --dry-run
    python3 scripts/assign_issues.py

Anyone it can't match is listed at the end. Add them to OVERRIDES below and
re-run; it only assigns issues that are currently unassigned, so re-running is
safe.
"""

import argparse
import csv
import json
import re
import subprocess
import sys

REPO = "bumptobloom/bumptobloom"
ORG = "bumptobloom"
CSV_PATH = "BumpToBloom-Monday-Import.csv"

# Name in the CSV -> GitHub username. Add people here as they accept.
# Anyone missing is skipped, and their issues stay unassigned.
OVERRIDES: dict[str, str] = {
    # --- accepted, assignable now ---
    "Sonakshi Panda":                 "sonakshipanda",
    "Keya Chaudhari":                 "keyachaudhari",
    "Melvin James Bryant III":        "MJBIII",
    "Shaikh Mohd Rehaan":             "Rehaan-2006",
    "Rasheed Adebayo OYEWOLE":        "OyewoleRasheed",
    "Joanna Zhang":                   "U-sirname",        # confirmed by Joanna

    # --- invite sent, not yet accepted: will fail harmlessly, re-run later ---
    "Mohd Shaff Had Khan":            "ShaffHadK",
    "Tarigopula Sivathmika Chowdary": "SivathmikaChowdary",

    # --- still need a username ---
    # "Natasha Saini":                "",   # pinged
    # "Sahasra Miriyala":             "",   # unconfirmed whether she is joining

    # --- Product: deliberately left unassigned until the PMs agree to own
    #     them. Vishnu (VishDeen) and the others have accepted, so it is only
    #     this comment stopping it. Uncomment once that conversation happens.
    # "Vishnu Deenadayal":            "VishDeen",
    # "Shailee Shah":                 "",
    # "Katrina Ma":                   "",
    # "Jasdeep Singh":                "",
}

DRY = False


def gh(args, check=True):
    r = subprocess.run(["gh"] + args, capture_output=True, text=True)
    if check and r.returncode != 0:
        print(f"   ! {r.stderr.strip()[:160]}", file=sys.stderr)
        return None
    return r.stdout.strip()


def tokens(name: str) -> set[str]:
    """Lowercase word set, minus initials and honorific-ish noise."""
    words = re.findall(r"[a-z]+", name.lower())
    return {w for w in words if len(w) > 2 and w not in {"iii", "jr", "the"}}


def collaborators() -> list[dict]:
    """Repo collaborators, not org members - that is how this team is set up."""
    out = gh(["api", f"repos/{REPO}/collaborators", "--paginate"])
    if not out:
        return []
    members = []
    for m in json.loads(out):
        login = m["login"]
        prof = gh(["api", f"users/{login}"], check=False)
        display = ""
        if prof:
            try:
                display = json.loads(prof).get("name") or ""
            except json.JSONDecodeError:
                pass
        members.append({"login": login, "name": display})
    return members


def match(owner: str, members: list[dict]) -> str | None:
    if owner in OVERRIDES:
        return OVERRIDES[owner]
    want = tokens(owner)
    best, best_score = None, 0
    for m in members:
        score = len(want & tokens(m["name"])) if m["name"] else 0
        # a login containing a whole name word is decent evidence too
        score += sum(1 for w in want if w in m["login"].lower())
        if score > best_score:
            best, best_score = m["login"], score
    # one shared word is a coincidence; two is a match
    return best if best_score >= 2 else None


def main():
    global DRY
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--dry-run", action="store_true",
                    help="show the mapping and what would change, touch nothing")
    DRY = ap.parse_args().dry_run

    print("Reading repo collaborators…")
    members = collaborators()
    if not members:
        sys.exit("No collaborators found. Check `gh auth status`.")
    print(f"   {len(members)} with access\n")

    rows = list(csv.DictReader(open(CSV_PATH, newline="", encoding="utf-8")))
    owners = sorted({r["Owner"] for r in rows})

    print("Mapping:")
    mapping, unmatched = {}, []
    for o in owners:
        u = match(o, members)
        if u:
            mapping[o] = u
            print(f"   {o:34s} → @{u}")
        else:
            unmatched.append(o)
            print(f"   {o:34s} → ??? no match")
    print()

    issues = gh(["issue", "list", "--repo", REPO, "--limit", "300",
                 "--state", "open", "--json", "number,title,assignees"])
    issues = json.loads(issues or "[]")
    by_title = {i["title"]: i for i in issues}

    todo = []
    for r in rows:
        issue = by_title.get(r["Name"])
        if not issue or issue["assignees"]:
            continue
        u = mapping.get(r["Owner"])
        if u:
            todo.append((issue["number"], u, r["Name"]))

    print(f"{len(todo)} issues to assign\n")
    if DRY:
        for n, u, t in todo[:10]:
            print(f"   #{n} → @{u}   {t[:55]}")
        if len(todo) > 10:
            print(f"   … and {len(todo) - 10} more")
    else:
        for i, (n, u, _) in enumerate(todo, 1):
            gh(["issue", "edit", str(n), "--repo", REPO, "--add-assignee", u],
               check=False)
            if i % 10 == 0:
                print(f"   {i}/{len(todo)}…")
        print(f"   assigned {len(todo)}")

    if unmatched:
        print("\nCouldn't match these — add them to OVERRIDES and re-run:")
        for o in unmatched:
            print(f'   "{o}": "",')
        print("\nCollaborators available to match against:")
        for m in members:
            print(f'   @{m["login"]:22s} {m["name"]}')


if __name__ == "__main__":
    main()
