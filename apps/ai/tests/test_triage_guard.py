from app.triage_guard import should_redirect_to_health


def test_redirects_symptom_questions():
    for q in [
        "My baby has a fever, what do I do?",
        "Is this rash normal?",
        "How much Tylenol can I give?",
        "She's been vomiting since last night",
        "He has trouble breathing",
    ]:
        assert should_redirect_to_health(q), q


def test_allows_ordinary_parenting_questions():
    for q in [
        "What activities should I do with my 7-month-old?",
        "When do babies start crawling?",
        "Any tips for getting her to nap longer?",
        "What toys are good at this age?",
    ]:
        assert not should_redirect_to_health(q), q
