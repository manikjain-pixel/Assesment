import json
from pathlib import Path
from typing import List
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


BASE_DIR = Path(__file__).resolve().parents[2]
DEFAULT_DATABASE_PATH = (BASE_DIR / "ai_screener.db").resolve()


class Settings(BaseSettings):
    PORT: int = 8000
    HOST: str = "0.0.0.0"
    ENVIRONMENT: str = "production"
    DATABASE_URL: str = f"sqlite:///{DEFAULT_DATABASE_PATH}"
    NVIDIA_API_KEY: str = ""
    NVIDIA_MODEL_NAME: str = "google/gemma-2-27b-it"
    CORS_ORIGINS: str = '["*"]'

    @field_validator("DATABASE_URL", mode="before")
    @classmethod
    def normalize_database_url(cls, value: object) -> str:
        if not isinstance(value, str) or not value:
            return f"sqlite:///{DEFAULT_DATABASE_PATH}"

        if value.startswith("sqlite:///./"):
            relative_path = value[len("sqlite:///./") :]
            return f"sqlite:///{(BASE_DIR / relative_path).resolve()}"

        if value.startswith("sqlite:///") and not value.startswith("sqlite:////"):
            return value

        if value.startswith("sqlite:///") and not value.startswith("sqlite:////"):
            relative_path = value[len("sqlite:///") :]
            if not Path(relative_path).is_absolute():
                return f"sqlite:///{(BASE_DIR / relative_path).resolve()}"

        return value

    @property
    def cors_origins_list(self) -> List[str]:
        try:
            return json.loads(self.CORS_ORIGINS)
        except Exception:
            return ["*"]

    model_config = SettingsConfigDict(env_file=BASE_DIR / ".env", env_file_encoding="utf-8", extra="ignore")


settings = Settings()
