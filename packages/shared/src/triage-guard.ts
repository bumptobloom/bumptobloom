/**
 * Keeps medical questions out of the generative path.
 *
 * PRD §8.7: symptom questions must route to the Health tab's structured tools
 * rather than being answered in free text. This is a coarse keyword gate on
 * purpose — it is a safety net, and a safety net should be simple enough that
 * you can read it and be sure what it does.
 *
 * Bias: false positives are fine. Sending someone to the Fever Checker who did
 * not need it costs a tap. Answering a real symptom question with a language
 * model costs much more.
 *
 * This runs BEFORE the model call, never after. We do not generate text for a
 * symptom question and then decide whether to show it.
 */

const SYMPTOM_TERMS = [
  'fever', 'temperature', 'febrile', 'rash', 'vomit', 'vomiting', 'diarrhea',
  'blood', 'bleeding', 'seizure', 'convulsion', 'breathing', 'wheeze',
  'wheezing', 'choking', 'unresponsive', 'limp', 'lethargic', 'dehydrated',
  'dehydration', 'infection', 'swollen', 'swelling', 'bruise', 'injury',
  'fell', 'head injury', 'medication', 'dose', 'dosage', 'tylenol',
  'acetaminophen', 'ibuprofen', 'motrin', 'antibiotic', 'jaundice',
  'not eating', "won't eat", 'stiff neck', 'hospital', 'emergency',
] as const;

export function shouldRedirectToHealth(question: string): boolean {
  const q = question.toLowerCase();
  return SYMPTOM_TERMS.some((term) => q.includes(term));
}

export const REDIRECT_ANSWER =
  "That sounds like a question about how your baby is feeling. I'm not the " +
  'right tool for that one — the Health tab has a step-by-step checker, and ' +
  'for anything urgent please call your pediatrician or 911.';
