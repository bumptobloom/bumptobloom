import csv
import sys
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import urlparse
from urllib.request import Request, urlopen

ALLOWED_CHECKPOINTS = {2, 6, 12, 18, 24}
ALLOWED_DOMAINS = {"physical", "cognitive", "language", "social_emotional"}
ALLOWED_SOURCE_HOSTS = {"cdc.gov", "aap.org", "who.int"}

REQUIRED_COLUMNS = {
    "checkpoint_month",
    "domain",
    "title",
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
            headers={"User-Agent": "Mozilla/5.0"},
        )
        with urlopen(request, timeout=10) as response:
            return 200 <= response.status < 400
    except HTTPError as error:
        if error.code == 405:
            try:
                request = Request(
                    url,
                    method="GET",
                    headers={"User-Agent": "Mozilla/5.0"},
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
    seen_cells = set()
    seen_sort_orders = set()

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

            checkpoint_value = None

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

            if checkpoint_value in ALLOWED_CHECKPOINTS and domain in ALLOWED_DOMAINS:
                cell = (checkpoint_value, domain)
                seen_cells.add(cell)

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
                else:
                    hostname = parsed.hostname.lower().rstrip(".")
                    if not any(
                        hostname == host or hostname.endswith("." + host)
                        for host in ALLOWED_SOURCE_HOSTS
                    ):
                        errors.append(
                            f"Row {row_number}: source_url host is not approved: {hostname}"
                        )
                    elif check_urls and not url_resolves(source_url):
                        errors.append(
                            f"Row {row_number}: source_url does not resolve: {source_url}"
                        )

            if not sort_order:
                errors.append(f"Row {row_number}: sort_order is empty.")
            else:
                try:
                    sort_order_value = int(sort_order)
                    if (
                        checkpoint_value in ALLOWED_CHECKPOINTS
                        and domain in ALLOWED_DOMAINS
                    ):
                        sort_key = (checkpoint_value, domain, sort_order_value)
                        if sort_key in seen_sort_orders:
                            errors.append(
                                f"Row {row_number}: duplicate sort_order "
                                f"'{sort_order}' for checkpoint_month "
                                f"'{checkpoint_value}' and domain '{domain}'."
                            )
                        else:
                            seen_sort_orders.add(sort_key)
                except ValueError:
                    errors.append(
                        f"Row {row_number}: sort_order must be an integer."
                    )

        expected_cells = {
            (checkpoint, domain)
            for checkpoint in ALLOWED_CHECKPOINTS
            for domain in ALLOWED_DOMAINS
        }

        missing_cells = expected_cells - seen_cells

        if missing_cells:
            for checkpoint, domain in sorted(missing_cells):
                errors.append(
                    f"Missing milestone coverage: checkpoint_month "
                    f"'{checkpoint}', domain '{domain}'."
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
