import csv
import sys
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import urlparse
from urllib.request import Request, urlopen

ALLOWED_CHECKPOINTS = {2, 6, 12, 18, 24}
ALLOWED_DOMAINS = {"physical", "cognitive", "language", "social_emotional"}

REQUIRED_COLUMNS = {
    "checkpoint_month",
    "domain",
    "title",
    "description",
    "source",
    "source_url",
    "sort_order",
}

def url_resolves(url):
    parsed = urlparse(url)
    if parsed.scheme not in {"http", "https"} or not parsed.netloc:
        return False

    try:
        request = Request(
            url,
            method="HEAD",
            headers={"User-Agent": "Mozilla/5.0"}
        )
        with urlopen(request, timeout=10) as response:
            return 200 <= response.status < 400
    except HTTPError as error:
        if error.code == 405:
            try:
                request = Request(
                    url,
                    method="GET",
                    headers={"User-Agent": "Mozilla/5.0"}
                )
                with urlopen(request, timeout=10) as response:
                    return 200 <= response.status < 400
            except (HTTPError, URLError, TimeoutError):
                return False
        return False
    except (URLError, TimeoutError):
        return False

def validate(path, check_urls=False):
    errors = []

    with open(path, newline="", encoding="utf-8") as file:
        reader = csv.DictReader(file)

        if reader.fieldnames is None:
            errors.append("CSV has no header.")
            return errors

        missing_columns = REQUIRED_COLUMNS - set(reader.fieldnames)

        if missing_columns:
            errors.append(
                "Missing required columns: " + ", ".join(sorted(missing_columns))
            )
            return errors

        for row_number, row in enumerate(reader, start=2):
            checkpoint = row["checkpoint_month"].strip()
            domain = row["domain"].strip()
            title = row["title"].strip()
            source = row["source"].strip()
            source_url = row["source_url"].strip()
            sort_order = row["sort_order"].strip()

            if not checkpoint:
                errors.append(f"Row {row_number}: checkpoint_month is empty.")
            else:
                try:
                    checkpoint_value = int(checkpoint)
                    if checkpoint_value not in ALLOWED_CHECKPOINTS:
                        errors.append(
                            f"Row {row_number}: invalid checkpoint_month '{checkpoint}'."
                        )
                except ValueError:
                    errors.append(
                        f"Row {row_number}: checkpoint_month must be an integer."
                    )

            if domain not in ALLOWED_DOMAINS:
                errors.append(f"Row {row_number}: invalid domain '{domain}'.")

            if not title:
                errors.append(f"Row {row_number}: title is empty.")

            if not source:
                errors.append(f"Row {row_number}: source is empty.")

            if not source_url:
                errors.append(f"Row {row_number}: source_url is empty.")
            else:
                parsed = urlparse(source_url)

                if parsed.scheme not in {"http", "https"} or not parsed.netloc:
                    errors.append(
                        f"Row {row_number}: source_url must be a valid HTTP or HTTPS URL."
                    )
                elif check_urls and not url_resolves(source_url):
                    errors.append(
                        f"Row {row_number}: source_url does not resolve: {source_url}"
                    )

            if not sort_order:
                errors.append(f"Row {row_number}: sort_order is empty.")
            else:
                try:
                    int(sort_order)
                except ValueError:
                    errors.append(
                        f"Row {row_number}: sort_order must be an integer."
                    )

    return errors

if __name__ == "__main__":
    if len(sys.argv) not in {2, 3}:
        print(
            "Usage: python3 scripts/validate_milestones.py "
            "<csv-file> [--check-urls]"
        )
        sys.exit(1)

    check_urls = len(sys.argv) == 3 and sys.argv[2] == "--check-urls"

    if len(sys.argv) == 3 and not check_urls:
        print("Unknown option.")
        sys.exit(1)

    csv_path = Path(sys.argv[1])

    if not csv_path.exists():
        print(f"File not found: {csv_path}")
        sys.exit(1)

    errors = validate(csv_path, check_urls)

    if errors:
        print("Milestone validation FAILED")
        for error in errors:
            print(f"- {error}")
        sys.exit(1)

    print("Milestone validation PASSED")
