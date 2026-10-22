from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "RustexClans API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    ENV: str = "production"

    # JWT Security (переопределяется через .env или переменные окружения)
    SECRET_KEY: str = "-cHwLOqq91HHjvZBSWqCY8CPouN3rN6pEXV7YehNlmeDGqQNKCuCnNVNR3tXq-c2"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 часа сессия

    # База данных
    DATABASE_URL: str = f"sqlite+aiosqlite:///{(Path(__file__).resolve().parent.parent / 'rustex.db').as_posix()}"

    # CORS: доверенные домены продакшена и локальной разработки
    CORS_ORIGINS: list[str] = [
        "https://rcl.zelenskiy.xyz",
        "http://rcl.zelenskiy.xyz",
        "https://zelenskiy.xyz",
        "http://zelenskiy.xyz",
        "http://64.188.64.14:8080",
        "http://64.188.64.14:8000",
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:8000",
        "http://localhost:8080",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:8000",
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