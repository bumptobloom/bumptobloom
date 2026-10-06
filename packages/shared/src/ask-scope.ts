const SUPPORTED_TOPIC_PATTERNS = [
  /\b(feed|feeding|formula|breastfeed|breastfeeding|solid food|food|eat|eating|meal|bottle|nurs(?:e|ing)|wean(?:ing)?)\b/i,
  /\b(sleep|sleeping|nap|naps|bedtime|night waking|wake(?:s|ing)? up|sleep regression)\b/i,
  /\b(diaper|diapers|poop|stool|constipat|digest|digestion|gas|gassy|burp|burping|bowel)\b/i,
  /\b(cry|cries|crying|fuss|fussy|sooth|soothing|comfort|colic|calm)\b/i,
  /\b(mom|mum|mother|parent|postpartum|wellbeing|well-being|well being|overwhelmed|stress|anxious|anxiety|rest)\b/i,
];

export const UNSUPPORTED_ASK_ANSWER =
  "I can help with feeding, sleep, diapers and digestion, crying and soothing, or mom's wellbeing. I cannot answer questions outside those areas.";

/**
 * Keep unsupported questions away from both web research and the model.
 * This is intentionally conservative: an ambiguous question is declined
 * rather than sent to a model that may answer outside Ask's five categories.
 */
export function isAskQuestionInScope(question: string): boolean {
  return SUPPORTED_TOPIC_PATTERNS.some((pattern) => pattern.test(question));
}
