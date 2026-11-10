import os
from typing import List, Union
from pydantic import AnyHttpUrl, field_validator
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "ನನ್ನ ಟೈಲರಿಂಗ್ ಖಾತೆ"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = "development"
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "stitchly-super-secure-production-jwt-secret-key-kannada-tailoring-2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 30  # 30 days
    
    # Database
    # Defaults to local Oracle XE if present, or MySQL if specified
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "oracle+oracledb://system:varudbms@"
    )
    ORACLE_LIB_DIR: str = os.getenv(
        "ORACLE_LIB_DIR", 
        r"C:\app\LENEVO\product\21c\dbhomeXE\bin"
    )

    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "https://my-tailoring-account.vercel.app",
        "*"
    ]

    class Config:
        case_sensitive = True
        env_file = ".env"
        extra = "ignore"

settings = Settings()
