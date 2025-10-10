"""Application configuration management for dashboard service."""
from functools import lru_cache
from typing import Any

from dotenv import load_dotenv
from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


load_dotenv()


class Settings(BaseSettings):
    """Settings loaded from environment variables and .env file."""

    mongo_uri: str = Field(..., alias="MONGO_URI")
    mongo_db: str = Field(..., alias="MONGO_DB")
    jwt_secret: str = Field("changeme", alias="JWT_SECRET")
    require_auth: bool = Field(False, alias="REQUIRE_AUTH")
    max_preview_rows: int = Field(100, alias="MAX_PREVIEW_ROWS")
    max_doc_size_mb: int = Field(50, alias="MAX_DOC_SIZE_MB")

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    @field_validator("max_preview_rows", "max_doc_size_mb", mode="before")
    @classmethod
    def _coerce_int(cls, value: Any) -> Any:
        if value is None or isinstance(value, int):
            return value
        if isinstance(value, str) and value.isdigit():
            return int(value)
        try:
            return int(value)
        except (TypeError, ValueError) as exc:  # pragma: no cover - defensive
            raise ValueError("Expected an integer-compatible value") from exc


@lru_cache
def get_settings() -> Settings:
    """Return cached application settings."""

    return Settings()