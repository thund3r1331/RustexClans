from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "RustexClans API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"

    # JWT Security
    SECRET_KEY: str = "dev-secret-key-rustex-local-clans-2026"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 дней сессия

    # База данных
    DATABASE_URL: str = "sqlite+aiosqlite:///./rustex.db"
    # DATABASE_URL: str = "sqlite+aiosqlite:///:memory:"  # для тестов в памяти

    # Дефолтный админ
    SUPERUSER_USERNAME: str = "admin"
    SUPERUSER_PASSWORD: str = "admin123!"

    # CORS
    CORS_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:8000",
        "http://localhost:8080",
        "http://127.0.0.1:5500",
        "http://127.0.0.1:5173",
        "*",
    ]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()

# if __name__ == "__main__":
#     print(f"DEBUG [config]: Loaded DATABASE_URL = {settings.DATABASE_URL}")
#     print(f"DEBUG [config]: CORS origins = {settings.CORS_ORIGINS}")