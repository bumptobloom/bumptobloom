# Milestone Dataset

This directory contains the raw and intermediate milestone dataset before it is converted into the Supabase seed.

## Schema

Each milestone row must contain:

| Column | Type | Required |
|---|---|---|
| `checkpoint_month` | integer | yes |
| `domain` | string | yes |
| `title` | string | yes |
| `source` | string | yes |
| `source_url` | string | yes |
| `sort_order` | integer | yes |

## Allowed values

### checkpoint_month

Valid values:

- `2`
- `6`
- `12`
- `18`
- `24`

### domain

Valid values:

- `physical`
- `cognitive`
- `language`
- `social_emotional`

## Validation rules

A row is invalid when:

1. A required column is missing.
2. `checkpoint_month` is not one of `2`, `6`, `12`, `18`, `24`.
3. `domain` is not one of the four allowed domains.
4. `title` is empty.
5. `source` is empty.
6. `source_url` is empty.
7. `source_url` is not hosted on an approved source domain (`cdc.gov`, `aap.org`, or `who.int`).
8. `source_url` does not resolve successfully when `--check-urls` is enabled.
9. `sort_order` is not a valid integer.
10. `sort_order` is duplicated within the same `checkpoint_month` and `domain`.
11. The dataset does not contain at least one row for every checkpoint/domain combination.

Every milestone must have a source URL. When `--check-urls` is enabled, every source URL must resolve successfully.
