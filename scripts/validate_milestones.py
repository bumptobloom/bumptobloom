import csv
import sys
from pathlib import Path
from urllib.parse import urlparse

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
    return parsed.scheme in {"http", "https"} and bool(parsed.netloc)

def validate(path):
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
            elif not source_url.startswith(("http://", "https://")):
                errors.append(
                    f"Row {row_number}: source_url must use HTTP or HTTPS."
                )
            elif not url_resolves(source_url):
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
    if len(sys.argv) != 2:
        print("Usage: python3 scripts/validate_milestones.py <csv-file>")
        sys.exit(1)

    csv_path = Path(sys.argv[1])

    if not csv_path.exists():
        print(f"File not found: {csv_path}")
        sys.exit(1)

    errors = validate(csv_path)

    if errors:
        print("Milestone validation FAILED")
        for error in errors:
            print(f"- {error}")
        sys.exit(1)

    print("Milestone validation PASSED")
