"""BumpToBloom Ask service.

Owns exactly one thing: turning a parent's question plus a baby's age into a
helpful, non-medical answer. It has no database access and no knowledge of who
the user is.

It cannot influence a fever result. That lives in packages/fever-rules, in
TypeScript, deterministic and offline. See docs/SAFETY.md.
"""

import time

from fastapi import Depends, FastAPI, Header, HTTPException

from .config import settings
from .schemas import AskRequest, AskResponse, Usage
from .triage_guard import should_redirect_to_health

app = FastAPI(title="BumpToBloom Ask", version="0.1.0")

PROMPT_VERSION = "2026.08.1"

REDIRECT_ANSWER = (
    "That sounds like a question about how your baby is feeling. I'm not the "
    "right tool for that one -- the Health tab has a step-by-step checker, and "
    "for anything urgent please call your pediatrician or 911."
)


def require_service_token(x_service_token: str = Header(default="")) -> None:
    """Only our own Next.js server may call this. Browsers never reach it."""
    if not settings.service_token or x_service_token != settings.service_token:
        raise HTTPException(status_code=401, detail="invalid service token")


@app.get("/health")
def healthcheck() -> dict[str, str]:
    return {"status": "ok", "promptVersion": PROMPT_VERSION}


@app.post("/ask", response_model=AskResponse, response_model_by_alias=True)
def ask(req: AskRequest, _: None = Depends(require_service_token)) -> AskResponse:
    started = time.monotonic()

    # The guard runs BEFORE the model, not after. We never generate text for a
    # symptom question and then decide whether to show it.
    if should_redirect_to_health(req.question):
        return AskResponse(
            answer=REDIRECT_ANSWER,
            prompt_version=PROMPT_VERSION,
            model="none",
            validation_ok=True,
            redirected_to_health=True,
            usage=Usage(
                input_tokens=0,
                output_tokens=0,
                latency_ms=int((time.monotonic() - started) * 1000),
            ),
        )

    # TODO(Pod I, Week 4): build context, call OpenAI, validate the response
    # against a Pydantic model, and persist an ai_runs row via the Next.js
    # callback. See docs/API-CONTRACTS.md for the exact shape.
    raise HTTPException(status_code=501, detail="Ask generation not implemented yet")
