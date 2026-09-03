# Milestone Data Dictionary

| Column | Meaning | Valid value |
|---|---|---|
| `checkpoint_month` | Age checkpoint in months at which the milestone applies. | `2`, `6`, `12`, `18`, or `24` |
| `domain` | Developmental domain of the milestone. | `physical`, `cognitive`, `language`, or `social_emotional` |
| `title` | Short name of the developmental milestone. | Non-empty text |
| `source` | Human-readable attribution for the source of the milestone. | Non-empty text |
| `source_url` | URL to the authoritative source supporting the milestone. | Non-empty URL hosted on `cdc.gov`, `aap.org`, or `who.int` |
| `sort_order` | Integer used to determine the display order of milestones within a checkpoint/domain. | Integer, unique within each checkpoint/domain |

## Validity Rules

A valid row must contain all required columns and values.

`checkpoint_month` must be one of `2`, `6`, `12`, `18`, or `24`.

`domain` must be one of `physical`, `cognitive`, `language`, or `social_emotional`.

`title` and `source` must not be empty.

`source_url` must not be empty and must use an approved host: `cdc.gov`, `aap.org`, or `who.int`. It must resolve successfully when `--check-urls` is enabled.

`sort_order` must be an integer and unique within each checkpoint/domain.

Every checkpoint/domain combination must contain at least one milestone row.

Every milestone must have a source URL. When `--check-urls` is enabled, every source URL must resolve successfully.
