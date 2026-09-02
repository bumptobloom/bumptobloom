import getpass
import json
import os
import sys
import urllib.error
import urllib.request
from pathlib import Path


EXPECTED_ROW_IDS = {
    "Account A": {
        "parent_profiles": "10000000-0000-4000-8000-000000000001",
        "babies": "20000000-0000-4000-8000-000000000001",
        "baby_milestones": "31000000-0000-4000-8000-000000000001",
        "baby_activities": "41000000-0000-4000-8000-000000000001",
        "saved_content": "51000000-0000-4000-8000-000000000001",
        "fever_checks": "60000000-0000-4000-8000-000000000001",
        "ai_conversations": "70000000-0000-4000-8000-000000000001",
        "ai_messages": "71000000-0000-4000-8000-000000000001",
        "ai_runs": "72000000-0000-4000-8000-000000000001",
    },
    "Account B": {
        "parent_profiles": "10000000-0000-4000-8000-000000000002",
        "babies": "20000000-0000-4000-8000-000000000002",
        "baby_milestones": "31000000-0000-4000-8000-000000000002",
        "baby_activities": "41000000-0000-4000-8000-000000000002",
        "saved_content": "51000000-0000-4000-8000-000000000002",
        "fever_checks": "60000000-0000-4000-8000-000000000002",
        "ai_conversations": "70000000-0000-4000-8000-000000000002",
        "ai_messages": "71000000-0000-4000-8000-000000000002",
        "ai_runs": "72000000-0000-4000-8000-000000000002",
    },
}

ADMIN_TABLES = [
    "prompt_versions",
    "audit_events",
]


def load_local_env():
    """Load local settings when present; CI provides them as environment variables."""
    candidates = [
        Path.cwd() / ".env.local",
        Path.home() / "bumptobloom" / ".env.local",
    ]

    for env_path in candidates:
        if not env_path.exists():
            continue

        for line in env_path.read_text().splitlines():
            line = line.strip()

            if not line or line.startswith("#") or "=" not in line:
                continue

            name, value = line.split("=", 1)
            value = value.strip().strip('"').strip("'")
            os.environ.setdefault(name.strip(), value)

        return


def required_setting(*names):
    for name in names:
        value = os.environ.get(name)
        if value:
            return value

    raise RuntimeError(f"Missing required environment setting: {' or '.join(names)}")


def secret_or_prompt(name, prompt):
    value = os.environ.get(name)
    return value if value else getpass.getpass(prompt)


def request_json(url, headers, body=None):
    data = None
    method = "GET"

    if body is not None:
        data = json.dumps(body).encode("utf-8")
        method = "POST"
        headers = {**headers, "Content-Type": "application/json"}

    request = urllib.request.Request(
        url,
        data=data,
        headers=headers,
        method=method,
    )

    with urllib.request.urlopen(request, timeout=20) as response:
        return json.loads(response.read().decode("utf-8"))


def sign_in(project_url, publishable_key, email, password):
    response = request_json(
        f"{project_url}/auth/v1/token?grant_type=password",
        {"apikey": publishable_key},
        {"email": email, "password": password},
    )

    token = response.get("access_token")

    if not token:
        raise RuntimeError(f"Sign-in failed for {email}")

    return token


def check_account(
    label,
    project_url,
    publishable_key,
    email,
    password,
    expected_ids,
):
    token = sign_in(
        project_url,
        publishable_key,
        email,
        password,
    )

    headers = {
        "apikey": publishable_key,
        "Authorization": f"Bearer {token}",
    }

    passed = True
    print(f"\n{label}")

    for table, expected_id in expected_ids.items():
        rows = request_json(
            f"{project_url}/rest/v1/{table}?select=id",
            headers,
        )

        actual_ids = [row.get("id") for row in rows]
        ok = actual_ids == [expected_id]
        passed = passed and ok

        if ok:
            print(f"PASS {table}: expected row {expected_id}")
        else:
            print(
                f"FAIL {table}: expected [{expected_id}], "
                f"received {actual_ids}"
            )

    return passed


def check_anonymous(project_url, publishable_key):
    headers = {"apikey": publishable_key}
    passed = True

    print("\nAnonymous role")

    for table in ADMIN_TABLES:
        rows = request_json(
            f"{project_url}/rest/v1/{table}?select=id",
            headers,
        )

        count = len(rows)
        ok = count == 0
        passed = passed and ok

        print(
            f"{'PASS' if ok else 'FAIL'} "
            f"{table}: {count} visible row(s)"
        )

    return passed


def main():
    load_local_env()

    project_url = required_setting(
        "SUPABASE_URL",
        "NEXT_PUBLIC_SUPABASE_URL",
    ).rstrip("/")
    publishable_key = required_setting(
        "SUPABASE_PUBLISHABLE_KEY",
        "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
        "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    )

    email_a = os.environ.get("RLS_TEST_A_EMAIL", "mom-a@bumptobloom.test")
    email_b = os.environ.get("RLS_TEST_B_EMAIL", "mom-b@bumptobloom.test")
    password_a = secret_or_prompt("RLS_TEST_A_PASSWORD", "Account A password: ")
    password_b = secret_or_prompt("RLS_TEST_B_PASSWORD", "Account B password: ")

    account_a_ok = check_account(
        "Account A",
        project_url,
        publishable_key,
        email_a,
        password_a,
        EXPECTED_ROW_IDS["Account A"],
    )

    account_b_ok = check_account(
        "Account B",
        project_url,
        publishable_key,
        email_b,
        password_b,
        EXPECTED_ROW_IDS["Account B"],
    )

    anonymous_ok = check_anonymous(
        project_url,
        publishable_key,
    )

    all_passed = account_a_ok and account_b_ok and anonymous_ok

    print(
        "\nRESULT:",
        "ALL RLS CHECKS PASSED" if all_passed else "RLS CHECK FAILED",
    )

    sys.exit(0 if all_passed else 1)


if __name__ == "__main__":
    try:
        main()
    except urllib.error.HTTPError as error:
        print(f"\nHTTP error: {error.code} {error.reason}")
        sys.exit(1)
    except Exception as error:
        print(f"\nError: {error}")
        sys.exit(1)
