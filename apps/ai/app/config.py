from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    openai_api_key: str = ""
    openai_model: str = "gpt-4o-mini"
    service_token: str = ""
    request_timeout_s: float = 15.0

    class Config:
        env_file = ".env"


settings = Settings()
