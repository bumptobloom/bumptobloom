import os
import json
import urllib.error
import urllib.parse
import urllib.request
import uuid

from btb_rls_check import (
    EXPECTED_ROW_IDS,
    load_local_env,
    required_setting,
    request_json,
    secret_or_prompt,
    sign_in,
)


BUCKET = "baby-avatars"

# A tiny valid PNG used only for the security test.
TEST_PNG = bytes.fromhex(
    "89504E470D0A1A0A"
    "0000000D49484452000000010000000108060000001F15C489"
    "0000000D49444154789C6360F8CFC000000301010018DD8DB1"
    "0000000049454E44AE426082"
)


def storage_request(url, headers, method="GET", body=None):
    request = urllib.request.Request(
        url,
        data=body,
        headers=headers,
        method=method,
    )

    try:
        with urllib.request.urlopen(request, timeout=20) as response:
            return response.status, response.read()
    except urllib.error.HTTPError as error:
        return error.code, error.read()


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

    email_a = os.environ.get(
        "RLS_TEST_A_EMAIL",
        "mom-a@bumptobloom.test",
    )
    email_b = os.environ.get(
        "RLS_TEST_B_EMAIL",
        "mom-b@bumptobloom.test",
    )
    password_a = secret_or_prompt(
        "RLS_TEST_A_PASSWORD",
        "Account A password: ",
    )
    password_b = secret_or_prompt(
        "RLS_TEST_B_PASSWORD",
        "Account B password: ",
    )

    token_a = sign_in(project_url, publishable_key, email_a, password_a)
    token_b = sign_in(project_url, publishable_key, email_b, password_b)

    headers_a = {
        "apikey": publishable_key,
        "Authorization": f"Bearer {token_a}",
    }
    headers_b = {
        "apikey": publishable_key,
        "Authorization": f"Bearer {token_b}",
    }
    anonymous_headers = {"apikey": publishable_key}

    user_a = request_json(
        f"{project_url}/auth/v1/user",
        headers_a,
    )
    user_b = request_json(
        f"{project_url}/auth/v1/user",
        headers_b,
    )

    babies_a = request_json(
        f"{project_url}/rest/v1/babies?select=id",
        headers_a,
    )

    assert len(babies_a) == 1, (
        f"Expected Account A to see one baby, but received: {babies_a}"
    )

    baby_a = babies_a[0]["id"]
    file_name = f"{uuid.uuid4()}.png"
    object_path = f"{user_a['id']}/{baby_a}/{file_name}"
    encoded_path = urllib.parse.quote(object_path, safe="/")

    object_url = (
        f"{project_url}/storage/v1/object/{BUCKET}/{encoded_path}"
    )

    upload_headers_a = {
        **headers_a,
        "Content-Type": "image/png",
        "x-upsert": "false",
    }

    status, response = storage_request(
        object_url,
        upload_headers_a,
        method="POST",
        body=TEST_PNG,
    )
    assert status == 200, (
        f"Owner upload failed with status {status}: "
        f"{response.decode('utf-8', errors='replace')}"
    )
    assert status == 200, f"Owner upload failed with status {status}"
    print("PASS: Account A can upload its own baby's photo")

    status, _ = storage_request(object_url, headers_a)
    assert status == 200, f"Owner read failed with status {status}"
    print("PASS: Account A can read its own baby's photo")

    status, _ = storage_request(object_url, headers_b)
    assert status >= 400, "Account B unexpectedly read Account A's photo"
    print("PASS: Account B cannot read Account A's photo")

    status, _ = storage_request(
        f"{project_url}/storage/v1/object/public/{BUCKET}/{encoded_path}",
        anonymous_headers,
    )
    assert status >= 400, "Anonymous public access unexpectedly succeeded"
    print("PASS: Anonymous public access is blocked")

    cross_path = (
        f"{user_b['id']}/{baby_a}/{uuid.uuid4()}.png"
    )
    cross_url = (
        f"{project_url}/storage/v1/object/{BUCKET}/"
        f"{urllib.parse.quote(cross_path, safe='/')}"
    )

    status, _ = storage_request(
        cross_url,
        {
            **headers_b,
            "Content-Type": "image/png",
            "x-upsert": "false",
        },
        method="POST",
        body=TEST_PNG,
    )
    assert status >= 400, "Account B uploaded a photo for Account A's baby"
    print("PASS: Account B cannot upload for Account A's baby")

    sign_url = (
        f"{project_url}/storage/v1/object/sign/"
        f"{BUCKET}/{encoded_path}"
    )
    status, response = storage_request(
        sign_url,
        {
            **headers_a,
            "Content-Type": "application/json",
        },
        method="POST",
        body=json.dumps({"expiresIn": 60}).encode("utf-8"),
    )
    assert status == 200, f"Signed URL creation failed with status {status}"

    signed_path = json.loads(response.decode("utf-8"))["signedURL"]
    if signed_path.startswith("http"):
        signed_url = signed_path
    elif signed_path.startswith("/storage/v1"):
        signed_url = f"{project_url}{signed_path}"
    else:
        signed_url = f"{project_url}/storage/v1{signed_path}"

    status, _ = storage_request(signed_url, {})
    assert status == 200, f"Signed URL read failed with status {status}"
    print("PASS: Temporary signed URL works")

    status, _ = storage_request(
        object_url,
        headers_a,
        method="DELETE",
    )
    assert status == 200, f"Owner cleanup failed with status {status}"
    print("PASS: Account A can delete its own photo")

    print("\nAll private baby-avatar storage checks passed.")


if __name__ == "__main__":
    main()