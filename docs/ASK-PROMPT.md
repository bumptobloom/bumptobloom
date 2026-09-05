# Ask Prompt and Context Architecture

## Current version

`2026.09.1`

The matching source is `packages/shared/src/ask-prompt.ts`. Any meaningful prompt change must receive a new version so evaluation results can be tied to the exact instructions that produced them.

## Purpose

BumpToBloom Ask provides warm, plain-language educational information for caregivers of babies from birth through 24 months. It is not a diagnostic or medical-advice service.

Symptom, illness, injury, fever, medication, and other clinical questions must be stopped by the deterministic triage guard before any model call. The prompt repeats this restriction as a second layer of protection, not as a replacement for the guard.

## Permitted baby context

Only these derived fields may be sent to OpenAI:

- `ageMonths`
- `developmentalStage`

The parent’s current question is supplied separately.

The context must never contain:

- Baby or parent names
- Baby ID or user ID
- Email address
- Birth date or due date
- Location
- Database rows or other identifying information

The server derives `ageMonths`. The browser must never submit or calculate it.

## Developmental stages

The stages align with the product’s existing age buckets:

| Age | Stage |
| --- | --- |
| 0–3 months | early infancy |
| 4–8 months | infancy |
| 9–14 months | late infancy |
| 15–24 months | toddlerhood |

The implementation is in `packages/shared/src/ask-context.ts`.

## Conversation-history truncation rule

The model receives no more than the six most recent completed conversation turns, where one turn is one parent message followed by one assistant response.

When the limit is exceeded:

1. Remove the oldest complete turn first.
2. Preserve the remaining turns in chronological order.
3. Never remove or shorten the system prompt.
4. Never remove the privacy-safe baby context.
5. Never remove or shorten the parent’s current question.
6. Never include messages that the triage guard redirected to Health.

Issue #71 owns implementation of this rule. This document defines the contract that implementation must follow.

## Model-call order

The server must perform these steps in order:

1. Verify the authenticated session.
2. Verify that the requested baby belongs to the authenticated parent.
3. Derive the baby’s age on the server.
4. Run the deterministic triage guard on the current question.
5. Stop and return the Health handoff when the guard redirects.
6. Build the privacy-safe context.
7. Apply the conversation-history truncation rule.
8. Call OpenAI with the versioned prompt.
9. Validate the response and record the prompt version used.

## Review requirements

Before this prompt is used:

- Tests must confirm that context contains only the two permitted fields.
- Another person must review the wording and privacy boundaries.
- The Ask screen must show its required standing disclaimer.
- Prompt changes must be versioned and evaluated before becoming active.