"""Request/response shapes. These mirror docs/API-CONTRACTS.md exactly.

Note what is NOT here: no baby name, no parent id, no user id, no email.
The AI service never receives anything that identifies a family, so nothing
identifying can reach OpenAI. Keep it that way.
"""

from typing import Literal

from pydantic import BaseModel, Field


class Message(BaseModel):
    role: Literal["user", "assistant"]
    content: str = Field(max_length=4000)


class AskRequest(BaseModel):
    baby_age_months: float = Field(ge=0, le=24, alias="babyAgeMonths")
    developmental_stage: str = Field(alias="developmentalStage")
    question: str = Field(min_length=1, max_length=2000)
    history: list[Message] = Field(default_factory=list, max_length=20)

    model_config = {"populate_by_name": True}


class Usage(BaseModel):
    input_tokens: int = Field(alias="inputTokens")
    output_tokens: int = Field(alias="outputTokens")
    latency_ms: int = Field(alias="latencyMs")

    model_config = {"populate_by_name": True}


class AskResponse(BaseModel):
    answer: str
    prompt_version: str = Field(alias="promptVersion")
    model: str
    validation_ok: bool = Field(alias="validationOk")
    redirected_to_health: bool = Field(alias="redirectedToHealth")
    usage: Usage

    model_config = {"populate_by_name": True}
