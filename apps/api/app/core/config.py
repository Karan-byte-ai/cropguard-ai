from typing import List
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    # General
    PROJECT_NAME: str = "CropGuard AI"
    VERSION: str = "1.0.0"
    API_V1_PREFIX: str = "/api/v1"
    ENVIRONMENT: str = "development"
    DEBUG: bool = False
    LOG_LEVEL: str = "INFO"

    # Security & Auth (Section 11)
    JWT_SECRET: str = "change-this-in-production-super-secret-key-min-32-chars"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://cropguard:cropguard_secret_pwd@localhost:5432/cropguard"
    DATABASE_URL_SYNC: str = "postgresql://cropguard:cropguard_secret_pwd@localhost:5432/cropguard"

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"

    # Object Storage (MinIO / S3)
    S3_ENDPOINT: str = "http://localhost:9000"
    S3_ACCESS_KEY: str = "minioadmin"
    S3_SECRET_KEY: str = "minioadmin"
    S3_BUCKET: str = "cropguard-scans"
    S3_REGION: str = "us-east-1"
    S3_USE_SSL: bool = False

    # Inference Service
    INFERENCE_SERVICE_URL: str = "http://localhost:8001"
    MODEL_VERSION: str = "v1.3.0"

    # CORS
    ALLOWED_ORIGINS: List[str] = Field(
        default=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:80"]
    )

    # External APIs
    NEWS_API_KEY: str = ""
    TRANSLATE_API_KEY: str = ""
    SENTRY_DSN: str = ""

    # Rate Limiting (Token Bucket per IP/user)
    RATE_LIMIT_GLOBAL_PER_MIN: int = 120
    RATE_LIMIT_SCAN_PER_MIN: int = 15


settings = Settings()
