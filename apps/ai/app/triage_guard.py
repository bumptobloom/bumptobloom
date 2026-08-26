"""Keeps medical questions out of the generative path.

PRD 8.7: symptom questions must route to the Health tab's structured tools
rather than being answered in free text. This is a coarse keyword gate on
purpose -- it is a safety net, and a safety net should be simple enough that
you can read it and be sure of what it does.

Bias: false positives are fine. Sending someone to the Fever Checker who did
not need it costs a tap. Answering a real symptom question with a language
model costs much more.
"""

SYMPTOM_TERMS = {
    "fever", "temperature", "febrile", "rash", "vomit", "vomiting", "diarrhea",
    "blood", "bleeding", "seizure", "convulsion", "breathing", "wheeze",
    "wheezing", "choking", "unresponsive", "limp", "lethargic", "dehydrated",
    "dehydration", "infection", "swollen", "swelling", "bruise", "injury",
    "fell", "head injury", "medication", "dose", "dosage", "tylenol",
    "acetaminophen", "ibuprofen", "motrin", "antibiotic", "jaundice",
    "not eating", "won't eat", "stiff neck", "hospital", "emergency",
}


def should_redirect_to_health(question: str) -> bool:
    q = question.lower()
    return any(term in q for term in SYMPTOM_TERMS)
