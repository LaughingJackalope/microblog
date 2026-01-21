"""Application configuration using Pydantic Settings v2."""

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings with environment variable support."""

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    # Database
    database_url: str = "postgresql://postgres:postgres@localhost:5432/microblog"

    # Security
    secret_key: str = "32_characters_long_default_secret_key"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60

    @field_validator("secret_key")
    @classmethod
    def validate_secret_key(cls, v: str) -> str:
        """Ensure secret key is strong enough."""
        if len(v) < 32:
            raise ValueError(
                f"SECRET_KEY must be at least 32 characters long for security. "
                f"Current length: {len(v)}. "
                f"Generate one with: openssl rand -base64 32"
            )
        return v

    # CORS
    allowed_origins: str = "http://localhost:3000"

    # Environment
    environment: str = "development"

    @property
    def origins_list(self) -> list[str]:
        """Parse comma-separated origins into a list."""
        return [origin.strip() for origin in self.allowed_origins.split(",")]


settings = Settings()
