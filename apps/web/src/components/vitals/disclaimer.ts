/**
 * Verbatim from Figma frames 07 and 08.
 *
 * This is the text that makes the "Fever range" pill permissible under
 * ADR-007: it states in the parent's own words that the label is informational
 * and does not assess her baby. The label and this sentence ship together. If
 * anyone shortens this, the pill has to come out too.
 *
 * It lives here rather than next to STANDING_DISCLAIMER in lib/api/types.ts on
 * purpose: there are now four different disclaimer texts in the product (this
 * one, STANDING_DISCLAIMER, the Ask frame's, and the one inside the product
 * detail card) and nobody has said which is approved. Raised in #btb-all on
 * 23 Sep. When that is answered, they should be consolidated in one place and
 * this file should go.
 */
export const VITALS_DISCLAIMER =
  'BumpToBloom does not provide medical diagnosis or treatment. Fever-range ' +
  'labels are informational only and do not assess your baby’s condition. ' +
  'Contact a healthcare professional with medical concerns. For emergencies, ' +
  'call 911.';
