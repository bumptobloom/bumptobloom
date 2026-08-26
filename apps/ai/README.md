# Ask service

FastAPI. Owns the Ask feature and nothing else.

```bash
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt -r requirements-dev.txt
uvicorn app.main:app --reload --port 8000
pytest -q
```

## Boundaries

- No database access. It never touches Supabase.
- No user identity. It receives `babyAgeMonths` and a question. Nothing else.
- No medical decisions. The triage guard redirects symptom questions to Health
  *before* any model call.
- Only our Next.js server may call it (`X-Service-Token`).

Contract: `docs/API-CONTRACTS.md` → "Ask".
